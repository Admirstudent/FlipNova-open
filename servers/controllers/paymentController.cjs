const stripe = require("../config/stripe.cjs");
const clerk = require("../config/clerk.cjs");
const { CLIENT_URL } = require("../config/index.cjs");
const UserProfile = require('../models/UserProfile.cjs');
const {
    swapFreeToPaid,
    incrementPaid,
    incrementFree,      // ✅ added for downgrade
    decrementPaid,      // ✅ added for downgrade
} = require("../services/registrationService.cjs");
const { upgradeToPro } = require("../services/userProfileService.cjs");

// ====================================================================
// 1. Create a Stripe Checkout Session (no simulation!)
// ====================================================================
exports.createCheckoutSession = async (req, res) => {
    try {
        const { clerkUserId, userEmail } = req.body;

        const session = await stripe.checkout.sessions.create({
            customer_email: userEmail,
            client_reference_id: clerkUserId,
            line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
            mode: "subscription",
            success_url: `${CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/pricing`,
            metadata: { clerkUserId },
            subscription_data: { metadata: { clerkUserId } },
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error("Checkout error:", err);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
};

// ====================================================================
// 2. (Optional) Client‑side verification after redirection
// ====================================================================
exports.verifyCheckoutSession = async (req, res) => {
    try {
        const { sessionId, clerkUserId } = req.body;
        if (!sessionId || !clerkUserId)
            return res.status(400).json({ error: "sessionId and clerkUserId required" });

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.client_reference_id !== clerkUserId)
            return res.status(403).json({ error: "Session does not belong to this user" });

        const isPaid =
            session.payment_status === "paid" ||
            session.payment_status === "no_payment_required";

        const subscriptionStatus = isPaid ? "active" : "inactive";
        const plan = isPaid ? "pro" : "free";
        const subscriptionId = session.subscription || null;

        // Update Clerk metadata (mirrors the webhook)
        await clerk.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
                subscriptionStatus,
                plan,
                stripeSubscriptionId: subscriptionId,
            },
        });

        res.json({ subscriptionStatus, plan, subscriptionId });
    } catch (err) {
        console.error("❌ Verify session error:", err);
        res.status(500).json({ error: "Failed to verify session" });
    }
};

// ====================================================================
// 3. Stripe Webhook – the REAL upgrade engine (idempotent!)
// ====================================================================
exports.handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ---------- CHECKOUT COMPLETED ----------
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const clerkUserId = session.client_reference_id;

        if (!clerkUserId) {
            console.warn("No clerkUserId in checkout session");
            return res.json({ received: true });
        }

        try {
            // 1. Fetch current Clerk user to check if they're already Pro
            const user = await clerk.users.getUser(clerkUserId);

            // 2. 🛡️ Idempotency – skip if already active (prevents double‑upgrade)
            if (user.publicMetadata?.subscriptionStatus === "active") {
                console.log(`User ${clerkUserId} is already pro – skipping duplicate webhook`);
                return res.json({ received: true });
            }

            // 3. Update Clerk metadata
            await clerk.users.updateUserMetadata(clerkUserId, {
                publicMetadata: {
                    ...user.publicMetadata,
                    subscriptionStatus: "active",
                    plan: "pro",
                    stripeSubscriptionId: session.subscription,
                },
            });

            // 4. Upgrade the MongoDB UserProfile (sets tier = 'pro', dailyLimit = 25)
            await upgradeToPro(clerkUserId, session.subscription);

            // 5. Adjust registration counters
            const hadFreeSlot = user.publicMetadata?.freeSlotReserved === true;
            if (hadFreeSlot) {
                const result = await swapFreeToPaid();
                if (!result.success) {
                    console.error("Swap failed:", result.reason);
                }
            } else {
                await incrementPaid();
            }

            console.log(`✅ Subscription activated for ${clerkUserId}`);
        } catch (err) {
            console.error("❌ Webhook handler error:", err);
        }
    }

    // ---------- SUBSCRIPTION DELETED (final downgrade) ----------
    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;
        const clerkUserId = subscription.metadata?.clerkUserId;

        if (!clerkUserId) {
            console.warn("No clerkUserId in subscription.deleted event");
            return res.json({ received: true });
        }

        try {
            // 1. Fetch current user state
            const user = await clerk.users.getUser(clerkUserId);

            // 2. Idempotency – only downgrade if still considered Pro
            if (user.publicMetadata?.subscriptionStatus !== 'active') {
                console.log(`User ${clerkUserId} is already not active – skipping downgrade`);
                return res.json({ received: true });
            }

            const profile = await UserProfile.findOne({ clerkUserId });
            if (!profile) {
                console.warn(`No MongoDB profile found for ${clerkUserId}`);
                return res.json({ received: true });
            }

            // 3. Update Clerk metadata to free tier
            await clerk.users.updateUserMetadata(clerkUserId, {
                publicMetadata: {
                    ...user.publicMetadata,
                    subscriptionStatus: 'inactive',
                    plan: 'free',
                    stripeSubscriptionId: null,
                    cancelScheduled: false,
                },
            });

            // 4. Release the paid registration slot
            await decrementPaid();

            // 5. Try to occupy a free slot
            let freeSlotAcquired = false;
            const result = await incrementFree();
            if (result.success) {
                profile.freeSlotReserved = true;
                freeSlotAcquired = true;
            } else {
                profile.freeSlotReserved = false;
            }

            // 6. Downgrade the MongoDB profile
            profile.tier = 'free';
            profile.dailyLimit = 5;
            profile.stripeSubscriptionId = null;
            await profile.save();

            console.log(`✅ Downgraded ${clerkUserId} to free. Free slot: ${freeSlotAcquired}`);
        } catch (err) {
            console.error('❌ Error handling subscription.deleted:', err);
        }

        return res.json({ received: true });
    }

    // (Future) Handle other events like subscription.updated, etc.

    res.json({ received: true });
};

// ====================================================================
// 4. Cancel Subscription – schedule cancellation at period end
// ====================================================================
exports.cancelSubscription = async (req, res) => {
    try {
        const { clerkUserId } = req.body;
        if (!clerkUserId) return res.status(400).json({ error: 'clerkUserId required' });

        const profile = await UserProfile.findOne({ clerkUserId });
        if (!profile || !profile.stripeSubscriptionId) {
            return res.status(404).json({ error: 'No active subscription found' });
        }

        // Tell Stripe to cancel at period end – user keeps Pro until then
        await stripe.subscriptions.update(profile.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });

        // Mark cancellation as scheduled in Clerk metadata (used by frontend only)
        const user = await clerk.users.getUser(clerkUserId);
        await clerk.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
                ...user.publicMetadata,
                cancelScheduled: true,
            },
        });

        console.log(`Cancellation scheduled for ${clerkUserId}`);
        res.json({ message: 'Cancellation scheduled. You will keep Pro access until the end of the billing period.' });
    } catch (err) {
        console.error('Cancel subscription error:', err);
        res.status(500).json({ error: 'Failed to schedule cancellation' });
    }
};
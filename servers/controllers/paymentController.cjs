const stripe = require("../config/stripe.cjs");
const clerk = require("../config/clerk.cjs");
const { CLIENT_URL } = require("../config/index.cjs");
const {
    swapFreeToPaid,
    incrementPaid,
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

        // Only return the Stripe URL – the user hasn't paid yet!
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
// 3. Stripe Webhook – the REAL upgrade engine
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
            // 1. Fetch current Clerk user to know if they had a free slot
            const user = await clerk.users.getUser(clerkUserId);

            // 2. Update Clerk metadata
            await clerk.users.updateUserMetadata(clerkUserId, {
                publicMetadata: {
                    ...user.publicMetadata,
                    subscriptionStatus: "active",
                    plan: "pro",
                    stripeSubscriptionId: session.subscription,
                },
            });

            // 3. Upgrade the MongoDB UserProfile (sets tier = 'pro', dailyLimit = 25)
            await upgradeToPro(clerkUserId, session.subscription);

            // 4. Adjust registration counters
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

    // (Future) Handle other events like subscription.updated, subscription.deleted
    // if (event.type === 'customer.subscription.updated') { ... }
    // if (event.type === 'customer.subscription.deleted') { ... }

    res.json({ received: true });
};
const stripe = require("../config/stripe.cjs");
const clerk = require("../config/clerk.cjs");
const { CLIENT_URL } = require("../config/index.cjs");

const { swapFreeToPaid, incrementPaid } = require('../services/registrationService.cjs');
const { upgradeToPro } = require('../services/userProfileService.cjs');

exports.createCheckoutSession = async (req, res) => {
    try {
        const { clerkUserId, userEmail } = req.body;

        const session = await stripe.checkout.sessions.create({
            customer_email: userEmail,
            client_reference_id: clerkUserId,
            line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }], // use env var
            mode: "subscription",
            success_url: `${CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/pricing`,
            metadata: { clerkUserId },
            subscription_data: { metadata: { clerkUserId } },
        });

        res.json({ url: session.url });

        // ⚠️ Simulation only – REMOVE before production!
        try {
            const subscriptionStatus = 'active';
            const plan = 'pro';
            const subscriptionId = session.subscription || 'simulated_sub_id';

            // 1. Fetch the Clerk user so we can read its current metadata
            const user = await clerk.users.getUser(clerkUserId);

            // 2. Update Clerk metadata (merge old publicMetadata with new fields)
            await clerk.users.updateUserMetadata(clerkUserId, {
                publicMetadata: {
                    ...user.publicMetadata,
                    subscriptionStatus,
                    plan,
                    stripeSubscriptionId: subscriptionId,
                },
            });

            // upgrade to pro on MongoDB side
            await upgradeToPro(clerkUserId, session.subscription || 'simulated_sub_id');

            // 3. Adjust registration counters based on whether the user had a free slot
            const hadFreeSlot = user.publicMetadata?.freeSlotReserved === true;

            if (hadFreeSlot) {
                // They used a free slot → swap from free to paid
                const result = await swapFreeToPaid();
                if (!result.success) {
                    console.error('Swap failed:', result.reason);
                }
            } else {
                // No free slot → just add to the paid counter
                await incrementPaid();
            }

            console.log('✅ Simulated upgrade complete');
        } catch (err) {
            console.error('❌ Simulated upgrade error:', err);
        }
        // ------------------------------------------------------------------
    } catch (err) {
        console.error("Checkout error:", err);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
};

exports.verifyCheckoutSession = async (req, res) => {
    try {
        const { sessionId, clerkUserId } = req.body;
        if (!sessionId || !clerkUserId)
            return res.status(400).json({ error: "sessionId and clerkUserId required" });

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.client_reference_id !== clerkUserId)
            return res.status(403).json({ error: "Session does not belong to this user" });

        const isPaid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
        const subscriptionStatus = isPaid ? "active" : "inactive";
        const plan = isPaid ? "pro" : "free";
        const subscriptionId = session.subscription || null;

        await clerk.users.updateUserMetadata(clerkUserId, {
            publicMetadata: { subscriptionStatus, plan, stripeSubscriptionId: subscriptionId },
        });

        res.json({ subscriptionStatus, plan, subscriptionId });
    } catch (err) {
        console.error("❌ Verify session error:", err);
        res.status(500).json({ error: "Failed to verify session" });
    }
};

exports.handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const clerkUserId = session.client_reference_id;
        if (clerkUserId) {
            await clerk.users.updateUserMetadata(clerkUserId, {
                publicMetadata: {
                    subscriptionStatus: "active",
                    plan: "pro",
                    stripeSubscriptionId: session.subscription,
                },
            });
            console.log(`✅ Subscription activated for ${clerkUserId}`);

            // Move user from free to paid in the counter
            const swapResult = await swapFreeToPaid();
            if (!swapResult.success) {
                console.error('Swap failed:', swapResult.reason);
            }
        }
    }

    res.json({ received: true });
};
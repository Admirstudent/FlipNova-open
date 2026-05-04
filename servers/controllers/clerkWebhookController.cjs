const clerk = require('../config/clerk.cjs');
const stripe = require('../config/stripe.cjs');
const UserProfile = require('../models/UserProfile.cjs');
const {
  incrementFree,
  decrementFree,
  decrementPaid,
} = require('../services/registrationService.cjs');

exports.handleClerkWebhook = async (req, res) => {
  try {
    // Verify the webhook signature
    const event = await clerk.webhooks.verifyWebhookSignature(
      req.body,
      req.headers['svix-id'],
      req.headers['svix-timestamp'],
      req.headers['svix-signature'],
      process.env.CLERK_WEBHOOK_SECRET
    );

    // ---------- USER CREATED ----------
    if (event.type === 'user.created') {
      const user = event.data;
      const clerkUserId = user.id;

      // Create a free‑tier profile
      const profile = new UserProfile({
        clerkUserId,
        tier: 'free',
        dailyLimit: 5,
        freeSlotReserved: false,
      });

      // Try to occupy a free slot globally
      const result = await incrementFree();
      if (result.success) {
        profile.freeSlotReserved = true;
      }
      // If capacity is full, profile is still created but without a slot.
      // The user can upgrade, or you could block them later.

      await profile.save();
      console.log(`Profile created for ${clerkUserId}, slot reserved: ${profile.freeSlotReserved}`);
    }

    // ---------- USER DELETED ----------
    if (event.type === 'user.deleted') {
      const user = event.data;
      const isPro = user.publicMetadata?.subscriptionStatus === 'active';
      const stripeSubscriptionId = user.publicMetadata?.stripeSubscriptionId;

      // 1. Cancel Stripe subscription if Pro
      if (isPro && stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(stripeSubscriptionId);
          console.log(`Subscription ${stripeSubscriptionId} cancelled for deleted user ${user.id}`);
        } catch (stripeErr) {
          console.error(`Failed to cancel subscription ${stripeSubscriptionId}:`, stripeErr.message);
        }
      }

      // 2. Release the occupied registration slot
      if (isPro) {
        await decrementPaid();
        console.log(`Paid slot released for deleted user ${user.id}`);
      } else if (user.publicMetadata?.freeSlotReserved) {
        await decrementFree();
        console.log(`Free slot released for deleted user ${user.id}`);
      }

      // 3. Optionally delete the MongoDB UserProfile (cleanup)
      await UserProfile.deleteOne({ clerkUserId: user.id });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Clerk webhook error:', err);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
};
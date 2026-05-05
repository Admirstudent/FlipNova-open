const { Webhook } = require('svix');
const stripe = require('../config/stripe.cjs');
const UserProfile = require('../models/UserProfile.cjs');
const clerk = require('../config/clerk.cjs');

const {
  incrementFree,
  decrementFree,
  decrementPaid,
} = require('../services/registrationService.cjs');

exports.handleClerkWebhook = async (req, res) => {
  try {
    const payload = req.body;          // raw body Buffer
    const headers = req.headers;

    // Verify the webhook signature using Svix
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const event = wh.verify(payload, {
      'svix-id': headers['svix-id'],
      'svix-timestamp': headers['svix-timestamp'],
      'svix-signature': headers['svix-signature'],
    });

    // ---------- USER CREATED ----------
    if (event.type === 'user.created') {
      const user = event.data;
      const clerkUserId = user.id;

      const profile = new UserProfile({
        clerkUserId,
        tier: 'free',
        dailyLimit: 5,
        freeSlotReserved: false,
      });

      const result = await incrementFree();
      if (result.success) {
        profile.freeSlotReserved = true;
      }

      await profile.save();

      // ✅ Sync the flag to Clerk so the Stripe webhook can see it
      await clerk.users.updateUserMetadata(clerkUserId, {
        publicMetadata: { freeSlotReserved: profile.freeSlotReserved },
      });

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

      // 3. Clean up the MongoDB profile
      await UserProfile.deleteOne({ clerkUserId: user.id });
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Clerk webhook error:', err);
    res.status(400).json({ error: 'Webhook verification failed' });
  }
};
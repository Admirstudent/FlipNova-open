const UserProfile = require('../models/UserProfile.cjs');

async function registerFreeUser(req, res, next) {
  const clerkUserId = req.body.clerkUserId || req.query.clerkUserId;
  if (!clerkUserId) return next();

  try {
    const profile = await UserProfile.findOne({ clerkUserId });

    // If no profile (webhook not yet processed) – still allow, but log it
    if (!profile) {
      console.warn(`Profile missing for ${clerkUserId}, allowing request`);
      return next();
    }

    // Pro users always allowed
    if (profile.tier === 'pro') return next();

    // Free user – must have reserved a slot
    if (!profile.freeSlotReserved) {
      return res.status(403).json({
        error: 'FREE_CAPACITY_FULL',
        message: 'Free tier is at capacity. Please upgrade to Pro.',
      });
    }

    next();
  } catch (err) {
    console.error('registerFreeUser error:', err);
    next();
  }
}

module.exports = registerFreeUser;
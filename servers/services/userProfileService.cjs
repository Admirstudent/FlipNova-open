const UserProfile = require('../models/UserProfile.cjs');

const FREE_ANALYSES = 5;
const PRO_ANALYSES = 25;

// Create or fetch a user profile – called on first visit
async function getOrCreateProfile(clerkUserId) {
    let profile = await UserProfile.findOne({ clerkUserId });
    if (!profile) {
        profile = await UserProfile.create({
            clerkUserId,
            tier: 'free',
            dailyLimit: FREE_ANALYSES,
        });
    }
    return profile;
}

// Upgrade user to pro
async function upgradeToPro(clerkUserId, stripeSubscriptionId) {
    return UserProfile.findOneAndUpdate(
        { clerkUserId },
        {
            tier: 'pro',
            dailyLimit: PRO_ANALYSES,
            stripeSubscriptionId,
            updatedAt: new Date(),
        },
        { new: true }
    );
}

// Downgrade / cancel (if needed)
async function downgradeToFree(clerkUserId) {
    return UserProfile.findOneAndUpdate(
        { clerkUserId },
        {
            tier: 'free',
            dailyLimit: FREE_ANALYSES,
            stripeSubscriptionId: null,
            updatedAt: new Date(),
        },
        { new: true }
    );
}

module.exports = { getOrCreateProfile, upgradeToPro, downgradeToFree, FREE_ANALYSES, PRO_ANALYSES };
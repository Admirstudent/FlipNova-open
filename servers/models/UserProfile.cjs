const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    clerkUserId: { type: String, required: true, unique: true },
    tier: { type: String, enum: ['free', 'pro'], default: 'free' },
    dailyLimit: { type: Number, default: 5 },          // 5 for free, 25 for pro
    freeSlotReserved: { type: Boolean, default: false },
    stripeSubscriptionId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
const RegistrationCounter = require('../models/RegistrationCounter.cjs');
const { MAX_FREE_USERS, MAX_PAID_USERS } = require('../config/index.cjs');

// Ensure the singleton document exists when the server starts
async function initCounter() {
    await RegistrationCounter.findOneAndUpdate(
        { _id: 'singleton' },
        { $setOnInsert: { freeCount: 0, paidCount: 0 } },
        { upsert: true, returnDocument: 'after' }
    );
}

// Get current counts
async function getCounts() {
    const doc = await RegistrationCounter.findById('singleton');
    if (!doc) {
        // fallback: create one
        return { freeCount: 0, paidCount: 0 };
    }
    return { freeCount: doc.freeCount, paidCount: doc.paidCount };
}

// Atomically increment free count if under limit – returns { success, counts }
async function incrementFree() {
    const doc = await RegistrationCounter.findOneAndUpdate(
        { _id: 'singleton', freeCount: { $lt: MAX_FREE_USERS } },
        { $inc: { freeCount: 1 } },
        { returnDocument: 'after' }
    );
    if (!doc) {
        // limit reached or document missing
        const current = await RegistrationCounter.findById('singleton');
        return { success: false, counts: current ? { free: current.freeCount, paid: current.paidCount } : { free: 0, paid: 0 } };
    }
    return { success: true, counts: { free: doc.freeCount, paid: doc.paidCount } };
}

// Atomically increment paid count if under limit – returns { success, counts }
async function incrementPaid() {
    const doc = await RegistrationCounter.findOneAndUpdate(
        { _id: 'singleton', paidCount: { $lt: MAX_PAID_USERS } },
        { $inc: { paidCount: 1 } },
        { returnDocument: 'after' }
    );
    if (!doc) {
        const current = await RegistrationCounter.findById('singleton');
        return { success: false, counts: current ? { free: current.freeCount, paid: current.paidCount } : { free: 0, paid: 0 } };
    }
    return { success: true, counts: { free: doc.freeCount, paid: doc.paidCount } };
}

// Decrement free count (when a free user upgrades to paid)
async function decrementFree() {
    await RegistrationCounter.findByIdAndUpdate('singleton', { $inc: { freeCount: -1 } });
}

async function decrementPaid() {
    await RegistrationCounter.findByIdAndUpdate('singleton', { $inc: { paidCount: -1 } });
}

// Swap a user from free to paid (one atomic operation)
async function swapFreeToPaid() {
    const doc = await RegistrationCounter.findById('singleton');
    if (!doc) return { success: false };
    if (doc.freeCount <= 0) return { success: false, reason: 'no free users to swap' };
    if (doc.paidCount >= MAX_PAID_USERS) return { success: false, reason: 'paid capacity full' };
    await RegistrationCounter.findByIdAndUpdate('singleton', {
        $inc: { freeCount: -1, paidCount: 1 }
    });
    return { success: true };
}

module.exports = { initCounter, getCounts, incrementFree, incrementPaid, decrementFree, swapFreeToPaid };
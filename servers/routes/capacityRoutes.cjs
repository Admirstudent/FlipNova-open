const express = require('express');
const router = express.Router();
const { getCounts } = require('../services/registrationService.cjs');
const { MAX_FREE_USERS, MAX_PAID_USERS } = require('../config/index.cjs');

router.get('/capacity', async (req, res) => {
    try {
        const { freeCount, paidCount } = await getCounts();
        res.json({
            freeAvailable: freeCount < MAX_FREE_USERS,
            freeCount,
            freeMax: MAX_FREE_USERS,
            paidAvailable: paidCount < MAX_PAID_USERS,
            paidCount,
            paidMax: MAX_PAID_USERS,
        });
    } catch (err) {
        console.error('Capacity check error:', err);
        res.status(500).json({ error: 'Failed to check capacity' });
    }
});

module.exports = router;
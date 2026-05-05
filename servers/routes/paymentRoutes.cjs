const express = require("express");
const router = express.Router();
const {
    createCheckoutSession,
    verifyCheckoutSession,
    handleWebhook,
    cancelSubscription
} = require("../controllers/paymentController.cjs");

// These use JSON body (parsed by global middleware)
router.post("/create-checkout-session", createCheckoutSession);
router.post("/verify-checkout-session", verifyCheckoutSession);
router.post('/cancel-subscription', cancelSubscription);

// Webhook must be exported separately because it needs raw body
module.exports = router;
module.exports.webhookHandler = handleWebhook;
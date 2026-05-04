const express = require("express");
const router = express.Router();
const {
    createCheckoutSession,
    verifyCheckoutSession,
    handleWebhook,
} = require("../controllers/paymentController.cjs");

// These use JSON body (parsed by global middleware)
router.post("/create-checkout-session", createCheckoutSession);
router.post("/verify-checkout-session", verifyCheckoutSession);

// Webhook must be exported separately because it needs raw body
module.exports = router;
module.exports.webhookHandler = handleWebhook;
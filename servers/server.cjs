// Load .env from project root (one level above servers/)
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const connectDB = require("./config/db.cjs");
const globalMiddleware = require("./middleware/global.cjs");
const analyzeRoutes = require("./routes/analyzeRoutes.cjs");
const paymentRoutes = require("./routes/paymentRoutes.cjs");
const { webhookHandler } = require("./routes/paymentRoutes.cjs"); // webhook handler
const { healthCheck } = require("./controllers/healthController.cjs");
const { initCounter } = require('./services/registrationService.cjs');
const { handleClerkWebhook } = require('./controllers/clerkWebhookController.cjs');


// Hard‑fail early if critical env vars missing
const { MONGO_URI, EBAY_CLIENT_ID, EBAY_CLIENT_SECRET } = require("./config/index.cjs");
if (!MONGO_URI) {
    console.error("FATAL: MONGO_URI required.");
    process.exit(1);
}
if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
    console.error("FATAL: EBAY credentials required.");
    process.exit(1);
}

const app = express(); 

app.post(
  '/clerk-webhook',
  express.raw({ type: 'application/json' }),
  handleClerkWebhook
);

// Stripe webhook MUST come before JSON parsing (raw body)
app.post(
    "/stripe-webhook",
    express.raw({ type: "application/json" }),
    webhookHandler
);

// Apply global middleware (including JSON parser)
globalMiddleware(app);

// Routes
app.get("/health", healthCheck);
app.use("/api", analyzeRoutes);
app.use("/", paymentRoutes); // /create-checkout-session, /verify-checkout-session

// Start
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
    const server = app.listen(PORT, async () => {
        await initCounter();   // ensures singleton doc exists
        console.log(`Server listening on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
        console.log(`\n${signal} received. Shutting down...`);
        server.close(() => console.log("HTTP server closed."));
        const mongoose = require("mongoose");
        await mongoose.connection.close(false);
        process.exit(0);
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
});
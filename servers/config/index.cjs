// Each analysis now uses exactly 1 eBay API call (active-only).
// Total API budget: 5000 calls/month. Split 60/40 between free/paid.
const FREE_ANALYSES_POOL = 3000;
const PAID_ANALYSES_POOL = 2000;
const FREE_PER_USER_LIMIT = 5;
const PAID_PER_USER_LIMIT = 25;
const MAX_FREE_USERS = Math.floor(FREE_ANALYSES_POOL / FREE_PER_USER_LIMIT);   // 600
const MAX_PAID_USERS = Math.floor(PAID_ANALYSES_POOL / PAID_PER_USER_LIMIT);   // 80

module.exports = {
    PORT: process.env.PORT || 4000,
    MONGO_URI: process.env.MONGO_URI,
    DB_NAME: process.env.DB_NAME || "cluster0_Orion_production",
    CLIENT_URL: process.env.CLIENT_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    EBAY_CLIENT_ID: process.env.EBAY_CLIENT_ID,
    EBAY_CLIENT_SECRET: process.env.EBAY_CLIENT_SECRET,
    EBAY_ENVIRONMENT: (process.env.EBAY_ENVIRONMENT || "sandbox").toLowerCase(),
    PROCESSOR_URL: process.env.PROCESSOR_URL || "http://localhost:8000",
    MAX_FREE_USERS,
    MAX_PAID_USERS,
};
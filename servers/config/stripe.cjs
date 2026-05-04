const Stripe = require("stripe");
const { STRIPE_SECRET_KEY } = require("./index.cjs");

module.exports = new Stripe(STRIPE_SECRET_KEY);
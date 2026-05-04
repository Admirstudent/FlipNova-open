const { Clerk } = require("@clerk/clerk-sdk-node");
const { CLERK_SECRET_KEY } = require("./index.cjs");

module.exports = new Clerk({ secretKey: CLERK_SECRET_KEY });
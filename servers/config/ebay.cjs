const { EBAY_CLIENT_ID, EBAY_CLIENT_SECRET, EBAY_ENVIRONMENT } = require("./index.cjs");

const BASE64 = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString("base64");

const AUTH_URL =
  EBAY_ENVIRONMENT === "production"
    ? "https://api.ebay.com/identity/v1/oauth2/token"
    : "https://api.sandbox.ebay.com/identity/v1/oauth2/token";

const BROWSE_HOST =
  EBAY_ENVIRONMENT === "production"
    ? "https://api.ebay.com/buy/browse/v1"
    : "https://api.sandbox.ebay.com/buy/browse/v1";

module.exports = { BASE64, AUTH_URL, BROWSE_HOST };
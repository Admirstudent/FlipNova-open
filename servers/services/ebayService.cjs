const axios = require("axios");
const { BASE64, AUTH_URL, BROWSE_HOST } = require("../config/ebay.cjs");

let cachedToken = null;
let tokenExpiresAt = 0;

async function getApplicationToken() {
    if (cachedToken && Date.now() < tokenExpiresAt - 5 * 60 * 1000) {
        console.log("Using cached eBay token.");
        return cachedToken;
    }

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("scope", "https://api.ebay.com/oauth/api_scope");

    try {
        const res = await axios.post(AUTH_URL, params, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${BASE64}`,
            },
        });
        cachedToken = res.data.access_token;
        const expiresIn = res.data.expires_in || 7200;
        tokenExpiresAt = Date.now() + expiresIn * 1000;
        console.log("New eBay token acquired.");
        return cachedToken;
    } catch (err) {
        console.error("OAUTH_ERROR:", err.response?.data || err.message);
        return null;
    }
}

async function fetchActiveListings(searchQuery) {
    const url = `${BROWSE_HOST}/item_summary/search?q=${encodeURIComponent(searchQuery)}&limit=200`;
    const token = await getApplicationToken();
    if (!token) throw new Error("EBAY_AUTH_FAILED");
    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Language": "en-US",
                "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
            },
        });
        if (!res.ok) throw new Error(`Active search failed: ${res.status}`);
        const data = await res.json();
        return data.itemSummaries || [];
    } catch (err) {
        console.error("Active search error:", err.message);
        return [];
    }
}

async function fetchSoldListings(searchQuery) {
    const url = `${BROWSE_HOST}/item_summary/search?q=${encodeURIComponent(searchQuery)}&limit=200&filter=soldItemsOnly:true`;
    const token = await getApplicationToken();
    if (!token) throw new Error("EBAY_AUTH_FAILED");
    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Language": "en-US",
                "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
            },
        });
        if (!res.ok) throw new Error(`Sold search failed: ${res.status}`);
        const data = await res.json();
        return data.itemSummaries || [];
    } catch (err) {
        console.error("Sold search error:", err.message);
        return [];
    }
}

module.exports = { fetchActiveListings, fetchSoldListings };
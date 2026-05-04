const axios = require("axios");
const { PROCESSOR_URL } = require("../config/index.cjs");

async function processMarketData(payload) {
    try {
        console.log("Sending to FastAPI:", JSON.stringify(payload, null, 2));
        console.log(PROCESSOR_URL + "/v1/analyze");
        const response = await axios.post(PROCESSOR_URL + "/v1/analyze", payload);
        return response.data;
    } catch (error) {
        console.error("Processor communication failed:", error.message);
        throw new Error("ANALYTICS_BRIDGE_FAILURE");
    }
}

module.exports = processMarketData;
const { fetchActiveListings, fetchSoldListings } = require("../services/ebayService.cjs");
const processMarketData = require("../services/marketProcessor.cjs");

exports.analyze = async (req, res) => {
    // Add near the top of the file
    const AnalysisRecord = require('../models/AnalysisRecord.cjs');
    const Usage = require('../models/Usage.cjs');

    // Inside the analyze function, right before res.json(processorResponse)
    try {
        const today = new Date().toISOString().slice(0, 10);

        // 1. Save the analysis record
        await AnalysisRecord.create({
            clerkUserId: req.body.clerkUserId,
            searchQuery: req.body.searchQuery,
            sellThroughRate: processorResponse.summary?.sell_through_rate || 0,
            category: processorResponse.summary?.top_category || 'Unknown',
            marketSnapshot: processorResponse,
        });

        // 2. Increment daily usage
        await Usage.findOneAndUpdate(
            { clerkUserId: req.body.clerkUserId, date: today },
            { $inc: { count: 1 } },
            { upsert: true }
        );
    } catch (err) {
        console.error('Failed to save analysis record:', err);
    }
    
    try {
        const { searchQuery } = req.body;

        if (!searchQuery || typeof searchQuery !== "string" || !searchQuery.trim()) {
            return res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "searchQuery required." });
        }

        console.log("Received query:", searchQuery);

        const [activeItems, soldItems] = await Promise.all([
            fetchActiveListings(searchQuery),
            fetchSoldListings(searchQuery),
        ]);

        if (activeItems.length === 0 && soldItems.length === 0) {
            return res.json({ error: "EMPTY_DATASET", status: 404, message: "No listings found." });
        }

        const payload = {
            active: activeItems,
            sold: soldItems,
            activeCount: activeItems.length,
            soldCount: soldItems.length,
        };

        const processorResponse = await processMarketData(payload);
        return res.json(processorResponse);
    } catch (err) {
        console.error("Unhandled error in /api/analyze:", err);
        res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: "Unexpected error." });
    }
};
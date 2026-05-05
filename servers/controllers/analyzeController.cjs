const AnalysisRecord = require('../models/AnalysisRecord.cjs');
const Usage = require('../models/Usage.cjs');
const { fetchActiveListings, fetchSoldListings } = require("../services/ebayService.cjs");
const processMarketData = require("../services/marketProcessor.cjs");

exports.analyze = async (req, res) => {
  try {
    const { searchQuery, clerkUserId } = req.body;

    if (!searchQuery || typeof searchQuery !== "string" || !searchQuery.trim()) {
      return res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "searchQuery required." });
    }

    console.log("Received query:", searchQuery, "for user:", clerkUserId);

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

    // ---------- Save the record & increment usage ----------
    try {
      const today = new Date().toISOString().slice(0, 10);

      await AnalysisRecord.create({
        clerkUserId,
        searchQuery,
        sellThroughRate: processorResponse.summary?.sell_through_rate || 0,
        category: processorResponse.summary?.top_category || 'Unknown',
        marketSnapshot: processorResponse,
      });

      await Usage.findOneAndUpdate(
        { clerkUserId, date: today },
        { $inc: { count: 1 } },
        { upsert: true }
      );
      console.log(`Analysis saved for ${clerkUserId}`);
    } catch (err) {
      console.error('Failed to save analysis record:', err);
      // The analysis still succeeded, so we return the data
    }

    return res.json(processorResponse);
  } catch (err) {
    console.error("Unhandled error in /api/analyze:", err);
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: "Unexpected error." });
  }
};
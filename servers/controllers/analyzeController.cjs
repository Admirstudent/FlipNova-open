const UserProfile = require('../models/UserProfile.cjs');
const AnalysisRecord = require('../models/AnalysisRecord.cjs');
const Usage = require('../models/Usage.cjs');
const { fetchActiveListings, fetchSoldListings } = require("../services/ebayService.cjs");
const processMarketData = require("../services/marketProcessor.cjs");

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

exports.analyze = async (req, res) => {
  try {
    const { searchQuery, clerkUserId } = req.body;

    if (!searchQuery || typeof searchQuery !== "string" || !searchQuery.trim()) {
      return res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "searchQuery required." });
    }

    console.log("Received query:", searchQuery, "for user:", clerkUserId);

    // ---------- 1. Check daily usage limit ----------
    let profile = await UserProfile.findOne({ clerkUserId });
    if (!profile) {
      // Fallback: create a free profile if none exists (shouldn't happen normally)
      profile = await UserProfile.create({
        clerkUserId,
        tier: 'free',
        dailyLimit: 5,
        freeSlotReserved: false, // will be set later if needed
      });
      console.log(`Created missing profile for ${clerkUserId}`);
    }

    const today = getToday();
    const todayUsage = await Usage.findOne({ clerkUserId, date: today });
    const usedToday = todayUsage?.count || 0;

    if (usedToday >= profile.dailyLimit) {
      return res.status(429).json({
        error: "DAILY_LIMIT_REACHED",
        message: `You've reached your daily limit of ${profile.dailyLimit} analyses. Upgrade to Pro or try again tomorrow.`,
      });
    }

    // ---------- 2. Fetch listings and run analysis ----------
    const [activeResult, soldResult] = await Promise.all([
      fetchActiveListings(searchQuery),
      fetchSoldListings(searchQuery),
    ]);

    const activeItems = activeResult.items;
    const soldItems = soldResult.items;
    const activeTotal = activeResult.total;
    const soldTotal = soldResult.total;

    if (activeTotal === 0 && soldTotal === 0) {
      return res.json({ error: "EMPTY_DATASET", status: 404, message: "No listings found." });
    }

    const payload = {
      active: activeItems,
      sold: soldItems,
      activeCount: activeTotal,
      soldCount: soldTotal,
    };

    const processorResponse = await processMarketData(payload);

    // ---------- 3. Save record & increment usage ----------
    try {
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
      // still return the data – analysis itself succeeded
    }

    return res.json(processorResponse);
  } catch (err) {
    console.error("Unhandled error in /api/analyze:", err);
    res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: "Unexpected error." });
  }
};
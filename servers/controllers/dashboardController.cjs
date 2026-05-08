const UserProfile = require('../models/UserProfile.cjs');
const AnalysisRecord = require('../models/AnalysisRecord.cjs');
const Usage = require('../models/Usage.cjs');

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

exports.getDashboardStats = async (req, res) => {
  try {
    const clerkUserId = req.query.clerkUserId;
    if (!clerkUserId) return res.status(400).json({ error: 'clerkUserId required' });

    // 1. Get user profile (tier + limit)
    const profile = await UserProfile.findOne({ clerkUserId });
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found. Please run an analysis first.' });
    }

    const maxAnalyses = profile.dailyLimit;  // 5 or 25

    // 2. Today's usage
    const today = getToday();
    const todayUsage = await Usage.findOne({ clerkUserId, date: today });
    const searchesToday = todayUsage?.count || 0;

    // 3. All analyses (newest first)
    const allAnalyses = await AnalysisRecord.find({ clerkUserId })
      .sort({ date: -1 })
      .lean();

    // 4. Average sell‑through rate
    const rates = allAnalyses.map(a => a.sellThroughRate).filter(v => v != null);
    const avgSellThrough = rates.length
      ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
      : 0;

    // 5. Top categories
    const categoryCounts = {};
    allAnalyses.forEach(a => {
      if (a.category) {
        categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
      }
    });
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories[0]?.[0] || 'None';
    const categoryDistribution = sortedCategories.slice(0, 5).map(([name, count]) => ({ name, count }));

    // 6. Sell‑through history (last 5, chronological)
    const sellThroughHistory = allAnalyses
      .slice(0, 5)
      .map(a => a.sellThroughRate || 0)
      .reverse();

    // 7. Saved analyses count
    const savedAnalyses = allAnalyses.filter(a => a.saved).length;

    // 8. Recent searches (last 10)
    const recentSearches = allAnalyses.slice(0, 10).map(analysis => {
      const snap = analysis.marketSnapshot || {};
      return {
        id: analysis._id.toString(),            // ← add this line
        saved: analysis.saved || false,         // ← ensure this is present
        product: analysis.searchQuery,
        date: analysis.date,
        sellThrough: analysis.sellThroughRate,
        medianPrice: snap.results?.median || snap.pricing?.median || 0,
        signal: snap.results?.market_condition || snap.decision?.signal || 'N/A',
        confidence: snap.summary?.confidence || snap.decision?.confidence || 0,
        snapshot: analysis.marketSnapshot,
        searchQuery: analysis.searchQuery,
      };
    });

    // 9. Raw snapshots for histogram
    const snapshots = allAnalyses
      .slice(0, 50)
      .map(a => a.marketSnapshot)
      .filter(Boolean);

    res.json({
      searchesToday,
      maxSearches: maxAnalyses,
      avgSellThrough,
      topCategory,
      savedAnalyses,
      categoryDistribution,
      sellThroughHistory,
      recentSearches,
      snapshots,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
};

exports.toggleSaved = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const record = await AnalysisRecord.findById(analysisId);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    record.saved = !record.saved;
    await record.save();

    res.json({ saved: record.saved });
  } catch (err) {
    console.error('Toggle saved error:', err);
    res.status(500).json({ error: 'Failed to toggle saved' });
  }
};
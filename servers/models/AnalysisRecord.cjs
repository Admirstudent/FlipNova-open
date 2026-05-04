const mongoose = require('mongoose');

const analysisRecordSchema = new mongoose.Schema({
    clerkUserId: { type: String, required: true, index: true },
    searchQuery: String,
    date: { type: Date, default: Date.now },
    sellThroughRate: { type: Number, default: 0 },
    category: { type: String, default: 'Unknown' },
    marketSnapshot: mongoose.Schema.Types.Mixed,   // the whole result
    saved: { type: Boolean, default: false },
});

analysisRecordSchema.index({ clerkUserId: 1, date: -1 });

module.exports = mongoose.model('AnalysisRecord', analysisRecordSchema);
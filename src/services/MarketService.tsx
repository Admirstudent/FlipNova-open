import axios from "axios";

// data types
import { type MarketSnapshot } from "../types/market";

export const ProductSearchAnalysis = async (searchQuery: string, clerkUserId: string): Promise<MarketSnapshot> => {
    const { data } = await axios.post("http://localhost:4500/api/analyze", { searchQuery, clerkUserId });

    const { summary, results } = data; // destructure the known response

    // Transform into the frontend model
    const snapshot: MarketSnapshot = {
        productName: searchQuery,
        region: "United States",
        lastUpdated: new Date().toISOString(),
        sampleSize: summary.raw_count,

        pricing: {
            min: results.floor,
            max: results.ceiling,
            median: results.median,
            p25: results.p25,
            p75: results.p75,
            fillPercentage: 0, // placeholder – not yet provided by processor
        },

        demand: {
            sellThroughRate: summary.sell_through_rate,
            activityLevel: summary.activity_level,
        },

        competition: {
            activeListings: summary.active_listings,
            soldListings: summary.sold_listings,
            level: summary.competition_level,
            ratio:
                summary.sold_listings > 0
                    ? +(summary.active_listings / summary.sold_listings).toFixed(1)
                    : 0,
        },

        market: {
            velocity: summary.market_velocity,
            varianceIndex: summary.variance_index,
        },

        decision: {
            signal: results.market_condition,
            confidence: summary.confidence,
        },

        metadata: {
            rawCount: summary.raw_count,
            refinedCount: summary.refined_count,
            source: "ebay",
        },
    };

    return snapshot;
};
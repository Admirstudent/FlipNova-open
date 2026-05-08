// src/lib/transformSnapshot.ts
import type { MarketSnapshot } from "@/types/market";

export function transformProcessorResponse(data: any, searchQuery: string): MarketSnapshot {
    const { summary, results } = data;
    return {
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
            fillPercentage: 0,
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
}
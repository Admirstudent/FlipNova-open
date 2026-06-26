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
        competition: {
            activeListings: summary.active_listings,
            level: summary.competition_level,
            saturation: summary.market_saturation || "Unknown",
        },
        volatility: {
            priceVolatility: summary.price_volatility || "Low",
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

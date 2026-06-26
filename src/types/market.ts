export interface MarketSnapshot {
  productName: string;
  region: string;
  lastUpdated: string;
  sampleSize: number;
  pricing: {
    min: number;
    max: number;
    median: number;
    p25: number;
    p75: number;
    fillPercentage: number;
  };
  competition: {
    activeListings: number;
    level: string;
    saturation: string;
  };
  volatility: {
    priceVolatility: string;
    varianceIndex: number;
  };
  decision: {
    signal: string;
    confidence: number;
  };
  metadata: {
    rawCount: number;
    refinedCount: number;
    source: string;
  };
}

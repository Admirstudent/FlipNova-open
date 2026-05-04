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
  demand: {
    sellThroughRate: number;
    activityLevel: string;
  };
  competition: {
    activeListings: number;
    soldListings: number;
    level: string;
    ratio: number;
  };
  market: {
    velocity: string;
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
import type { MarketSnapshot } from "../types/market";

export interface PriceBucket {
  range: string;
  count: number;
}

export function buildPriceDistribution(
  snapshots: MarketSnapshot[],
  bucketCount = 60
): PriceBucket[] {
  if (!snapshots.length) return [];

  const medians = snapshots
    .map((s) => s.pricing.median)
    .sort((a, b) => a - b);

  const min = medians[0];
  const max = medians[medians.length - 1];
  const step = (max - min) / bucketCount || 1;

  const buckets: PriceBucket[] = Array.from({ length: bucketCount }, (_, i) => {
    const low = Math.floor(min + i * step);
    const high = Math.floor(min + (i + 1) * step);
    return {
      range: `$${low}‑${high}`,
      count: 0,
    };
  });

  medians.forEach((p) => {
    const idx = Math.min(
      Math.floor((p - min) / step),
      bucketCount - 1
    );
    buckets[idx].count++;
  });

  return buckets.filter((b) => b.count > 0);
}
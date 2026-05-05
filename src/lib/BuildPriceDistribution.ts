// src/lib/BuildPriceDistribution.ts
export interface PriceBucket {
  range: string;
  count: number;
}

/**
 * Builds price distribution buckets from an array of processor response objects
 * (each containing results.median) OR frontend MarketSnapshot objects (pricing.median).
 */
export function buildPriceDistribution(
  snapshots: any[],   // accept raw processor responses (from dashboard endpoint)
  bucketCount = 60
): PriceBucket[] {
  if (!snapshots || !snapshots.length) return [];

  // Read median from either location (raw response or typed snapshot)
  const medians = snapshots
    .map((s) => s?.results?.median ?? s?.pricing?.median ?? 0)
    .filter((m) => m > 0)   // ignore zero/undefined values
    .sort((a, b) => a - b);

  if (medians.length === 0) return [];

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
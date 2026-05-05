import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

// ui components
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ActionButton from "@/components/ActionButton";

// services
import { ProductSearchAnalysis } from "../services/MarketService";

export default function MarketSnapshotPage() {
    const { user } = useUser();
  
  // product data default state
  const [inputValue, setInputValue] = useState("Drone");

  // loading state
  const [loading, setLoading] = useState(false);

  // Static ProductData
  const [product, setProduct] = useState(
    {
      productName: "DJI Mini 3 Pro",
      region: "United States",
      lastUpdated: new Date().toISOString(),  // "2026-05-02T12:34:56.789Z"
      sampleSize: 78,

      pricing: {
        min: 429.00,
        max: 679.00,
        median: 549.50,
        p25: 499.00,
        p75: 619.00,
        fillPercentage: 0.88,   // 88% of prices fall inside the IQR-filtered band
      },

      demand: {
        sellThroughRate: 38.5,      // 38.5% in the last 30 days
        activityLevel: "High",
      },

      competition: {
        activeListings: 42,
        soldListings: 26,
        level: "High",
        ratio: 1.6,                 // 42 active / 26 sold = 1.6
      },

      market: {
        velocity: "HIGH",
        varianceIndex: 0.12,        // very stable market
      },

      decision: {
        signal: "Strong Demand · High Turnover",   // safe language
        confidence: 89,
      },

      metadata: {
        rawCount: 105,
        refinedCount: 78,
        source: "ebay",
      },
    })

  // dynamically update ProductData 
  const UpdateProductData = async (searchQuery: string) => {
    if(!user) { return; }
    setLoading(true);
    // request service call
    let NewProductData = await ProductSearchAnalysis(searchQuery, user.id);
    setProduct(NewProductData);

    // log the results
    console.log(NewProductData);
    setLoading(false);
  }

  return (
    <>
      <div className="min-h-screen bg-background p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Market Engine V1
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              From <span className="text-primary">One Input</span> → One Market Snapshot
            </h1>
          </div>

          {/* Two‑panel grid */}
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            {/* LEFT – Input Panel */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Input
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Research Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Product Search */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Product Search
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                        <div className="h-2 w-2 rounded-sm border border-muted-foreground bg-primary" />
                      </div>
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter item name..."
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Analysis Mode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Analysis Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex h-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                        Snapshot
                      </div>
                      <div className="flex h-10 items-center justify-center rounded-md border bg-background text-sm text-muted-foreground">
                        Deep Dive
                      </div>
                    </div>
                  </div>

                  <ActionButton onClick={() => UpdateProductData(inputValue)} loading={loading} />
                </CardContent>
              </Card>
            </div>

            {/* RIGHT – Live Results */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Live Results
                </span>
                <div className="h-px flex-1 bg-primary/30" />
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle>Market Snapshot</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    v1 · {product.metadata.source}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Product path */}
                  <div className="flex items-center text-sm text-muted-foreground border-b pb-4">
                    <span className="font-medium text-foreground">product/</span>
                    {product.productName}
                    <span className="mx-2 text-border">|</span>
                    <span className="font-medium text-foreground">market/</span>
                    {product.region}
                  </div>

                  {/* Decision Signal – full width */}
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase text-primary">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Orion Decision Signal
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-3xl font-bold tracking-tight">{product.decision.signal}</span>
                      <span className="text-sm text-muted-foreground">
                        {product.decision.confidence}% confidence
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${product.decision.confidence}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>Based on</span>
                      <span>
                        {product.metadata.refinedCount} of {product.metadata.rawCount} listings
                      </span>
                    </div>
                  </div>

                  {/* 2‑column metrics grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Pricing Bands */}
                    <Card className="col-span-1">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Pricing Bands
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Range</span>
                          <span className="font-medium">
                            ${product.pricing.min} — ${product.pricing.max}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-full w-[35%] rounded-full bg-primary" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Median</span>
                          <span className="font-medium">${product.pricing.median}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">P25 / P75</span>
                          <span className="font-medium">
                            ${product.pricing.p25} / ${product.pricing.p75}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Demand Signal */}
                    <Card className="col-span-1">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Demand Signal
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sell-through</span>
                          <span className="font-medium text-emerald-600">
                            {product.demand.sellThroughRate}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${product.demand.sellThroughRate}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Activity</span>
                          <span className="font-medium">{product.demand.activityLevel}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Velocity</span>
                          <span className="font-medium">{product.market.velocity}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Competition */}
                    <Card className="col-span-1">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Competition
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Active Listings</span>
                          <span className="font-medium">{product.competition.activeListings}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sold (30d)</span>
                          <span className="font-medium">{product.competition.soldListings}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Level</span>
                          <span className="font-medium">{product.competition.level}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">A:S Ratio</span>
                          <span className="font-medium">{product.competition.ratio.toFixed(1)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Market Stats */}
                    <Card className="col-span-1">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-purple-500" />
                          Market Stats
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Variance Index</span>
                          <span className="font-medium">{product.market.varianceIndex}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sample Size</span>
                          <span className="font-medium">{product.metadata.rawCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Refined</span>
                          <span className="font-medium">{product.metadata.refinedCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="font-medium">{product.decision.confidence}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timestamp */}
                  <p className="text-right text-xs text-muted-foreground border-t pt-4">
                    {new Date().toLocaleString()} · {product.metadata.refinedCount} comps analyzed · Source: {product.metadata.source.toUpperCase()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
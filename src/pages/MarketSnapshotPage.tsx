import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Search } from "lucide-react";

// ui components
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ActionButton from "@/components/ActionButton";

// services
import { ProductSearchAnalysis } from "../services/MarketService";
import { type MarketSnapshot } from "../types/market";
import { sampleSnapshots } from "../data/SampleSnapshot";

export default function MarketSnapshotPage() {
  const { user } = useUser();

  // product data default state
  const [inputValue, setInputValue] = useState("");

  // loading state
  const [loading, setLoading] = useState(false);

  // ProductData
  const [product, setProduct] = useState<MarketSnapshot | null>(null);

  // dynamically update ProductData — falls back to mock data when backend is offline
  const UpdateProductData = async (searchQuery: string) => {
    if (!user) { return; }
    setLoading(true);
    try {
      const NewProductData = await ProductSearchAnalysis(searchQuery, user.id);
      setProduct(NewProductData);
      fetchStats();
    } catch {
      // Backend offline — use mock data for portfolio demo
      const mockIndex = Math.abs(Array.from(searchQuery).reduce((acc, c) => acc + c.charCodeAt(0), 0)) % sampleSnapshots.length;
      const mockSnapshot = { ...sampleSnapshots[mockIndex], productName: searchQuery };
      setProduct(mockSnapshot);
    }
    setLoading(false);
  }

  // set user data
  const [stats, setStats] = useState({
    searchesToday: 0,
    maxSearches: 25,
  });

  const fetchStats = () => {
    if (!user) return;
    fetch(`http://localhost:4500/api/dashboard-stats?clerkUserId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const body: { searchesToday: number, maxSearches: number } = {
          searchesToday: data.searchesToday,
          maxSearches: data.maxSearches
        }
        setStats(body);
      })
      .catch(console.error);
  }
  useEffect(() => {
    fetchStats();
  }, [user]);

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
                  {/* <div className="space-y-1.5">
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
                  </div> */}

                  {stats.searchesToday >= stats.maxSearches ? (
                    <Button disabled className="w-full">Daily limit reached – upgrade to Pro</Button>
                  ) : (
                    <ActionButton onClick={() => UpdateProductData(inputValue)} loading={loading} />)}
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

              {product ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>Market Snapshot</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      v2 · {product.metadata.source}
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
                        Market Intelligence Signal
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

                      {/* Volatility Signal */}
                      <Card className="col-span-1">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            Price Volatility
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Volatility</span>
                            <span className="font-medium text-amber-600">
                              {product.volatility.priceVolatility}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-amber-500"
                              style={{ width: `${Math.min(product.volatility.varianceIndex * 33, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Variance Index</span>
                            <span className="font-medium">{product.volatility.varianceIndex}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Pricing Stability</span>
                            <span className="font-medium">
                              {product.volatility.varianceIndex <= 0.4 ? "Stable" : product.volatility.varianceIndex <= 1.0 ? "Moderate" : "Wild"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Competition */}
                      <Card className="col-span-1">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            Competition
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Active Listings</span>
                            <span className="font-medium">{product.competition.activeListings}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Level</span>
                            <span className="font-medium">{product.competition.level}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Saturation</span>
                            <span className="font-medium">{product.competition.saturation}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Confidence</span>
                            <span className="font-medium">{product.decision.confidence}%</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Market Stats */}
                      <Card className="col-span-1">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-purple-500" />
                            Data Quality
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sample Size</span>
                            <span className="font-medium">{product.metadata.rawCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Refined (IQR)</span>
                            <span className="font-medium">{product.metadata.refinedCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Outlier Rate</span>
                            <span className="font-medium">
                              {product.metadata.rawCount > 0
                                ? Math.round((1 - product.metadata.refinedCount / product.metadata.rawCount) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Region</span>
                            <span className="font-medium">{product.region}</span>
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
              ) : (
                <Card className="flex h-[500px] flex-col items-center justify-center text-center">
                  <CardContent>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">No Market Data Yet</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-[250px] mx-auto">
                      Enter a product name and run an analysis to generate a live market snapshot.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
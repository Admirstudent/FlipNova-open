import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { MarketSnapshot } from "@/types/market";
import { Card, CardContent } from "@/components/ui/card";

interface SnapshotModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    snapshot: MarketSnapshot;
}

export default function SnapshotModal({ open, onOpenChange, snapshot }: SnapshotModalProps) {
    const { productName, region, decision, pricing, demand, competition, market, metadata } = snapshot;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Market Snapshot
                        <Badge variant="outline" className="text-xs">
                            v1 · {metadata.source}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Product path */}
                    <div className="flex items-center text-sm text-muted-foreground border-b pb-2">
                        <span className="font-medium text-foreground">product/</span>
                        {productName}
                        <span className="mx-2 text-border">|</span>
                        <span className="font-medium text-foreground">market/</span>
                        {region}
                    </div>

                    {/* Decision Signal */}
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase text-primary">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            Market Signal
                        </div>
                        <div className="flex items-end justify-between gap-4">
                            <span className="text-2xl font-bold tracking-tight">{decision.signal}</span>
                            <span className="text-sm text-muted-foreground">
                                {decision.confidence}% confidence
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${decision.confidence}%` }}
                            />
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>Based on</span>
                            <span>
                                {metadata.refinedCount} of {metadata.rawCount} listings
                            </span>
                        </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Pricing Bands */}
                        <Card className="col-span-1 shadow-none border">
                            <CardContent className="p-3 space-y-2 text-xs">
                                <div className="flex items-center gap-1 font-semibold uppercase text-muted-foreground">
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                    Pricing Bands
                                </div>
                                <div className="flex justify-between"><span>Range</span><span>${pricing.min} — ${pricing.max}</span></div>
                                <div className="flex justify-between"><span>Median</span><span>${pricing.median}</span></div>
                                <div className="flex justify-between"><span>P25 / P75</span><span>${pricing.p25} / ${pricing.p75}</span></div>
                            </CardContent>
                        </Card>

                        {/* Demand */}
                        <Card className="col-span-1 shadow-none border">
                            <CardContent className="p-3 space-y-2 text-xs">
                                <div className="flex items-center gap-1 font-semibold uppercase text-muted-foreground">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Demand Signal
                                </div>
                                <div className="flex justify-between"><span>Sell-through</span><span className="text-emerald-600">{demand.sellThroughRate}%</span></div>
                                <div className="flex justify-between"><span>Activity</span><span>{demand.activityLevel}</span></div>
                                <div className="flex justify-between"><span>Velocity</span><span>{market.velocity}</span></div>
                            </CardContent>
                        </Card>

                        {/* Competition */}
                        <Card className="col-span-1 shadow-none border">
                            <CardContent className="p-3 space-y-2 text-xs">
                                <div className="flex items-center gap-1 font-semibold uppercase text-muted-foreground">
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                    Competition
                                </div>
                                <div className="flex justify-between"><span>Active Listings</span><span>{competition.activeListings}</span></div>
                                <div className="flex justify-between"><span>Sold (30d)</span><span>{competition.soldListings}</span></div>
                                <div className="flex justify-between"><span>Level</span><span>{competition.level}</span></div>
                                <div className="flex justify-between"><span>A:S Ratio</span><span>{competition.ratio.toFixed(1)}</span></div>
                            </CardContent>
                        </Card>

                        {/* Market Stats */}
                        <Card className="col-span-1 shadow-none border">
                            <CardContent className="p-3 space-y-2 text-xs">
                                <div className="flex items-center gap-1 font-semibold uppercase text-muted-foreground">
                                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                                    Market Stats
                                </div>
                                <div className="flex justify-between"><span>Variance Index</span><span>{market.varianceIndex}</span></div>
                                <div className="flex justify-between"><span>Sample Size</span><span>{metadata.rawCount}</span></div>
                                <div className="flex justify-between"><span>Refined</span><span>{metadata.refinedCount}</span></div>
                                <div className="flex justify-between"><span>Confidence</span><span>{decision.confidence}%</span></div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
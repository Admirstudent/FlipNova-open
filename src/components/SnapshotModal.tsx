// src/components/SnapshotModal.tsx
import { useEffect, useState } from "react";
import {
  X,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
  Users,
  Info,
  Bookmark,
} from "lucide-react";
import type { MarketSnapshot } from "@/types/market";

interface SnapshotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: MarketSnapshot;
  analysisId?: string;
  saved?: boolean;
  onToggleSaved?: (id: string) => void;
}

export default function SnapshotModal({
  open,
  onOpenChange,
  snapshot,
  analysisId,
  saved = false,
  onToggleSaved,
}: SnapshotModalProps) {
  // Local state to reflect immediate UI change before server confirms
  const [localSaved, setLocalSaved] = useState(saved);

  // Sync local state when parent `saved` prop changes
  useEffect(() => {
    setLocalSaved(saved);
  }, [saved]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  const {
    productName,
    region,
    decision,
    pricing,
    demand,
    competition,
    market,
    metadata,
  } = snapshot;

  // Color coding for market condition
  const conditionColor =
    decision.confidence < 50
      ? "text-red-600 bg-red-50 border-red-200"
      : demand.sellThroughRate >= 40
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : "text-amber-600 bg-amber-50 border-amber-200";

  // Price range bar calculation
  const priceRange = pricing.max - pricing.min;
  const medianPercent =
    priceRange > 0 ? ((pricing.median - pricing.min) / priceRange) * 100 : 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-border/50">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 bg-white rounded-t-2xl border-b">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Market Snapshot
            </p>
            <h2 className="text-xl font-bold text-foreground mt-1">
              {productName}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{region}</span>
              <span>·</span>
              <span>{metadata.source.toUpperCase()}</span>
              <span>·</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Right side buttons (bookmark + close) */}
          <div className="flex items-center gap-2">
            {analysisId && (
              <button
                onClick={() => {
                  setLocalSaved(!localSaved);
                  onToggleSaved?.(analysisId);
                }}
                className={`rounded-full p-2 transition-colors ${
                  localSaved
                    ? "text-amber-600 bg-amber-100 hover:bg-amber-200"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Bookmark
                  className="h-5 w-5"
                  fill={localSaved ? "currentColor" : "none"}
                />
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Market Condition Banner */}
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${conditionColor}`}
          >
            <Activity className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">{decision.signal}</p>
              <p className="text-xs opacity-80">
                {decision.confidence}% confidence · {metadata.refinedCount} refined comps
              </p>
            </div>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Sell‑Through",
                value: `${demand.sellThroughRate}%`,
                icon: TrendingUp,
                color: "text-emerald-600",
              },
              {
                label: "Market Velocity",
                value: market.velocity,
                icon: BarChart3,
                color: "text-blue-600",
              },
              {
                label: "Active Listings",
                value: competition.activeListings,
                icon: Users,
                color: "text-purple-600",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-accent/50 border border-border/30"
              >
                <stat.icon className={`h-5 w-5 mb-1 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <span className="text-lg font-bold">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Pricing Bands */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <DollarSign className="h-4 w-4 text-primary" />
              Pricing Bands
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>${pricing.min}</span>
                <span>${pricing.max}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-primary/20"
                  style={{ width: "100%" }}
                />
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-primary"
                  style={{ width: `${medianPercent}%` }}
                />
              </div>
              <div className="flex justify-center text-xs text-muted-foreground">
                Median: ${pricing.median}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">P25</span>
                <span className="font-medium">${pricing.p25}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">P75</span>
                <span className="font-medium">${pricing.p75}</span>
              </div>
            </div>
          </div>

          {/* Competition & Stats – two columns */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: "Competition",
                icon: Users,
                rows: [
                  { label: "Active Listings", value: competition.activeListings },
                  { label: "Sold (30d)", value: competition.soldListings },
                  { label: "Level", value: competition.level },
                  { label: "A:S Ratio", value: competition.ratio.toFixed(1) },
                ],
              },
              {
                title: "Market Stats",
                icon: Info,
                rows: [
                  { label: "Variance Index", value: market.varianceIndex },
                  { label: "Sample Size", value: metadata.rawCount },
                  { label: "Refined", value: metadata.refinedCount },
                  { label: "Confidence", value: `${decision.confidence}%` },
                ],
              },
            ].map((section) => (
              <div key={section.title} className="p-3 rounded-xl bg-accent/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <section.icon className="h-4 w-4 text-primary" />
                  {section.title}
                </h3>
                <div className="space-y-1 text-sm">
                  {section.rows.map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer timestamp */}
          <p className="text-right text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
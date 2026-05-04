import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";

interface SearchItem {
  product: string;
  date: string;          // ISO string
  signal: string;
  confidence: number;
  medianPrice: number;
  sellThrough: number;
}

export default function RecentSearches({ searches }: { searches: SearchItem[] }) {
  const maxPrice = Math.max(...searches.map((item) => item.medianPrice), 1);

  // Helper to format relative time – you can enhance this
  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Searches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {searches.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
          >
            {/* Left: product name + time */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="font-medium truncate">{item.product}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeAgo(item.date)}
              </div>
            </div>

            {/* Right: metrics + bars */}
            <div className="flex items-center gap-4 ml-4">
              {/* Sell-through bar */}
              <div className="hidden sm:flex flex-col items-end gap-0.5 min-w-[90px]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {item.sellThrough}%
                  </span>
                  <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${item.sellThrough}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  sell‑through
                </span>
              </div>

              {/* Median price bar */}
              <div className="hidden sm:flex flex-col items-end gap-0.5 min-w-[90px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-12 text-right">
                    ${item.medianPrice}
                  </span>
                  <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{
                        width: `${(item.medianPrice / maxPrice) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  median price
                </span>
              </div>

              {/* Decision badge */}
              <Badge
                variant={item.confidence >= 70 ? "default" : "secondary"}
                className="text-xs"
              >
                {item.signal} ({item.confidence}%)
              </Badge>

              {/* Re-run button – you can wire this up later */}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
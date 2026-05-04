import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Percent, Tag, Bookmark } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

import { buildPriceDistribution } from "../lib/BuildPriceDistribution";
import PriceHistogram from "../components/PriceHistrogram";
import RecentSearches from "../components/RecentSearches";

function UserDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    searchesToday: 0,
    maxSearches: 25,
    avgSellThrough: 0,
    topCategory: "None",
    savedAnalyses: 0,
    categoryDistribution: [],
    sellThroughHistory: [],
    recentSearches: [],
    snapshots: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/dashboard-stats?clerkUserId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats", err);
        setLoading(false);
      });
  }, [user]);

  const {
    searchesToday,
    maxSearches,
    avgSellThrough,
    topCategory,
    savedAnalyses,
    categoryDistribution,
    sellThroughHistory,
    recentSearches,
    snapshots,
  } = stats;

  const remaining = maxSearches - searchesToday;
  const searchProgressPercent = maxSearches > 0 ? (searchesToday / maxSearches) * 100 : 0;
  const maxCategoryCount = Math.max(...categoryDistribution.map((d: any) => d.count), 1);

  // Price histogram from real snapshots
  const priceBuckets = useMemo(
    () => buildPriceDistribution(snapshots),
    [snapshots]
  );

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Loading dashboard…</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-[1500px] mx-auto">
      {/* Glance stats cards – unchanged except using real data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Searches Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Searches Today</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">
              {searchesToday}/{maxSearches}
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${searchProgressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{remaining} remaining</p>
          </CardContent>
        </Card>

        {/* Avg Sell‑Through */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Sell‑Through</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-bold">{avgSellThrough}%</div>
            <div className="flex items-end gap-1 h-6">
              {sellThroughHistory.map((val, idx) => {
                const height = val ? (val / 100) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-sm bg-primary/70"
                    style={{ height: `${height}%` }}
                    title={`${val}%`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">last analyses</p>
          </CardContent>
        </Card>

        {/* Top Category */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Category</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xl font-bold truncate" title={topCategory}>
              {topCategory}
            </div>
            <div className="space-y-1">
              {categoryDistribution.slice(0, 3).map((cat: any) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20 truncate">{cat.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{cat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Saved Analyses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saved</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedAnalyses}</div>
            <p className="text-xs text-muted-foreground mt-1">bookmarked snapshots</p>
          </CardContent>
        </Card>
      </div>

      {/* Price Distribution – now real data */}
      <PriceHistogram data={priceBuckets} title="Your Price Distribution" height={400} />

      {/* Recent Searches – real data */}
      <RecentSearches searches={recentSearches} />
    </div>
  );
}

export default UserDashboard;
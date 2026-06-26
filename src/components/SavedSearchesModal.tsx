import { useEffect } from "react";
import { X, Bookmark, ArrowRight } from "lucide-react";
import type { SearchItem } from "@/types/dashboard";

interface SavedSearchesModalProps {
  open: boolean;
  onClose: () => void;
  savedItems: SearchItem[];
  onView?: (item: SearchItem) => void;   // ← new prop
}

export default function SavedSearchesModal({
  open,
  onClose,
  savedItems,
  onView,
}: SavedSearchesModalProps) {
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-border/50">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-5 border-b bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-amber-600 fill-amber-600" />
            Saved Analyses
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          {savedItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              You haven’t bookmarked any analyses yet.
            </p>
          ) : (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-accent/30 border border-border/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{item.product}</p>
                  <p className="text-xs text-muted-foreground">
                    Median: ${item.medianPrice} · {item.signal} ({item.confidence}%)
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  {/* View button – opens full snapshot modal */}
                  <button
                    onClick={() => onView?.(item)}
                    className="rounded-full p-2 hover:bg-muted transition-colors"
                    title="View full snapshot"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
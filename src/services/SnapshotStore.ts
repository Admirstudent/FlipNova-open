// src/services/snapshotStore.ts
import type { MarketSnapshot } from "@/types/market";

// In‑memory array – all snapshots live here during the session
let snapshots: MarketSnapshot[] = [];

// Add a new snapshot (called after every successful analysis)
export function addSnapshot(snapshot: MarketSnapshot) {
  snapshots = [...snapshots, snapshot];
  // Optional: keep only last 50 to mimic a real limit
  if (snapshots.length > 50) {
    snapshots = snapshots.slice(-50);
  }
}

// Get all stored snapshots (for the dashboard / histogram)
export function getSnapshots(): MarketSnapshot[] {
  return [...snapshots];
}

// Optional – clear all snapshots (e.g. “new session”)
export function clearSnapshots() {
  snapshots = [];
}
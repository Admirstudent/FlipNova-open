export interface SearchItem {
  product: string;
  date: string;
  sellThrough: number;
  medianPrice: number;
  signal: string;
  confidence: number;
  snapshot?: any;          // raw processor response
  searchQuery?: string;    // original search term
}

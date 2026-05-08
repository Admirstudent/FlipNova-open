export interface SearchItem {
  id?: string;          // MongoDB _id of the analysis record
  product: string;
  date: string;
  sellThrough: number;
  medianPrice: number;
  signal: string;
  confidence: number;
  snapshot?: any;       // raw processor response
  searchQuery?: string; // original search term
  saved?: boolean;      // bookmarked status
}
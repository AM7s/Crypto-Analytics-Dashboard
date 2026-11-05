export interface Item {
  id: number;
  external_id: string;
  symbol: string;
  name: string;
  price_usd: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  change_24h_pct: number;
  updated_at: string;
}

export interface HistoryPoint {
  price_usd: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  change_24h_pct: number;
  recorded_at: string;
}

export interface Stats {
  total_items: number;
  total_history_points: number;
  top_gainer: Item | null;
  top_loser: Item | null;
  total_market_cap_usd: number;
}

export interface ItemWithHistory {
  item: Item;
  history: HistoryPoint[];
}
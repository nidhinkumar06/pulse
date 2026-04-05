// ─────────────────────────────────────────────────────────────
// types/index.ts — Shared type definitions for KisanMitra
// ─────────────────────────────────────────────────────────────

export interface MandiPrice {
  state: string;
  district: string;
  market: string;        // Mandi name
  commodity: string;
  variety: string;
  arrivalDate: string;
  minPrice: number;      // ₹ per quintal
  maxPrice: number;
  modalPrice: number;    // Most common traded price
}

export interface MSPData {
  commodity: string;
  season: string;        // Kharif / Rabi
  year: string;
  mspPerQuintal: number; // ₹ per quintal
  announcedBy: string;
}

export interface WeatherData {
  city: string;
  state: string;
  temperature: number;
  humidity: number;
  condition: string;
  rainChancePercent: number;
  recommendation: string; // e.g., "Good for harvesting"
}

export interface MarketRecommendation {
  bestMandi: string;
  bestPrice: number;
  mspPrice: number;
  isPriceAboveMSP: boolean;
  priceGapPercent: number;  // % above/below MSP
  nearbyOptions: MandiPrice[];
  advice: string;
}

export interface AgmarknetApiResponse {
  status: string;
  total: number;
  records: AgmarknetRecord[];
}

export interface AgmarknetRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QueryRequest {
  query: string;
  sessionId?: string;
  language?: 'en' | 'hi';
}

export interface QueryResponse {
  answer: string;
  sessionId: string;
  sources: string[];
  timestamp: string;
}

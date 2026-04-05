// ─────────────────────────────────────────────────────────────
// tools/mandiPriceTool.ts
// Fetches LIVE mandi prices from India's official Agmarknet API
// Data source: data.gov.in (Government of India Open Data Portal)
// ─────────────────────────────────────────────────────────────

import axios from 'axios';
import { AgmarknetApiResponse, MandiPrice } from '../../types';

const AGMARKNET_BASE_URL =
  'https://kisan-proxy-2d9a.nidhin6392ai.workers.dev/resource/9ef84268-d588-465a-a308-a864a43d0070';

// Normalize commodity names to match Agmarknet's naming conventions
const COMMODITY_ALIASES: Record<string, string> = {
  wheat: 'Wheat',
  gehu: 'Wheat',
  gehun: 'Wheat',
  rice: 'Rice',
  chawal: 'Rice',
  paddy: 'Paddy',
  dhan: 'Paddy',
  tomato: 'Tomato',
  tamatar: 'Tomato',
  onion: 'Onion',
  pyaz: 'Onion',
  potato: 'Potato',
  aloo: 'Potato',
  cotton: 'Cotton',
  kapas: 'Cotton',
  soybean: 'Soyabean',
  soyabean: 'Soyabean',
  mustard: 'Mustard',
  sarson: 'Mustard',
  maize: 'Maize',
  makka: 'Maize',
  tur: 'Tur',
  arhar: 'Tur',
  urad: 'Urad',
  moong: 'Moong',
  gram: 'Gram',
  chana: 'Gram',
  groundnut: 'Groundnut',
  mungfali: 'Groundnut',
  bajra: 'Bajra',
  jowar: 'Jowar',
  sugarcane: 'Sugarcane',
  ganna: 'Sugarcane',
};

// State name normalizer (handles common Hinglish spellings)
const STATE_ALIASES: Record<string, string> = {
  'up': 'Uttar Pradesh',
  'mp': 'Madhya Pradesh',
  'ap': 'Andhra Pradesh',
  'mh': 'Maharashtra',
  'maharashtra': 'Maharashtra',
  'punjab': 'Punjab',
  'haryana': 'Haryana',
  'rajasthan': 'Rajasthan',
  'gujarat': 'Gujarat',
  'karnataka': 'Karnataka',
  'tamil nadu': 'Tamil Nadu',
  'tamilnadu': 'Tamil Nadu',
  'kerala': 'Kerala',
  'west bengal': 'West Bengal',
  'bengal': 'West Bengal',
  'bihar': 'Bihar',
  'odisha': 'Odisha',
  'telangana': 'Telangana',
};

function normalizeCommodity(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return COMMODITY_ALIASES[lower] ?? raw.trim();
}

function normalizeState(raw: string): string {
  const lower = raw.toLowerCase().trim();
  return STATE_ALIASES[lower] ?? raw.trim();
}

// ─── Tool: Get Live Mandi Prices ───────────────────────────────
export async function getMandiPrices(params: {
  commodity: string;
  state?: string;
  district?: string;
  limit?: number;
}): Promise<{ prices: MandiPrice[]; summary: string }> {
  const { commodity, state, district, limit = 10 } = params;

  // ── Log immediately so we can see if tool is even entered ──
  console.log('[MandiPrice] Tool called with:', { commodity, state, district, limit });
  console.log('[MandiPrice] Env check:', {
    DATA_GOV_IN_API_KEY: process.env.DATA_GOV_IN_API_KEY ? '✅ SET ('+process.env.DATA_GOV_IN_API_KEY.slice(0,8)+'...)' : '❌ NOT SET',
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY ? '✅ SET' : '❌ NOT SET',
    GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY ? '✅ SET' : '❌ NOT SET',
  });

  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  if (!apiKey) throw new Error('DATA_GOV_IN_API_KEY is not set in Cloud Run env vars');

  const normalizedCommodity = normalizeCommodity(commodity);
  const normalizedState = state ? normalizeState(state) : undefined;

  const queryParams: Record<string, string | number> = {
    'api-key': apiKey,
    format: 'json',
    limit,
    'filters[commodity]': normalizedCommodity,
  };

  if (normalizedState) queryParams['filters[state]'] = normalizedState;
  if (district) queryParams['filters[district]'] = district;

  console.error('[MandiPrice] About to call Agmarknet API with params:', JSON.stringify({
    commodity: normalizedCommodity,
    state: normalizedState,
    keyPrefix: apiKey.slice(0, 8),
  }));

  try {
    const response = await axios.get<AgmarknetApiResponse>(AGMARKNET_BASE_URL, {
      params: queryParams,
      timeout: 30000, // increased to 30s — data.gov.in can be slow from Cloud Run
    });

    console.error('[MandiPrice] API Response status:', response.status, '| total records:', response.data.total);

    const records = response.data.records ?? [];

    if (records.length === 0) {
      return {
        prices: [],
        summary: `No mandi price data found for ${normalizedCommodity}${normalizedState ? ` in ${normalizedState}` : ''}. Try a different commodity or state.`,
      };
    }

    const prices: MandiPrice[] = records.map((r) => ({
      state: r.state,
      district: r.district,
      market: r.market,
      commodity: r.commodity,
      variety: r.variety,
      arrivalDate: r.arrival_date,
      minPrice: Number(r.min_price) || 0,
      maxPrice: Number(r.max_price) || 0,
      modalPrice: Number(r.modal_price) || 0,
    }));

    // Sort by modal price descending (highest paying mandi first)
    prices.sort((a, b) => b.modalPrice - a.modalPrice);

    const best = prices[0];
    const worst = prices[prices.length - 1];
    const avgModal =
      Math.round(prices.reduce((s, p) => s + p.modalPrice, 0) / prices.length);

    const summary =
      `Found ${prices.length} mandi(s) for ${normalizedCommodity}` +
      (normalizedState ? ` in ${normalizedState}` : '') +
      `.\n🏆 Best price: ₹${best.modalPrice}/quintal at ${best.market}, ${best.district}` +
      `\n📉 Lowest: ₹${worst.modalPrice}/quintal at ${worst.market}, ${worst.district}` +
      `\n📊 Average modal price: ₹${avgModal}/quintal`;

    return { prices, summary };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[MandiPrice] Axios error:', error.code, error.message, error.response?.status);
      console.error('[MandiPrice] Axios error:', {
        status:  error.response?.status,
        message: error.message,
        data:    JSON.stringify(error.response?.data)?.slice(0, 300),
        keySet:  !!process.env.DATA_GOV_IN_API_KEY,
      });
      if (error.response?.status === 403) {
        throw new Error('DATA_GOV_IN_API_KEY is invalid or expired. Verify at data.gov.in');
      }
      if (error.response?.status === 401) {
        throw new Error('DATA_GOV_IN_API_KEY is missing or unauthorized');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('data.gov.in timed out after 10s — try again');
      }
    } else {
      console.error('[MandiPrice] Unknown error:', error);
    }
    throw new Error(`Mandi price fetch failed: ${(error as Error).message}`);
  }
}

// ─── Tool: Get Best Mandi for Selling ─────────────────────────
export async function getBestMandiToSell(params: {
  commodity: string;
  state: string;
  quantityQuintals?: number;
}): Promise<{ recommendation: string; topMandis: MandiPrice[] }> {
  const { commodity, state, quantityQuintals = 10 } = params;

  const { prices } = await getMandiPrices({ commodity, state, limit: 20 });

  if (prices.length === 0) {
    return {
      recommendation: `Could not find mandi data for ${commodity} in ${state}. Please verify the commodity and state name.`,
      topMandis: [],
    };
  }

  const top3 = prices.slice(0, 3);
  const best = top3[0];
  const estimatedEarning = best.modalPrice * quantityQuintals;

  const recommendation =
    `🌾 Best mandi to sell ${commodity} in ${state} today:\n\n` +
    top3
      .map(
        (m, i) =>
          `${i + 1}. ${m.market} (${m.district}) — ₹${m.modalPrice}/quintal (Range: ₹${m.minPrice}–₹${m.maxPrice})`,
      )
      .join('\n') +
    `\n\n💰 If you sell ${quantityQuintals} quintals at ${best.market}, estimated earning: ₹${estimatedEarning.toLocaleString('en-IN')}` +
    `\n📅 Price data as of: ${best.arrivalDate}`;

  return { recommendation, topMandis: top3 };
}

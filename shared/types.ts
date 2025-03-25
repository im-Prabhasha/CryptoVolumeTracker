// CoinMarketCap API response types
export interface CmcCoin {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  infinite_supply: boolean;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: any | null;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  logo?: string; // URL for the coin's logo image
  quote: {
    [currency: string]: {
      price: number;
      volume_24h: number;
      volume_change_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      market_cap: number;
      market_cap_dominance: number;
      fully_diluted_market_cap: number;
      last_updated: string;
    };
  };
}

export interface CmcApiResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
  data: CmcCoin[];
}

export interface CmcQuotesResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
  data: {
    [id: string]: CmcCoin;
  };
}

// Application data types
export interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  price: number;
  marketCap: number;
  volume24h: number;
  percentChange24h: number;
  volumeToMarketCapRatio: number;
  rank: number;
  hasVolumeSpike: boolean;
  volumeStatus: 'normal' | 'spike' | 'drop';
  lastUpdated: string;
  logoUrl?: string; // URL to coin's logo image
}

export interface MetricsData {
  title: string;
  value: string | number;
  changeText: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  iconColor: string;
}

export interface ApiStatus {
  callsUsed: number;
  callsLimit: number;
  minutesUntilReset: number;
}

export interface CryptoDataResponse {
  data: CryptoData[];
  metrics: {
    totalPairs: number;
    highVolumeAlerts: number;
    avgRatio: number;
    apiStatus: ApiStatus;
  };
  lastUpdate: string;
  page: number;
  totalPages: number;
  totalItems: number;
}

export type SortDirection = 'asc' | 'desc';

export type SortField = 'name' | 'price' | 'marketCap' | 'volume' | 'ratio' | 'change';

export type VolumeFilter = 'all' | 'high' | 'medium' | 'low';

export type MarketCapFilter = 'all' | 'large' | 'medium' | 'small' | 'micro';

export type AlertFilter = 'all' | 'spike' | 'drop' | 'none';

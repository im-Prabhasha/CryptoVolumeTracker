import { CryptoData } from "@shared/types";

/**
 * Generates fallback cryptocurrency data when the API is not available.
 * This is only used when we can't connect to the CoinMarketCap API.
 */
export function generateFallbackData(): CryptoData[] {
  // Top cryptocurrencies with realistic but not real-time data
  return [
    createCrypto(1, "Bitcoin", "BTC", "bitcoin", 60000, 1200000000000, 35000000000, 2.5, 0.029),
    createCrypto(2, "Ethereum", "ETH", "ethereum", 3500, 420000000000, 15000000000, -1.2, 0.036),
    createCrypto(3, "Tether", "USDT", "tether", 1, 100000000000, 50000000000, 0.02, 0.5),
    createCrypto(4, "BNB", "BNB", "bnb", 450, 80000000000, 2000000000, 1.5, 0.025),
    createCrypto(5, "Solana", "SOL", "solana", 120, 60000000000, 7000000000, 5.2, 0.117),
    createCrypto(6, "XRP", "XRP", "ripple", 0.9, 50000000000, 4000000000, -2.1, 0.08),
    createCrypto(7, "USDC", "USDC", "usd-coin", 1, 45000000000, 3500000000, 0.01, 0.078),
    createCrypto(8, "Cardano", "ADA", "cardano", 0.55, 20000000000, 1500000000, -3.5, 0.075),
    createCrypto(9, "Avalanche", "AVAX", "avalanche", 30, 12000000000, 2000000000, 8.3, 0.167),
    createCrypto(10, "Dogecoin", "DOGE", "dogecoin", 0.15, 20000000000, 1200000000, 1.2, 0.06),
    createCrypto(11, "Polkadot", "DOT", "polkadot", 7, 8000000000, 600000000, -1.5, 0.075),
    createCrypto(12, "Polygon", "MATIC", "polygon", 0.7, 7000000000, 800000000, 0.5, 0.114),
    createCrypto(13, "Shiba Inu", "SHIB", "shiba-inu", 0.00001, 5000000000, 300000000, 2.3, 0.06),
    createCrypto(14, "Litecoin", "LTC", "litecoin", 95, 7200000000, 1500000000, -0.7, 0.208),
    createCrypto(15, "Chainlink", "LINK", "chainlink", 15, 9000000000, 900000000, 1.4, 0.1),
    createCrypto(16, "Uniswap", "UNI", "uniswap", 9, 4500000000, 350000000, -2.8, 0.078),
    createCrypto(17, "Algorand", "ALGO", "algorand", 0.25, 2000000000, 150000000, 0.9, 0.075),
    createCrypto(18, "Stellar", "XLM", "stellar", 0.15, 4500000000, 250000000, -1.3, 0.056),
    createCrypto(19, "VeChain", "VET", "vechain", 0.03, 2100000000, 400000000, 3.2, 0.19),
    createCrypto(20, "Filecoin", "FIL", "filecoin", 6, 1500000000, 200000000, 1.1, 0.133),
  ];
}

function createCrypto(
  id: number,
  name: string,
  symbol: string,
  slug: string,
  price: number,
  marketCap: number,
  volume24h: number,
  percentChange24h: number,
  volumeRatio: number
): CryptoData {
  // Calculate volume to market cap ratio
  const volumeToMarketCapRatio = volumeRatio;
  
  // Determine if there's a volume spike (ratio > 0.1)
  const hasVolumeSpike = volumeToMarketCapRatio > 0.1;
  
  // Determine volume status based on ratio
  let volumeStatus: 'normal' | 'spike' | 'drop' = 'normal';
  if (volumeToMarketCapRatio > 0.1) {
    volumeStatus = 'spike';
  } else if (percentChange24h < -20) {
    volumeStatus = 'drop';
  }
  
  // For testing UI with placeholder logo URLs
  // These are placeholder logo URL patterns that will be replaced when real API data is available
  // Format: https://s2.coinmarketcap.com/static/img/coins/64x64/{id}.png
  const logoUrl = `https://s2.coinmarketcap.com/static/img/coins/64x64/${id}.png`;
  
  return {
    id,
    name,
    symbol,
    slug,
    price,
    marketCap,
    volume24h,
    percentChange24h,
    volumeToMarketCapRatio,
    rank: id,
    hasVolumeSpike,
    volumeStatus,
    lastUpdated: new Date().toISOString(),
    logoUrl
  };
}
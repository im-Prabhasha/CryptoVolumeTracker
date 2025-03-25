import axios from "axios";
import { CmcApiResponse, CmcQuotesResponse, CryptoData } from "@shared/types";

// Get API key from environment (check both normal env variables and Replit secrets)
let CMC_API_KEY = "8685470e-9594-484c-863e-8fc6028b0dc1";
const CMC_API_URL = "https://pro-api.coinmarketcap.com/v1";

// Function to create axios instance with current API key
const createApiInstance = () => {
  console.log(`Using CoinMarketCap API key with length: ${CMC_API_KEY.length}`);
  
  return axios.create({
    baseURL: CMC_API_URL,
    headers: {
      "X-CMC_PRO_API_KEY": CMC_API_KEY,
      "Accept": "application/json",
    },
  });
};

// Log API key status
if (!CMC_API_KEY) {
  console.warn("Warning: CMC_API_KEY is not set. CoinMarketCap API calls will fail.");
} else {
  console.log(`CoinMarketCap API key is configured. Length: ${CMC_API_KEY.length}`);
}

// Create axios instance with API key in headers
let cmcApi = createApiInstance();

// Keep track of API calls for rate limiting
let apiCallsUsed = 0;
let apiCallsLimit = 300; // Default CMC Basic tier limit
let apiRateLimitReset = Date.now() + 24 * 60 * 60 * 1000; // Default 24 hours from now

// Update rate limit information from response headers
function updateRateLimitInfo(headers: any) {
  if (headers["x-cmc_pro_api_key_plan_credit_limit"]) {
    apiCallsLimit = parseInt(headers["x-cmc_pro_api_key_plan_credit_limit"], 10);
  }
  
  if (headers["x-cmc_pro_api_key_credits_remaining"]) {
    const remaining = parseInt(headers["x-cmc_pro_api_key_credits_remaining"], 10);
    apiCallsUsed = apiCallsLimit - remaining;
  }
  
  if (headers["x-cmc_pro_api_key_credits_reset_at"]) {
    apiRateLimitReset = new Date(headers["x-cmc_pro_api_key_credits_reset_at"]).getTime();
  }
}

export async function getLatestCryptoData(limit = 100, start = 1): Promise<{ 
  data: CryptoData[],
  apiStatus: { callsUsed: number, callsLimit: number, minutesUntilReset: number }
}> {
  try {
    // Log the API key (first few characters) for debugging
    console.log(`Using API key: ${CMC_API_KEY.substring(0, 5)}...`);
    
    // First get the listings data
    const response = await cmcApi.get<CmcApiResponse>("/cryptocurrency/listings/latest", {
      params: {
        start,
        limit,
        convert: "USD",
      },
    });
    
    // Collect all the coin IDs
    const coinIds = response.data.data.map(coin => coin.id);
    
    // Get metadata including logo URLs (if available)
    let metadataResponse: any = null;
    try {
      metadataResponse = await cmcApi.get("/cryptocurrency/info", {
        params: {
          id: coinIds.join(",")
        }
      });
      
      // Update rate limit info
      updateRateLimitInfo(metadataResponse.headers);
    } catch (error) {
      console.warn("Could not fetch logo metadata, continuing without logos", error);
    }

    updateRateLimitInfo(response.headers);

    const cryptoData: CryptoData[] = response.data.data.map(coin => {
      const usdQuote = coin.quote.USD;
      const volumeToMarketCapRatio = usdQuote.market_cap > 0 
        ? usdQuote.volume_24h / usdQuote.market_cap 
        : 0;
      
      // Determine if there's a volume spike (ratio > 0.1)
      const hasVolumeSpike = volumeToMarketCapRatio > 0.1;
      
      // Determine volume status based on ratio
      let volumeStatus: 'normal' | 'spike' | 'drop' = 'normal';
      if (volumeToMarketCapRatio > 0.1) {
        volumeStatus = 'spike';
      } else if (usdQuote.volume_change_24h < -20) {
        volumeStatus = 'drop';
      }

      // Get logo URL from metadata if available
      let logoUrl;
      if (metadataResponse?.data?.data && metadataResponse.data.data[coin.id]) {
        logoUrl = metadataResponse.data.data[coin.id].logo;
      }

      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        slug: coin.slug,
        price: usdQuote.price,
        marketCap: usdQuote.market_cap,
        volume24h: usdQuote.volume_24h,
        percentChange24h: usdQuote.percent_change_24h,
        volumeToMarketCapRatio,
        rank: coin.cmc_rank,
        hasVolumeSpike,
        volumeStatus,
        lastUpdated: usdQuote.last_updated,
        logoUrl,
      };
    });

    const minutesUntilReset = Math.floor((apiRateLimitReset - Date.now()) / (1000 * 60));

    return { 
      data: cryptoData,
      apiStatus: {
        callsUsed: apiCallsUsed,
        callsLimit: apiCallsLimit,
        minutesUntilReset: minutesUntilReset > 0 ? minutesUntilReset : 0
      }
    };
  } catch (error: any) {
    // Enhanced error logging
    console.error("Error fetching cryptocurrency data:", error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      
      // Throw a more informative error
      if (error.response.status === 401) {
        throw new Error(`API authorization failed: ${error.response.data?.status?.error_message || 'Invalid API key'}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      throw new Error("No response received from CoinMarketCap API");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Error setting up request: ${error.message}`);
    }
    
    throw error;
  }
}

export async function getSpecificCoins(ids: number[]): Promise<CryptoData[]> {
  try {
    if (ids.length === 0) {
      return [];
    }
    
    const response = await cmcApi.get<CmcQuotesResponse>("/cryptocurrency/quotes/latest", {
      params: {
        id: ids.join(','),
        convert: "USD",
      },
    });

    updateRateLimitInfo(response.headers);
    
    // Get metadata including logo URLs
    let metadataResponse: any = null;
    try {
      metadataResponse = await cmcApi.get("/cryptocurrency/info", {
        params: {
          id: ids.join(",")
        }
      });
      
      updateRateLimitInfo(metadataResponse.headers);
    } catch (error) {
      console.warn("Could not fetch logo metadata, continuing without logos", error);
    }

    return Object.values(response.data.data).map(coin => {
      const usdQuote = coin.quote.USD;
      const volumeToMarketCapRatio = usdQuote.market_cap > 0 
        ? usdQuote.volume_24h / usdQuote.market_cap 
        : 0;
      
      const hasVolumeSpike = volumeToMarketCapRatio > 0.1;
      
      let volumeStatus: 'normal' | 'spike' | 'drop' = 'normal';
      if (volumeToMarketCapRatio > 0.1) {
        volumeStatus = 'spike';
      } else if (usdQuote.volume_change_24h < -20) {
        volumeStatus = 'drop';
      }
      
      // Get logo URL from metadata if available
      let logoUrl;
      if (metadataResponse?.data?.data && metadataResponse.data.data[coin.id]) {
        logoUrl = metadataResponse.data.data[coin.id].logo;
      }
      
      return {
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        slug: coin.slug,
        price: usdQuote.price,
        marketCap: usdQuote.market_cap,
        volume24h: usdQuote.volume_24h,
        percentChange24h: usdQuote.percent_change_24h,
        volumeToMarketCapRatio,
        rank: coin.cmc_rank,
        hasVolumeSpike,
        volumeStatus,
        lastUpdated: usdQuote.last_updated,
        logoUrl,
      };
    });
  } catch (error) {
    console.error("Error fetching specific cryptocurrency data:", error);
    throw error;
  }
}

export async function searchCoins(query: string): Promise<CryptoData[]> {
  try {
    if (!query || query.length < 2) {
      return [];
    }
    
    // First get all available coins (limited to 100 to be reasonable)
    const { data } = await getLatestCryptoData(100, 1);
    
    // Filter based on name or symbol matching the query
    const lowercaseQuery = query.toLowerCase();
    return data.filter(
      coin => 
        coin.name.toLowerCase().includes(lowercaseQuery) || 
        coin.symbol.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error("Error searching cryptocurrency data:", error);
    throw error;
  }
}

export function getApiStatus() {
  const minutesUntilReset = Math.floor((apiRateLimitReset - Date.now()) / (1000 * 60));
  
  return {
    callsUsed: apiCallsUsed,
    callsLimit: apiCallsLimit,
    minutesUntilReset: minutesUntilReset > 0 ? minutesUntilReset : 0
  };
}

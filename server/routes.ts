import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getLatestCryptoData, getSpecificCoins, searchCoins, getApiStatus } from "./api/coinmarketcap";
import { generateFallbackData } from "./api/fallback-data";
import { CryptoData, SortField, SortDirection, VolumeFilter, MarketCapFilter, AlertFilter } from "@shared/types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all crypto data with filtering and sorting
  app.get("/api/crypto", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const start = (page - 1) * limit + 1;
      
      const sortField = (req.query.sortField as SortField) || "rank";
      const sortDirection = (req.query.sortDirection as SortDirection) || "asc";
      
      const volumeFilter = (req.query.volumeFilter as VolumeFilter) || "all";
      const marketCapFilter = (req.query.marketCapFilter as MarketCapFilter) || "all";
      const alertFilter = (req.query.alertFilter as AlertFilter) || "all";

      let data: CryptoData[] = [];
      let apiStatus = { callsUsed: 0, callsLimit: 0, minutesUntilReset: 0 };
      
      try {
        // Try to fetch from CoinMarketCap API
        const result = await getLatestCryptoData(100, 1);
        data = result.data;
        apiStatus = result.apiStatus;
      } catch (apiError) {
        console.error("Error from CoinMarketCap API, continuing with fallback:", apiError);
        
        // Use fallback data when API is not available
        data = generateFallbackData();
        console.log(`Using fallback data with ${data.length} cryptocurrencies for demonstration`);
      }
      
      // Apply filters
      let filteredData = data;
      
      // Apply volume filter
      if (volumeFilter !== "all") {
        filteredData = filteredData.filter(crypto => {
          if (volumeFilter === "high") return crypto.volumeToMarketCapRatio > 0.1;
          if (volumeFilter === "medium") return crypto.volumeToMarketCapRatio >= 0.05 && crypto.volumeToMarketCapRatio <= 0.1;
          if (volumeFilter === "low") return crypto.volumeToMarketCapRatio < 0.05;
          return true;
        });
      }
      
      // Apply market cap filter
      if (marketCapFilter !== "all") {
        filteredData = filteredData.filter(crypto => {
          if (marketCapFilter === "large") return crypto.marketCap > 10_000_000_000; // > $10B
          if (marketCapFilter === "medium") return crypto.marketCap > 1_000_000_000 && crypto.marketCap <= 10_000_000_000; // $1B-$10B
          if (marketCapFilter === "small") return crypto.marketCap > 100_000_000 && crypto.marketCap <= 1_000_000_000; // $100M-$1B
          if (marketCapFilter === "micro") return crypto.marketCap <= 100_000_000; // < $100M
          return true;
        });
      }
      
      // Apply alert filter
      if (alertFilter !== "all") {
        filteredData = filteredData.filter(crypto => {
          if (alertFilter === "spike") return crypto.volumeStatus === "spike";
          if (alertFilter === "drop") return crypto.volumeStatus === "drop";
          if (alertFilter === "none") return crypto.volumeStatus === "normal";
          return true;
        });
      }
      
      // Sort the data
      filteredData.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "price":
            comparison = a.price - b.price;
            break;
          case "marketCap":
            comparison = a.marketCap - b.marketCap;
            break;
          case "volume":
            comparison = a.volume24h - b.volume24h;
            break;
          case "ratio":
            comparison = a.volumeToMarketCapRatio - b.volumeToMarketCapRatio;
            break;
          case "change":
            comparison = a.percentChange24h - b.percentChange24h;
            break;
          default:
            comparison = a.rank - b.rank;
        }
        
        return sortDirection === "asc" ? comparison : -comparison;
      });
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredData.length / limit);
      
      // Calculate metrics
      const highVolumeAlerts = data.filter(crypto => crypto.hasVolumeSpike).length;
      const totalRatio = data.reduce((sum, crypto) => sum + crypto.volumeToMarketCapRatio, 0);
      const avgRatio = data.length > 0 ? totalRatio / data.length : 0;

      // Record volume spikes for historical tracking if we have data
      if (data.length > 0) {
        const volumeSpikes = data.filter(crypto => crypto.hasVolumeSpike);
        for (const spike of volumeSpikes) {
          await storage.recordVolumeSpike({
            coinId: spike.id.toString(),
            timestamp: new Date(),
            previousRatio: 0, // We don't have previous data in this implementation
            currentRatio: spike.volumeToMarketCapRatio,
            percentageChange: spike.percentChange24h,
            price: spike.price,
            marketCap: spike.marketCap,
            volume: spike.volume24h
          });
        }
      }
      
      res.json({
        data: paginatedData,
        metrics: {
          totalPairs: data.length,
          highVolumeAlerts,
          avgRatio,
          apiStatus
        },
        lastUpdate: new Date().toISOString(),
        page,
        totalPages,
        totalItems: filteredData.length
      });
    } catch (error) {
      console.error("Error in /api/crypto route:", error);
      res.status(500).json({ 
        message: "Failed to fetch cryptocurrency data", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Search cryptocurrencies
  app.get("/api/crypto/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.length < 2) {
        return res.json({ data: [] });
      }
      
      try {
        // Try to use the API first
        const results = await searchCoins(query);
        res.json({ data: results.slice(0, 10) }); // Limit to 10 results
      } catch (apiError) {
        console.error("Error searching via API, using fallback:", apiError);
        
        // Use fallback data for search
        const fallbackData = generateFallbackData();
        const lowercaseQuery = query.toLowerCase();
        
        // Filter based on name or symbol matching the query
        const results = fallbackData.filter(
          coin => 
            coin.name.toLowerCase().includes(lowercaseQuery) || 
            coin.symbol.toLowerCase().includes(lowercaseQuery)
        );
        
        res.json({ data: results.slice(0, 10) }); // Limit to 10 results
      }
    } catch (error) {
      console.error("Error in search route:", error);
      res.status(500).json({ 
        message: "Failed to search cryptocurrency data", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get API status
  app.get("/api/status", (req: Request, res: Response) => {
    try {
      const status = getApiStatus();
      res.json(status);
    } catch (error) {
      console.error("Error in API status route:", error);
      res.status(500).json({ 
        message: "Failed to get API status", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get volume spike history
  app.get("/api/history/spikes", async (req: Request, res: Response) => {
    try {
      const spikes = await storage.getVolumeSpikes();
      res.json({ data: spikes });
    } catch (error) {
      console.error("Error in volume spikes history route:", error);
      res.status(500).json({ 
        message: "Failed to get volume spikes history", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

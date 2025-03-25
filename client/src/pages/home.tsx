import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import Header from "@/components/crypto-tracker/header";
import MetricsCards from "@/components/crypto-tracker/metrics-cards";
import FilterControls from "@/components/crypto-tracker/filter-controls";
import CryptoTable from "@/components/crypto-tracker/crypto-table";

import { 
  CryptoData, 
  CryptoDataResponse, 
  SortField, 
  SortDirection, 
  VolumeFilter, 
  MarketCapFilter, 
  AlertFilter 
} from "@shared/types";

export default function Home() {
  // State for filters and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("ratio");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>("all");
  const [marketCapFilter, setMarketCapFilter] = useState<MarketCapFilter>("all");
  const [alertFilter, setAlertFilter] = useState<AlertFilter>("all");
  
  // State for refresh control
  const [refreshInterval, setRefreshInterval] = useState<number>(60000);
  const [lastRefresh, setLastRefresh] = useState<string>(new Date().toISOString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CryptoData[]>([]);
  
  // Toast notifications
  const { toast } = useToast();

  // Main query for crypto data
  const {
    data: cryptoData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [
      '/api/crypto',
      currentPage,
      sortField,
      sortDirection,
      volumeFilter,
      marketCapFilter,
      alertFilter
    ],
    queryFn: async () => {
      const response = await fetch(
        `/api/crypto?page=${currentPage}&sortField=${sortField}&sortDirection=${sortDirection}&volumeFilter=${volumeFilter}&marketCapFilter=${marketCapFilter}&alertFilter=${alertFilter}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrency data');
      }
      
      return response.json() as Promise<CryptoDataResponse>;
    },
  });

  // Search query
  const {
    data: searchData,
    isLoading: isSearchLoading
  } = useQuery({
    queryKey: ['/api/crypto/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return { data: [] };
      
      const response = await fetch(`/api/crypto/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search cryptocurrency data');
      }
      
      return response.json() as Promise<{ data: CryptoData[] }>;
    },
    enabled: searchQuery.length >= 2,
  });

  // Update search results when search data changes
  useEffect(() => {
    if (searchData) {
      setSearchResults(searchData.data);
    }
  }, [searchData]);

  // Set up automatic refresh interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      handleRefresh();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Handle error notification
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Callback functions
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastRefresh(new Date().toISOString());
    } catch (err) {
      toast({
        title: "Refresh Failed",
        description: err instanceof Error ? err.message : "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast]);

  const handleSearchResultSelect = useCallback((crypto: CryptoData) => {
    // Focus on selected crypto by setting filters appropriately
    setSearchQuery("");
    
    // Determine market cap filter based on crypto market cap
    let newMarketCapFilter: MarketCapFilter = "all";
    if (crypto.marketCap > 10_000_000_000) {
      newMarketCapFilter = "large";
    } else if (crypto.marketCap > 1_000_000_000) {
      newMarketCapFilter = "medium";
    } else if (crypto.marketCap > 100_000_000) {
      newMarketCapFilter = "small";
    } else {
      newMarketCapFilter = "micro";
    }
    
    // Determine volume filter based on crypto volume ratio
    let newVolumeFilter: VolumeFilter = "all";
    if (crypto.volumeToMarketCapRatio > 0.1) {
      newVolumeFilter = "high";
    } else if (crypto.volumeToMarketCapRatio >= 0.05) {
      newVolumeFilter = "medium";
    } else {
      newVolumeFilter = "low";
    }
    
    // Reset pagination
    setCurrentPage(1);
    
    // Apply filters
    setMarketCapFilter(newMarketCapFilter);
    setVolumeFilter(newVolumeFilter);
    
    // Show a notification
    toast({
      title: `Selected ${crypto.name}`,
      description: `Filtered to show ${crypto.name} and similar cryptocurrencies.`,
    });
  }, [toast]);
  
  const handleSortChange = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  return (
    <div className="min-h-screen font-sans antialiased transition-colors bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-200">
      <Header 
        lastUpdate={cryptoData?.lastUpdate || lastRefresh}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
        onManualRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchResults={searchResults}
        onSearchResultSelect={handleSearchResultSelect}
      />
      
      <div className="container mx-auto px-4 py-6">
        <MetricsCards 
          totalPairs={cryptoData?.metrics.totalPairs || 0}
          highVolumeAlerts={cryptoData?.metrics.highVolumeAlerts || 0}
          avgRatio={cryptoData?.metrics.avgRatio || 0}
          apiCalls={cryptoData?.metrics.apiStatus.callsUsed || 0}
          apiLimit={cryptoData?.metrics.apiStatus.callsLimit || 300}
          minutesUntilReset={cryptoData?.metrics.apiStatus.minutesUntilReset || 0}
          isLoading={isLoading}
        />
        
        <FilterControls 
          volumeFilter={volumeFilter}
          marketCapFilter={marketCapFilter}
          alertFilter={alertFilter}
          onVolumeFilterChange={setVolumeFilter}
          onMarketCapFilterChange={setMarketCapFilter}
          onAlertFilterChange={setAlertFilter}
        />
        
        <CryptoTable 
          data={cryptoData?.data || []}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={cryptoData?.totalPages || 1}
          totalItems={cryptoData?.totalItems || 0}
          onPageChange={setCurrentPage}
          onSortChange={handleSortChange}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </div>
    </div>
  );
}

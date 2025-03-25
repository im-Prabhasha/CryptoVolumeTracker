import { BarChart3 } from "lucide-react";
import SearchBar from "./search-bar";
import RefreshControl from "./refresh-control";
import ThemeToggle from "./theme-toggle";
import { formatTime } from "@/lib/utils";
import { CryptoData } from "@shared/types";

interface HeaderProps {
  lastUpdate: string;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: CryptoData[];
  onSearchResultSelect: (crypto: CryptoData) => void;
}

export function Header({
  lastUpdate,
  refreshInterval,
  onRefreshIntervalChange,
  onManualRefresh,
  isRefreshing,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSearchResultSelect
}: HeaderProps) {
  const lastUpdateTime = lastUpdate ? formatTime(new Date(lastUpdate)) : "--:--:--";

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="flex items-center space-x-2 text-primary">
              <BarChart3 className="h-6 w-6" />
              <h1 className="text-xl font-bold">Crypto V/MC Tracker</h1>
            </div>
            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
              Last update: <span className="font-mono">{lastUpdateTime}</span>
            </span>
          </div>
          
          {/* Controls Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchQueryChange={onSearchQueryChange}
              searchResults={searchResults}
              onSearchResultSelect={onSearchResultSelect}
            />
            
            <RefreshControl 
              refreshInterval={refreshInterval}
              onRefreshIntervalChange={onRefreshIntervalChange}
              onManualRefresh={onManualRefresh}
              isRefreshing={isRefreshing}
            />
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

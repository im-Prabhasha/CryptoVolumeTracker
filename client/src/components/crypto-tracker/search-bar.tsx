import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency, getColorFromSymbol, isColorDark } from "@/lib/utils";
import { CryptoData } from "@shared/types";

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: CryptoData[];
  onSearchResultSelect: (crypto: CryptoData) => void;
}

export function SearchBar({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSearchResultSelect
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the search component to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Open dropdown when we have results and search query is not empty
  useEffect(() => {
    if (searchQuery && searchResults.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchQuery, searchResults]);

  return (
    <div className="relative w-full sm:w-64 md:w-72" ref={searchRef}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
        <Search className="h-4 w-4" />
      </div>
      <Input
        type="text"
        className="w-full pl-10 pr-4 py-2 bg-light-input dark:bg-dark-input border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Search coins..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
      />
      
      {/* Search Results Dropdown */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {searchResults.map((crypto) => (
            <div
              key={crypto.id}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => {
                onSearchResultSelect(crypto);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0 w-6 h-6 bg-white dark:bg-gray-800 rounded-full overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                  {crypto.logoUrl ? (
                    // Real logo from CoinMarketCap API with better error handling
                    <img 
                      src={crypto.logoUrl} 
                      alt={`${crypto.name} logo`} 
                      className="crypto-logo"
                      loading="lazy" 
                      onError={(e) => {
                        // If image fails to load, replace with fallback
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        
                        // Generate a background color with good contrast
                        const bgColor = getColorFromSymbol(crypto.symbol, 1.0);
                        
                        // Check if color is dark (for text color contrast)
                        const isDark = isColorDark(bgColor);
                        const textColor = isDark ? 'white' : '#111827'; // White or dark gray
                        
                        // Create the fallback element
                        const fallbackEl = document.createElement('div');
                        fallbackEl.className = 'fallback-logo';
                        fallbackEl.style.background = `linear-gradient(135deg, ${bgColor}, ${getColorFromSymbol(crypto.symbol, 0.7)})`;
                        
                        // Create the symbol text element
                        const symbolEl = document.createElement('span');
                        symbolEl.style.color = textColor;
                        symbolEl.style.fontWeight = '600';
                        symbolEl.style.fontSize = '0.65rem';
                        symbolEl.textContent = crypto.symbol.substring(0, 2);
                        
                        // Append everything
                        fallbackEl.appendChild(symbolEl);
                        target.parentElement!.appendChild(fallbackEl);
                      }}
                    />
                  ) : (
                    // Improved fallback with better contrast
                    <div className="fallback-logo" 
                         style={{
                           background: `linear-gradient(135deg, ${getColorFromSymbol(crypto.symbol, 0.9)}, ${getColorFromSymbol(crypto.symbol, 0.7)})`,
                         }}>
                      <span style={{ 
                        color: isColorDark(getColorFromSymbol(crypto.symbol, 0.9)) ? 'white' : '#111827',
                        fontWeight: '600',
                        fontSize: '0.65rem' 
                      }}>
                        {crypto.symbol.substring(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{crypto.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{crypto.symbol}</p>
                </div>
                <div className="text-xs font-mono text-gray-900 dark:text-gray-100">{formatCurrency(crypto.price)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;

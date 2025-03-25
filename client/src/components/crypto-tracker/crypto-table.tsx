import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  formatCurrency, 
  formatPercentage, 
  formatRatio, 
  getVolumeStatusLabel, 
  getVolumeStatusColor,
  getVolumeStatusIcon,
  getChangeColor,
  getChangeIcon,
  getColorFromSymbol,
  isColorDark
} from "@/lib/utils";
import { CryptoData, SortField, SortDirection } from "@shared/types";

interface CryptoTableProps {
  data: CryptoData[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  sortField: SortField;
  sortDirection: SortDirection;
}

export function CryptoTable({
  data,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onSortChange,
  sortField,
  sortDirection,
}: CryptoTableProps) {
  const [pages, setPages] = useState<(number | "ellipsis")[]>([]);

  useEffect(() => {
    const calculatePages = () => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1) as (number | "ellipsis")[];
      }

      if (currentPage <= 3) {
        return [1, 2, 3, 4, 5, "ellipsis" as const, totalPages] as (number | "ellipsis")[];
      }

      if (currentPage >= totalPages - 2) {
        return [1, "ellipsis" as const, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as (number | "ellipsis")[];
      }

      return [
        1,
        "ellipsis" as const,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis" as const,
        totalPages,
      ] as (number | "ellipsis")[];
    };

    setPages(calculatePages());
  }, [currentPage, totalPages]);

  const handleSort = (field: SortField) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    onSortChange(field, newDirection);
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getHeaderClasses = (field: SortField) => {
    return `cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
      field === sortField ? "text-primary" : ""
    }`;
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-light-card dark:bg-dark-card rounded-lg shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading cryptocurrency data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-lg shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead 
                className={getHeaderClasses("name")}
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead 
                className={getHeaderClasses("price")}
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center space-x-1">
                  <span>Price</span>
                  {getSortIcon("price")}
                </div>
              </TableHead>
              <TableHead 
                className={getHeaderClasses("marketCap")}
                onClick={() => handleSort("marketCap")}
              >
                <div className="flex items-center space-x-1">
                  <span>Market Cap</span>
                  {getSortIcon("marketCap")}
                </div>
              </TableHead>
              <TableHead 
                className={getHeaderClasses("volume")}
                onClick={() => handleSort("volume")}
              >
                <div className="flex items-center space-x-1">
                  <span>24h Volume</span>
                  {getSortIcon("volume")}
                </div>
              </TableHead>
              <TableHead 
                className={getHeaderClasses("ratio")}
                onClick={() => handleSort("ratio")}
              >
                <div className="flex items-center space-x-1">
                  <span>V/MC Ratio</span>
                  {getSortIcon("ratio")}
                </div>
              </TableHead>
              <TableHead 
                className={getHeaderClasses("change")}
                onClick={() => handleSort("change")}
              >
                <div className="flex items-center space-x-1">
                  <span>24h Change</span>
                  {getSortIcon("change")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No cryptocurrencies found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              data.map((crypto) => (
                <TableRow 
                  key={crypto.id}
                  className={`border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                    crypto.hasVolumeSpike ? "bg-danger/5" : ""
                  }`}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex-shrink-0 bg-white dark:bg-gray-800 rounded-full overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                        {crypto.logoUrl ? (
                          // Real logo from CoinMarketCap API with enhanced error handling
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
                              symbolEl.style.fontSize = '0.75rem';
                              symbolEl.textContent = crypto.symbol.substring(0, 3);
                              
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
                              fontSize: '0.75rem' 
                            }}>
                              {crypto.symbol.substring(0, 3)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{crypto.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{crypto.symbol}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(crypto.price)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(crypto.marketCap)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(crypto.volume24h)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono font-medium text-base ${
                        crypto.volumeToMarketCapRatio > 0.1 ? "text-emerald-600 dark:text-emerald-400" : 
                        crypto.volumeToMarketCapRatio > 0.05 ? "text-amber-600 dark:text-amber-400" : ""
                      }`}>
                        {formatRatio(crypto.volumeToMarketCapRatio)}
                      </span>
                      <div className={`text-xs px-2 py-1 rounded-full border ${getVolumeStatusColor(crypto.volumeStatus)} flex items-center space-x-1`}>
                        <span className="font-bold">{getVolumeStatusIcon(crypto.volumeStatus)}</span>
                        <span>{getVolumeStatusLabel(crypto.volumeStatus)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center font-medium ${getChangeColor(crypto.percentChange24h)}`}>
                      <span className="mr-1 text-lg leading-none font-bold">
                        {getChangeIcon(crypto.percentChange24h)}
                      </span>
                      <span className="font-mono">{formatPercentage(crypto.percentChange24h)}</span>
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * 20, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                    />
                  </PaginationItem>
                  
                  {pages.map((page, i) => 
                    page === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => onPageChange(page as number)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CryptoTable;

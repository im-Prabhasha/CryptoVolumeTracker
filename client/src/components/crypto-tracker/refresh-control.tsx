import { RefreshCw, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RefreshControlProps {
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
}

export function RefreshControl({
  refreshInterval,
  onRefreshIntervalChange,
  onManualRefresh,
  isRefreshing
}: RefreshControlProps) {
  // Format display text for interval
  const getIntervalText = (interval: number) => {
    switch(interval) {
      case 30000: return "30s";
      case 60000: return "1m";
      case 300000: return "5m";
      case 600000: return "10m";
      default: return "30s";
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-light-input dark:bg-dark-input px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto-refresh:</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select
                value={refreshInterval.toString()}
                onValueChange={(value) => onRefreshIntervalChange(parseInt(value))}
              >
                <SelectTrigger className="border-0 bg-transparent font-medium text-primary dark:text-primary p-0 shadow-none h-auto min-w-0 w-16 focus:ring-0">
                  <SelectValue placeholder="60000">{getIntervalText(refreshInterval)}</SelectValue>
                </SelectTrigger>
                <SelectContent className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <div className="font-medium">Update frequency</div>
                    <div>Updated in real-time across all tracked pairs</div>
                  </div>
                  <SelectItem value="30000" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">30s</SelectItem>
                  <SelectItem value="60000" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">1m</SelectItem>
                  <SelectItem value="300000" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">5m</SelectItem>
                  <SelectItem value="600000" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">10m</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
            <p>How often to refresh cryptocurrency data</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "p-1 h-7 w-7 rounded-full",
                "hover:bg-primary/10 dark:hover:bg-primary/20",
                "focus:ring-0 focus:outline-none",
                "transition-colors duration-200",
                isRefreshing ? "text-primary" : "text-gray-600 dark:text-gray-300",
                isRefreshing && "bg-primary/5 dark:bg-primary/10"
              )}
              onClick={onManualRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn(
                "h-4 w-4",
                isRefreshing && "animate-spin",
                "text-current"
              )} />
              {isRefreshing && (
                <span className="sr-only">Refreshing data...</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
            <p>Manually refresh data now</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default RefreshControl;

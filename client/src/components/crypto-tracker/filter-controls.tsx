import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VolumeFilter, MarketCapFilter, AlertFilter } from "@shared/types";

interface FilterControlsProps {
  volumeFilter: VolumeFilter;
  marketCapFilter: MarketCapFilter;
  alertFilter: AlertFilter;
  onVolumeFilterChange: (value: VolumeFilter) => void;
  onMarketCapFilterChange: (value: MarketCapFilter) => void;
  onAlertFilterChange: (value: AlertFilter) => void;
}

export function FilterControls({
  volumeFilter,
  marketCapFilter,
  alertFilter,
  onVolumeFilterChange,
  onMarketCapFilterChange,
  onAlertFilterChange,
}: FilterControlsProps) {
  return (
    <div className="bg-light-card dark:bg-dark-card rounded-lg shadow p-4 mb-6 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold mb-2 md:mb-0">Volume/Market Cap Ratios</h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="w-full sm:w-auto">
            <Select
              value={volumeFilter}
              onValueChange={(value) => onVolumeFilterChange(value as VolumeFilter)}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-light-input dark:bg-dark-input border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="All Volume" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Volume</SelectItem>
                <SelectItem value="high">High Volume (&gt;0.1)</SelectItem>
                <SelectItem value="medium">Medium Volume (0.05-0.1)</SelectItem>
                <SelectItem value="low">Low Volume (&lt;0.05)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto">
            <Select
              value={marketCapFilter}
              onValueChange={(value) => onMarketCapFilterChange(value as MarketCapFilter)}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-light-input dark:bg-dark-input border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="All Market Caps" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Market Caps</SelectItem>
                <SelectItem value="large">Large Cap (&gt;$10B)</SelectItem>
                <SelectItem value="medium">Medium Cap ($1B-$10B)</SelectItem>
                <SelectItem value="small">Small Cap ($100M-$1B)</SelectItem>
                <SelectItem value="micro">Micro Cap (&lt;$100M)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto">
            <Select
              value={alertFilter}
              onValueChange={(value) => onAlertFilterChange(value as AlertFilter)}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-light-input dark:bg-dark-input border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="All Alerts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="spike">Volume Spikes</SelectItem>
                <SelectItem value="drop">Volume Drops</SelectItem>
                <SelectItem value="none">No Alerts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterControls;

import { 
  Milestone, 
  AlertTriangle, 
  BarChart, 
  Cloud,
  ArrowUp,
  Clock
} from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { formatCurrency, formatRatio, formatMinutesSeconds } from "@/lib/utils";

interface MetricsCardsProps {
  totalPairs: number;
  highVolumeAlerts: number;
  avgRatio: number;
  apiCalls: number;
  apiLimit: number;
  minutesUntilReset: number;
  isLoading: boolean;
}

export function MetricsCards({
  totalPairs,
  highVolumeAlerts,
  avgRatio,
  apiCalls,
  apiLimit,
  minutesUntilReset,
  isLoading
}: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="shadow border border-gray-100 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Tracked Pairs</h3>
              <p className="text-2xl font-bold mt-1 font-mono">{totalPairs.toLocaleString()}</p>
            </div>
            <Milestone className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-2 text-xs flex items-center text-secondary">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span className="whitespace-nowrap">Updated in real-time</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow border border-gray-100 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">High Volume Alerts</h3>
              <p className="text-2xl font-bold mt-1 font-mono text-danger">{highVolumeAlerts}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
          <div className="mt-2 text-xs flex items-center text-danger">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span className="whitespace-nowrap">Coins with ratio &gt; 0.1</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow border border-gray-100 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">Avg V/MC Ratio</h3>
              <p className="text-2xl font-bold mt-1 font-mono">{formatRatio(avgRatio)}</p>
            </div>
            <BarChart className="h-5 w-5 text-warning" />
          </div>
          <div className="mt-2 text-xs flex items-center text-secondary">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span className="whitespace-nowrap">Across all tracked pairs</span>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow border border-gray-100 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">API Calls</h3>
              <p className="text-2xl font-bold mt-1 font-mono">{apiCalls}/{apiLimit}</p>
            </div>
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-2 text-xs flex items-center text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3 mr-1" />
            <span className="whitespace-nowrap">Resets in {formatMinutesSeconds(minutesUntilReset)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MetricsCards;

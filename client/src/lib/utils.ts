import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number as currency
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else if (value < 0.01) {
    return `$${value.toFixed(8)}`;
  } else if (value < 1) {
    return `$${value.toFixed(4)}`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

// Format ratio as percentage with 2 decimal places
export function formatRatio(value: number): string {
  // Convert decimal to percentage (multiply by 100)
  const percentage = value * 100;
  return `${percentage.toFixed(2)}%`;
}

// Format time
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// Format minutes and seconds for countdown
export function formatMinutesSeconds(totalMinutes: number): string {
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.floor((totalMinutes - minutes) * 60);
  return `${minutes}m ${seconds}s`;
}

// Determine if there is a volume spike
export function hasVolumeSpike(ratio: number): boolean {
  return ratio > 0.1;
}

// Get volume status label
export function getVolumeStatusLabel(status: string): string {
  switch (status) {
    case 'spike':
      return 'Volume Pump';
    case 'drop':
      return 'Volume Drop';
    default:
      return 'Normal';
  }
}

// Get volume status color and styling with WCAG-compliant contrast
export function getVolumeStatusColor(status: string): string {
  switch (status) {
    case 'spike':
      return 'status-spike';
    case 'drop':
      return 'status-drop';
    default:
      return 'status-normal';
  }
}

// Get volume status icon with more visible symbols
export function getVolumeStatusIcon(status: string): string {
  switch (status) {
    case 'spike':
      return '▲'; // Up triangle
    case 'drop':
      return '▼'; // Down triangle
    default:
      return '•'; // Bullet
  }
}

// Get change indicator color with WCAG AA compliant contrast ratios
export function getChangeColor(change: number): string {
  // Enhanced contrast for both light and dark modes
  if (change > 5) return 'text-emerald-800 dark:text-emerald-300 font-medium';
  if (change >= 0) return 'text-emerald-700 dark:text-emerald-400 font-medium';
  if (change < -5) return 'text-red-800 dark:text-red-300 font-medium';
  return 'text-red-700 dark:text-red-400 font-medium';
}

// Get change icon with enhanced visibility
export function getChangeIcon(change: number): string {
  return change >= 0 ? '▲' : '▼';
}

// Generate a consistent color based on cryptocurrency symbol
// With enhanced contrast for accessibility
export function getColorFromSymbol(symbol: string, opacity: number = 1): string {
  // Use a simple hash function to convert symbol to a number
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to RGB values
  const r = Math.abs((hash & 0xFF0000) >> 16);
  const g = Math.abs((hash & 0x00FF00) >> 8);
  const b = Math.abs(hash & 0x0000FF);
  
  // Generate vibrant colors that ensure good contrast
  const maxComponent = Math.max(r, g, b);
  const factor = 220 / (maxComponent || 1); // Higher value for more vibrant colors
  
  // Adjust colors to ensure they're vibrant but not too bright
  const adjustedR = Math.min(255, Math.floor(r * factor));
  const adjustedG = Math.min(255, Math.floor(g * factor));
  const adjustedB = Math.min(255, Math.floor(b * factor));
  
  // Ensure color is dark enough for white text
  const luminance = 0.299 * adjustedR + 0.587 * adjustedG + 0.114 * adjustedB;
  
  // If color is too light (luminance > 186), darken it to ensure contrast with white text
  if (luminance > 186) {
    const darkenFactor = 0.6; // Reduce brightness to 60%
    return `rgba(${Math.floor(adjustedR * darkenFactor)}, ${Math.floor(adjustedG * darkenFactor)}, ${Math.floor(adjustedB * darkenFactor)}, ${opacity})`;
  }
  
  return `rgba(${adjustedR}, ${adjustedG}, ${adjustedB}, ${opacity})`;
}

// Check if a background color is dark (for dynamic text color)
export function isColorDark(backgroundColor: string): boolean {
  // Parse the rgba string
  const rgbaMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (!rgbaMatch) return false;
  
  // Extract RGB values
  const r = parseInt(rgbaMatch[1], 10);
  const g = parseInt(rgbaMatch[2], 10);
  const b = parseInt(rgbaMatch[3], 10);
  
  // Calculate luminance - standard formula for perceived brightness
  // Higher values are lighter colors
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if the color is dark (luminance < 0.5)
  return luminance < 0.5;
}

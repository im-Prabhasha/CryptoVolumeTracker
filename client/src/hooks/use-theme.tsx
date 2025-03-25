import { useTheme as useAppTheme } from "../App";

// Re-export the theme hook from App.tsx
export function useTheme() {
  return useAppTheme();
}

// Note: This file is maintained for backwards compatibility.
// The actual theme implementation is in App.tsx
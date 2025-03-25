import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Implement a standalone theme toggle that doesn't rely on context
export function ThemeToggle() {
  // Local state to track the current theme
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");
  
  // Initialize from localStorage on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const isDark = document.documentElement.classList.contains("dark");
    
    // Set local state based on what's actually in the DOM
    setCurrentTheme(isDark ? "dark" : "light");
    
    console.log(`ThemeToggle mounted, current theme: ${isDark ? "dark" : "light"}`);
  }, []);
  
  // Function to directly toggle the theme
  const toggleThemeDirectly = () => {
    // Determine the new theme (opposite of current)
    const newTheme = currentTheme === "light" ? "dark" : "light";
    console.log(`Directly toggling theme: ${currentTheme} -> ${newTheme}`);
    
    try {
      // 1. Update the HTML document class (this affects Tailwind)
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
      
      // 2. Update local storage
      localStorage.setItem("theme", newTheme);
      
      // 3. Update the theme JSON using the vite plugin (if applicable)
      try {
        const themeObj = JSON.parse(localStorage.getItem("theme-json") || "{}");
        themeObj.appearance = newTheme;
        localStorage.setItem("theme-json", JSON.stringify(themeObj));
      } catch (e) {
        console.error("Error updating theme-json:", e);
      }
      
      // 4. Update our local state
      setCurrentTheme(newTheme);
      
      console.log(`Theme successfully toggled to: ${newTheme}`);
    } catch (error) {
      console.error("Error toggling theme:", error);
    }
  };
  
  // Determine the current actual theme from the DOM
  const isDarkTheme = document.documentElement.classList.contains("dark");
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline"
            className={cn(
              "flex items-center justify-center gap-2",
              "h-10 px-3 py-2 rounded-lg",
              "border border-gray-200 dark:border-gray-700", // Thinner, more subtle border
              "bg-white dark:bg-gray-800",
              "hover:bg-gray-50 dark:hover:bg-gray-700", // Subtle hover effect
              "shadow-sm",
              "transition-colors duration-150",
              "focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600" // Removed blue focus ring
            )}
            onClick={toggleThemeDirectly}
            aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
          >
            {!isDarkTheme ? (
              <>
                <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-gray-200">Light</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
        >
          <p>Switch to {isDarkTheme ? "light" : "dark"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ThemeToggle;

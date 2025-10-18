import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "svg-editor-recent-colors";
const MAX_RECENT_COLORS = 12;

/**
 * Hook to manage recent colors used in the SVG editor
 * Persists colors to localStorage and maintains a fixed-size history
 */
export function useRecentColors() {
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Load recent colors from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const colors = JSON.parse(stored);
        if (Array.isArray(colors)) {
          setRecentColors(colors.slice(0, MAX_RECENT_COLORS));
        }
      }
    } catch (error) {
      console.error("Failed to load recent colors:", error);
    }
  }, []);

  // Add a color to recent colors history
  const addRecentColor = useCallback((color: string) => {
    setRecentColors((prev) => {
      // Normalize color to lowercase for consistency
      const normalizedColor = color.toLowerCase();

      // Remove existing instance if present
      const filtered = prev.filter((c) => c.toLowerCase() !== normalizedColor);

      // Add to beginning
      const updated = [normalizedColor, ...filtered].slice(0, MAX_RECENT_COLORS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recent colors:", error);
      }

      return updated;
    });
  }, []);

  // Clear all recent colors
  const clearRecentColors = useCallback(() => {
    setRecentColors([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recent colors:", error);
    }
  }, []);

  return {
    recentColors,
    addRecentColor,
    clearRecentColors,
  };
}

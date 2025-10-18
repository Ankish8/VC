import { useState, useCallback } from "react";

const MAX_HISTORY_SIZE = 50;

export interface HistoryState<T> {
  state: T;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushState: (newState: T) => void;
  clear: () => void;
  reset: (initialState: T) => void;
}

/**
 * Generic undo/redo hook with history management
 * @param initialState - Initial state value
 * @param maxSize - Maximum history size (default: 50)
 * @returns History state and control functions
 */
export function useHistory<T>(
  initialState: T,
  maxSize: number = MAX_HISTORY_SIZE
): HistoryState<T> {
  // Stack of all states
  const [states, setStates] = useState<T[]>([initialState]);

  // Current position in history (0 = oldest, length-1 = newest)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Can we undo? (not at the beginning)
  const canUndo = currentIndex > 0;

  // Can we redo? (not at the end)
  const canRedo = currentIndex < states.length - 1;

  // Current state at the current index
  const currentState = states[currentIndex];

  /**
   * Push a new state to history
   * Clears any forward history if we're not at the end
   */
  const pushState = useCallback(
    (newState: T) => {
      setStates((prevStates) => {
        // Remove all states after current index (clear redo history)
        const newStates = prevStates.slice(0, currentIndex + 1);

        // Add new state
        newStates.push(newState);

        // Limit history size (keep most recent states)
        if (newStates.length > maxSize) {
          return newStates.slice(newStates.length - maxSize);
        }

        return newStates;
      });

      // Move to the new state
      setCurrentIndex((prev) => Math.min(prev + 1, maxSize - 1));
    },
    [currentIndex, maxSize]
  );

  /**
   * Undo to previous state
   */
  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [canUndo]);

  /**
   * Redo to next state
   */
  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [canRedo]);

  /**
   * Clear all history and start fresh
   */
  const clear = useCallback(() => {
    setStates([initialState]);
    setCurrentIndex(0);
  }, [initialState]);

  /**
   * Reset history to a new initial state
   */
  const reset = useCallback((newInitialState: T) => {
    setStates([newInitialState]);
    setCurrentIndex(0);
  }, []);

  return {
    state: currentState,
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    clear,
    reset,
  };
}

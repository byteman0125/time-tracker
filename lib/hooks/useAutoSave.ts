import { useEffect, useRef } from "react";

export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => void | Promise<void>,
  delay: number = 3000
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousValueRef = useRef<T>(value);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only save if value actually changed
    if (JSON.stringify(value) !== JSON.stringify(previousValueRef.current)) {
      previousValueRef.current = value;

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        onSave(value);
      }, delay);
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSave, delay]);
}


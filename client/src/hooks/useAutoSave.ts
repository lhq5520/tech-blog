import { useEffect, useRef, useCallback } from "react";
import { type BlogFormData } from "../types";

interface UseAutoSaveOptions {
  formData: BlogFormData;
  storageKey: string;
  debounceMs?: number;
  enabled?: boolean;
  onSave?: (draft: BlogFormData) => void;
  onSaving?: () => void;
}

/**
 * Custom hook for auto-saving form data to localStorage
 * @param formData - The form data to save
 * @param storageKey - Unique key for localStorage
 * @param debounceMs - Debounce delay in milliseconds (default: 2000)
 * @param enabled - Whether auto-save is enabled (default: true)
 * @param onSave - Optional callback when data is saved
 */
export const useAutoSave = ({
  formData,
  storageKey,
  debounceMs = 2000,
  enabled = true,
  onSave,
  onSaving,
}: UseAutoSaveOptions) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const isFirstRender = useRef(true);

  // Save to localStorage
  const saveDraft = useCallback(
    (data: BlogFormData) => {
      try {
        const dataString = JSON.stringify(data);
        // Only save if data has changed
        if (dataString !== lastSavedRef.current) {
          localStorage.setItem(storageKey, dataString);
          localStorage.setItem(`${storageKey}_timestamp`, new Date().toISOString());
          lastSavedRef.current = dataString;
          onSave?.(data);
        }
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    },
    [storageKey, onSave]
  );

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled) return;
    
    // Skip first render to avoid triggering on initial load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Check if data has changed
    const dataString = JSON.stringify(formData);
    if (dataString === lastSavedRef.current) {
      return; // No changes, skip saving
    }

    // Only save if there's actual content
    if (!formData.title && !formData.subtitle && !formData.content) {
      return;
    }

    // Notify that saving is starting
    onSaving?.();

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveDraft(formData);
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, debounceMs, enabled, saveDraft, onSaving]);

  // Load draft from localStorage
  const loadDraft = useCallback((): BlogFormData | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
    return null;
  }, [storageKey]);

  // Get last saved timestamp
  const getLastSavedTime = useCallback((): Date | null => {
    try {
      const timestamp = localStorage.getItem(`${storageKey}_timestamp`);
      if (timestamp) {
        return new Date(timestamp);
      }
    } catch (error) {
      console.error("Error getting last saved time:", error);
    }
    return null;
  }, [storageKey]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_timestamp`);
      lastSavedRef.current = "";
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  }, [storageKey]);

  return {
    loadDraft,
    clearDraft,
    getLastSavedTime,
    saveDraft,
  };
};

import { useState, useCallback } from 'react';

export interface UseMultipleSelectionProps<T> {
  items: T[];
  getItemId: (item: T) => string | number;
}

export interface UseMultipleSelectionReturn<T> {
  selectedItems: Set<string | number>;
  isSelectionMode: boolean;
  selectedCount: number;
  isSelected: (item: T) => boolean;
  toggleSelection: (item: T) => void;
  selectAll: () => void;
  clearSelection: () => void;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  getSelectedItems: () => T[];
}

export function useMultipleSelection<T>({
  items,
  getItemId
}: UseMultipleSelectionProps<T>): UseMultipleSelectionReturn<T> {
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const selectedCount = selectedItems.size;

  const isSelected = useCallback((item: T) => {
    return selectedItems.has(getItemId(item));
  }, [selectedItems, getItemId]);

  const toggleSelection = useCallback((item: T) => {
    const itemId = getItemId(item);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, [getItemId]);

  const selectAll = useCallback(() => {
    const allIds = items.map(getItemId);
    setSelectedItems(new Set(allIds));
  }, [items, getItemId]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    clearSelection();
  }, [clearSelection]);

  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedItems.has(getItemId(item)));
  }, [items, selectedItems, getItemId]);

  return {
    selectedItems,
    isSelectionMode,
    selectedCount,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    getSelectedItems
  };
}
import { useState, useEffect, useCallback } from 'react';
import { Highlight, HighlightsMap } from '../types';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

export function useHighlights(bookId: string) {
  const [highlights, setHighlights] = useState<HighlightsMap>({});

  useEffect(() => {
    if (!bookId) return;
    storage.get<HighlightsMap>(STORAGE_KEYS.getHighlightsKey(bookId)).then((saved) => {
      if (saved) setHighlights(saved);
    });
  }, [bookId]);

  const addHighlight = useCallback(async (pageIndex: number, highlight: Omit<Highlight, 'pageIndex'>) => {
    const newHighlight: Highlight = { ...highlight, pageIndex };
    setHighlights((prev) => {
      const pageHighlights = prev[pageIndex] || [];
      const updated = { ...prev, [pageIndex]: [...pageHighlights, newHighlight] };
      storage.set(STORAGE_KEYS.getHighlightsKey(bookId), updated);
      return updated;
    });
  }, [bookId]);

  const removeHighlight = useCallback(async (pageIndex: number, index: number) => {
    setHighlights((prev) => {
      const pageHighlights = (prev[pageIndex] || []).filter((_, i) => i !== index);
      const updated = { ...prev, [pageIndex]: pageHighlights };
      storage.set(STORAGE_KEYS.getHighlightsKey(bookId), updated);
      return updated;
    });
  }, [bookId]);

  return { highlights, addHighlight, removeHighlight };
}

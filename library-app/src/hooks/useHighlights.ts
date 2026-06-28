import { useState, useEffect, useCallback } from 'react';
import { Highlight, HighlightsMap } from '../types';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

export function useHighlights(bookId: string) {
  const [highlights, setHighlights] = useState<HighlightsMap>({});

  useEffect(() => {
    storage.get<HighlightsMap>(STORAGE_KEYS.getHighlightsKey(bookId)).then((saved) => {
      if (saved) setHighlights(saved);
    });
  }, [bookId]);

  const addHighlight = useCallback(async (pageIndex: number, highlight: Omit<Highlight, 'pageIndex'>) => {
    const newHighlight: Highlight = { ...highlight, pageIndex };
    const pageHighlights = highlights[pageIndex] || [];
    const updated = { ...highlights, [pageIndex]: [...pageHighlights, newHighlight] };
    setHighlights(updated);
    await storage.set(STORAGE_KEYS.getHighlightsKey(bookId), updated);
  }, [highlights, bookId]);

  const removeHighlight = useCallback(async (pageIndex: number, index: number) => {
    const pageHighlights = (highlights[pageIndex] || []).filter((_, i) => i !== index);
    const updated = { ...highlights, [pageIndex]: pageHighlights };
    setHighlights(updated);
    await storage.set(STORAGE_KEYS.getHighlightsKey(bookId), updated);
  }, [highlights, bookId]);

  return { highlights, addHighlight, removeHighlight };
}

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

export interface RecentlyOpened {
  bookId: string;
  openedAt: number;
}

export function useRecentlyOpened() {
  const [recent, setRecent] = useState<RecentlyOpened[]>([]);

  useEffect(() => {
    storage.get<RecentlyOpened[]>(STORAGE_KEYS.getRecentlyOpenedKey()).then((saved) => {
      if (saved) setRecent(saved);
    });
  }, []);

  const recordOpen = useCallback(async (bookId: string) => {
    setRecent((prev) => {
      const filtered = prev.filter((r) => r.bookId !== bookId);
      const updated = [{ bookId, openedAt: Date.now() }, ...filtered].slice(0, 5);
      storage.set(STORAGE_KEYS.getRecentlyOpenedKey(), updated);
      return updated;
    });
  }, []);

  return { recent, recordOpen };
}

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';
import { Book } from '../types';

export interface ReadingStats {
  totalBooksOpened: number;
  totalPagesRead: number;
  totalReadingTimeMs: number;
}

const DEFAULT_STATS: ReadingStats = {
  totalBooksOpened: 0,
  totalPagesRead: 0,
  totalReadingTimeMs: 0,
};

export function useReadingStats() {
  const [stats, setStats] = useState<ReadingStats>(DEFAULT_STATS);

  useEffect(() => {
    storage.get<ReadingStats>(STORAGE_KEYS.getReadingStatsKey()).then((saved) => {
      if (saved) setStats(saved);
    });
  }, []);

  const recordPageRead = useCallback(async () => {
    setStats((prev) => {
      const updated = { ...prev, totalPagesRead: prev.totalPagesRead + 1 };
      storage.set(STORAGE_KEYS.getReadingStatsKey(), updated);
      return updated;
    });
  }, []);

  const recordBookOpened = useCallback(async () => {
    setStats((prev) => {
      const updated = { ...prev, totalBooksOpened: prev.totalBooksOpened + 1 };
      storage.set(STORAGE_KEYS.getReadingStatsKey(), updated);
      return updated;
    });
  }, []);

  const recordReadingTime = useCallback(async (ms: number) => {
    setStats((prev) => {
      const updated = { ...prev, totalReadingTimeMs: prev.totalReadingTimeMs + ms };
      storage.set(STORAGE_KEYS.getReadingStatsKey(), updated);
      return updated;
    });
  }, []);

  return { stats, recordPageRead, recordBookOpened, recordReadingTime };
}

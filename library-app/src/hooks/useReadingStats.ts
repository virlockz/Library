import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

export interface DailyReading {
  date: string; // YYYY-MM-DD
  minutesRead: number;
  pagesRead: number;
}

export interface ReadingStats {
  totalBooksOpened: number;
  totalPagesRead: number;
  totalReadingTimeMs: number;
  dailyReadings: DailyReading[];
  dailyGoalMinutes: number;
}

const DEFAULT_STATS: ReadingStats = {
  totalBooksOpened: 0,
  totalPagesRead: 0,
  totalReadingTimeMs: 0,
  dailyReadings: [],
  dailyGoalMinutes: 30,
};

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useReadingStats() {
  const [stats, setStats] = useState<ReadingStats>(DEFAULT_STATS);

  useEffect(() => {
    storage.get<ReadingStats>(STORAGE_KEYS.getReadingStatsKey()).then((saved) => {
      if (saved) setStats({ ...DEFAULT_STATS, ...saved });
    });
  }, []);

  const getTodayReading = useCallback((): DailyReading => {
    const today = getTodayKey();
    const existing = stats.dailyReadings.find((r) => r.date === today);
    return existing || { date: today, minutesRead: 0, pagesRead: 0 };
  }, [stats.dailyReadings]);

  const updateDailyReading = useCallback((partial: Partial<DailyReading>) => {
    setStats((prev) => {
      const today = getTodayKey();
      const existing = prev.dailyReadings.find((r) => r.date === today);
      const updatedDaily = existing
        ? prev.dailyReadings.map((r) => r.date === today ? { ...r, ...partial } : r)
        : [...prev.dailyReadings, { date: today, minutesRead: 0, pagesRead: 0, ...partial }];
      const updated = { ...prev, dailyReadings: updatedDaily };
      storage.set(STORAGE_KEYS.getReadingStatsKey(), updated);
      return updated;
    });
  }, []);

  const recordPageRead = useCallback(async () => {
    setStats((prev) => {
      const today = getTodayKey();
      const existing = prev.dailyReadings.find((r) => r.date === today);
      const updatedDaily = existing
        ? prev.dailyReadings.map((r) => r.date === today ? { ...r, pagesRead: r.pagesRead + 1 } : r)
        : [...prev.dailyReadings, { date: today, minutesRead: 0, pagesRead: 1 }];
      const updated = { ...prev, totalPagesRead: prev.totalPagesRead + 1, dailyReadings: updatedDaily };
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
      const today = getTodayKey();
      const minutes = Math.round(ms / 60000);
      const existing = prev.dailyReadings.find((r) => r.date === today);
      const updatedDaily = existing
        ? prev.dailyReadings.map((r) => r.date === today ? { ...r, minutesRead: r.minutesRead + minutes } : r)
        : [...prev.dailyReadings, { date: today, minutesRead: minutes, pagesRead: 0 }];
      const updated = { ...prev, totalReadingTimeMs: prev.totalReadingTimeMs + ms, dailyReadings: updatedDaily };
      storage.set(STORAGE_KEYS.getReadingStatsKey(), updated);
      return updated;
    });
  }, []);

  const setDailyGoal = useCallback(async (minutes: number) => {
    setStats((prev) => {
      const updated = { ...prev, dailyGoalMinutes: minutes };
      storage.set(STORAGE_KEYS.getReadingStatsKey(), updated);
      return updated;
    });
  }, []);

  const getStreak = useCallback((): number => {
    const sorted = [...stats.dailyReadings]
      .filter((r) => r.minutesRead > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (sorted.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (sorted.some((r) => r.date === key)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [stats.dailyReadings]);

  const todayReading = getTodayReading();
  const streak = getStreak();

  return {
    stats,
    todayReading,
    streak,
    dailyGoalMinutes: stats.dailyGoalMinutes,
    recordPageRead,
    recordBookOpened,
    recordReadingTime,
    setDailyGoal,
  };
}

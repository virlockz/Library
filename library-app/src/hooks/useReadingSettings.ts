import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

export interface ReadingSettings {
  fontSize: number;
  lineHeight: number;
  margins: number;
}

const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 17,
  lineHeight: 1.85,
  margins: 40,
};

export function useReadingSettings() {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    storage.get<ReadingSettings>(STORAGE_KEYS.getReadingSettingsKey()).then((saved) => {
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...saved });
    });
  }, []);

  const updateSettings = useCallback((partial: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      storage.set(STORAGE_KEYS.getReadingSettingsKey(), updated);
      return updated;
    });
  }, []);

  return { settings, updateSettings };
}

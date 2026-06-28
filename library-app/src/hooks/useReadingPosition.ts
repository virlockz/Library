import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

export function useReadingPosition(bookId: string) {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!bookId) return;
    storage.get<number>(STORAGE_KEYS.getPageKey(bookId)).then((saved) => {
      if (saved !== null) setPosition(saved);
    });
  }, [bookId]);

  const savePosition = useCallback(async (page: number) => {
    setPosition(page);
    if (bookId) {
      storage.set(STORAGE_KEYS.getPageKey(bookId), page);
    }
  }, [bookId]);

  return { position, savePosition };
}

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';
import { Bookmark } from '../types';

export function useBookmarks(bookId: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    if (!bookId) return;
    storage.get<Bookmark[]>(STORAGE_KEYS.getBookmarksKey(bookId)).then((saved) => {
      if (saved) setBookmarks(saved);
    });
  }, [bookId]);

  const addBookmark = useCallback(async (pageIndex: number, label: string) => {
    const bookmark: Bookmark = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 11),
      pageIndex,
      label,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setBookmarks((prev) => {
      const updated = [...prev, bookmark];
      storage.set(STORAGE_KEYS.getBookmarksKey(bookId), updated);
      return updated;
    });
  }, [bookId]);

  const removeBookmark = useCallback(async (bookmarkId: string) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.id !== bookmarkId);
      storage.set(STORAGE_KEYS.getBookmarksKey(bookId), updated);
      return updated;
    });
  }, [bookId]);

  const isBookmarked = useCallback((pageIndex: number) => {
    return bookmarks.some((b) => b.pageIndex === pageIndex);
  }, [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}

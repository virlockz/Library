import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import { Book } from '../types';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

interface LibraryContextType {
  books: Book[];
  loading: boolean;
  addBook: (book: Book) => Promise<void>;
  removeBook: (bookId: string) => Promise<void>;
  getBook: (bookId: string) => Book | undefined;
  refreshLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshLibrary = useCallback(async () => {
    const saved = await storage.get<Book[]>(STORAGE_KEYS.LIBRARY);
    setBooks(saved || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const addBook = async (book: Book) => {
    const updated = [...books, book];
    setBooks(updated);
    await storage.set(STORAGE_KEYS.LIBRARY, updated);
  };

  const removeBook = async (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (book && book.filePath) {
      await FileSystem.deleteAsync(book.filePath).catch(() => {});
    }
    const updated = books.filter((b) => b.id !== bookId);
    setBooks(updated);
    await storage.set(STORAGE_KEYS.LIBRARY, updated);
  };

  const getBook = (bookId: string) => books.find((b) => b.id === bookId);

  return (
    <LibraryContext.Provider value={{ books, loading, addBook, removeBook, getBook, refreshLibrary }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}

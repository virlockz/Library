import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

export interface Collection {
  id: string;
  name: string;
  bookIds: string[];
}

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    storage.get<Collection[]>(STORAGE_KEYS.getCollectionsKey()).then((saved) => {
      if (saved) setCollections(saved);
    });
  }, []);

  const addCollection = useCallback(async (name: string) => {
    const collection: Collection = {
      id: Date.now().toString(36),
      name,
      bookIds: [],
    };
    setCollections((prev) => {
      const updated = [...prev, collection];
      storage.set(STORAGE_KEYS.getCollectionsKey(), updated);
      return updated;
    });
  }, []);

  const removeCollection = useCallback(async (collectionId: string) => {
    setCollections((prev) => {
      const updated = prev.filter((c) => c.id !== collectionId);
      storage.set(STORAGE_KEYS.getCollectionsKey(), updated);
      return updated;
    });
  }, []);

  const addBookToCollection = useCallback(async (collectionId: string, bookId: string) => {
    setCollections((prev) => {
      const updated = prev.map((c) =>
        c.id === collectionId && !c.bookIds.includes(bookId)
          ? { ...c, bookIds: [...c.bookIds, bookId] }
          : c
      );
      storage.set(STORAGE_KEYS.getCollectionsKey(), updated);
      return updated;
    });
  }, []);

  const removeBookFromCollection = useCallback(async (collectionId: string, bookId: string) => {
    setCollections((prev) => {
      const updated = prev.map((c) =>
        c.id === collectionId
          ? { ...c, bookIds: c.bookIds.filter((id) => id !== bookId) }
          : c
      );
      storage.set(STORAGE_KEYS.getCollectionsKey(), updated);
      return updated;
    });
  }, []);

  return { collections, addCollection, removeCollection, addBookToCollection, removeBookFromCollection };
}

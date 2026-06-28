import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

export function useNotes(bookId: string) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (!bookId) return;
    storage.get<Note[]>(STORAGE_KEYS.getNotesKey(bookId)).then((saved) => {
      if (saved) setNotes(saved);
    });
  }, [bookId]);

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'date'>) => {
    const newNote: Note = {
      ...note,
      id: generateId(),
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setNotes((prev) => {
      const updated = [...prev, newNote];
      storage.set(STORAGE_KEYS.getNotesKey(bookId), updated);
      return updated;
    });
  }, [bookId]);

  const deleteNote = useCallback(async (noteId: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== noteId);
      storage.set(STORAGE_KEYS.getNotesKey(bookId), updated);
      return updated;
    });
  }, [bookId]);

  return { notes, addNote, deleteNote };
}

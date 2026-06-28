import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function useNotes(bookId: string) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
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
    const updated = [...notes, newNote];
    setNotes(updated);
    await storage.set(STORAGE_KEYS.getNotesKey(bookId), updated);
  }, [notes, bookId]);

  const deleteNote = useCallback(async (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    await storage.set(STORAGE_KEYS.getNotesKey(bookId), updated);
  }, [notes, bookId]);

  return { notes, addNote, deleteNote };
}

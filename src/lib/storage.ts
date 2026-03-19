import type { BookMeta, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const STORAGE_PREFIX = 'rulder';
const SETTINGS_KEY = `${STORAGE_PREFIX}:settings`;
const LIBRARY_KEY = `${STORAGE_PREFIX}:library`;

/* ── Settings ──────────────────────────────────────────────────── */

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    console.warn('Failed to save settings to localStorage');
  }
}

/* ── Library (book metadata) ───────────────────────────────────── */

export function loadLibrary(): BookMeta[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLibrary(books: BookMeta[]): void {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(books));
  } catch {
    console.warn('Failed to save library to localStorage');
  }
}

export function getBookMeta(id: string): BookMeta | undefined {
  return loadLibrary().find((b) => b.id === id);
}

export function upsertBookMeta(meta: BookMeta): void {
  const library = loadLibrary();
  const index = library.findIndex((b) => b.id === meta.id);
  if (index >= 0) {
    library[index] = meta;
  } else {
    library.push(meta);
  }
  saveLibrary(library);
}

export function removeBookMeta(id: string): void {
  saveLibrary(loadLibrary().filter((b) => b.id !== id));
}

/** Generate a deterministic ID from filename + size */
export function generateBookId(filename: string, size: number): string {
  const raw = `${filename}:${size}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `book-${Math.abs(hash).toString(36)}`;
}

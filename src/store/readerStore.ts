import { create } from 'zustand';
import type { Rendition, Book } from 'epubjs';
import type { FileType, Bookmark, Highlight, Chapter, SearchResult, BookMeta } from '../types';
import { uid } from '../utils/cn';
import { generateBookId, upsertBookMeta, getBookMeta } from '../lib/storage';

interface ReaderState {
  /* ── File state ──────────────────────────────────────────────── */
  file: File | null;
  fileType: FileType | null;
  bookId: string | null;
  arrayBuffer: ArrayBuffer | null;
  isLoading: boolean;

  /* ── Navigation ──────────────────────────────────────────────── */
  currentPage: number;
  totalPages: number;
  progress: number;
  currentCfi: string;

  /* ── Metadata ────────────────────────────────────────────────── */
  title: string;
  author: string;

  /* ── Chapters (EPUB) ─────────────────────────────────────────── */
  chapters: Chapter[];
  currentChapter: string;

  /* ── Bookmarks & Highlights ──────────────────────────────────── */
  bookmarks: Bookmark[];
  highlights: Highlight[];

  /* ── Search ──────────────────────────────────────────────────── */
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;

  /* ── epub.js references ──────────────────────────────────────── */
  epubBook: Book | null;
  epubRendition: Rendition | null;

  /* ── PDF reference ───────────────────────────────────────────── */
  pdfDocument: unknown;

  /* ── UI state ────────────────────────────────────────────────── */
  isImmersive: boolean;

  /* ── Actions ─────────────────────────────────────────────────── */
  openFile: (file: File) => Promise<void>;
  closeFile: () => void;
  setProgress: (page: number, total: number, progress: number) => void;
  setCfi: (cfi: string) => void;
  setChapters: (chapters: Chapter[]) => void;
  setCurrentChapter: (id: string) => void;
  setTitle: (title: string) => void;
  setAuthor: (author: string) => void;
  setEpubBook: (book: Book) => void;
  setEpubRendition: (rendition: Rendition) => void;
  setPdfDocument: (doc: unknown) => void;
  toggleImmersive: () => void;

  /* ── Bookmarks ───────────────────────────────────────────────── */
  addBookmark: (label: string, location: string) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (location: string) => boolean;

  /* ── Highlights ──────────────────────────────────────────────── */
  addHighlight: (text: string, cfiRange: string, color?: string) => void;
  removeHighlight: (id: string) => void;

  /* ── Search ──────────────────────────────────────────────────── */
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setIsSearching: (val: boolean) => void;

  /* ── Persistence ─────────────────────────────────────────────── */
  persistState: () => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  file: null,
  fileType: null,
  bookId: null,
  arrayBuffer: null,
  isLoading: false,
  currentPage: 0,
  totalPages: 0,
  progress: 0,
  currentCfi: '',
  title: '',
  author: '',
  chapters: [],
  currentChapter: '',
  bookmarks: [],
  highlights: [],
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  epubBook: null,
  epubRendition: null,
  pdfDocument: null,
  isImmersive: false,

  openFile: async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const fileType: FileType | null = ext === 'epub' ? 'epub' : ext === 'pdf' ? 'pdf' : null;

    if (!fileType) {
      console.warn('Unsupported file type:', ext);
      return;
    }

    set({ isLoading: true });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bookId = generateBookId(file.name, file.size);

      // Restore saved metadata if exists
      const saved = getBookMeta(bookId);

      set({
        file,
        fileType,
        bookId,
        arrayBuffer,
        isLoading: false,
        title: saved?.title ?? file.name.replace(/\.[^.]+$/, ''),
        author: saved?.author ?? '',
        bookmarks: saved?.bookmarks ?? [],
        highlights: saved?.highlights ?? [],
        progress: saved?.progress ?? 0,
        currentCfi: saved?.lastPosition ?? '',
        currentPage: 0,
        totalPages: 0,
      });
    } catch (err) {
      console.error('Failed to read file:', err);
      set({ isLoading: false });
    }
  },

  closeFile: () => {
    const state = get();

    // Persist before closing
    state.persistState();

    // Cleanup epub
    if (state.epubRendition) {
      try { state.epubRendition.destroy(); } catch { /* ignore */ }
    }
    if (state.epubBook) {
      try { state.epubBook.destroy(); } catch { /* ignore */ }
    }

    set({
      file: null,
      fileType: null,
      bookId: null,
      arrayBuffer: null,
      isLoading: false,
      currentPage: 0,
      totalPages: 0,
      progress: 0,
      currentCfi: '',
      title: '',
      author: '',
      chapters: [],
      currentChapter: '',
      bookmarks: [],
      highlights: [],
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      epubBook: null,
      epubRendition: null,
      pdfDocument: null,
      isImmersive: false,
    });
  },

  setProgress: (page, total, progress) => set({ currentPage: page, totalPages: total, progress }),
  setCfi: (cfi) => set({ currentCfi: cfi }),
  setChapters: (chapters) => set({ chapters }),
  setCurrentChapter: (id) => set({ currentChapter: id }),
  setTitle: (title) => set({ title }),
  setAuthor: (author) => set({ author }),
  setEpubBook: (book) => set({ epubBook: book }),
  setEpubRendition: (rendition) => set({ epubRendition: rendition }),
  setPdfDocument: (doc) => set({ pdfDocument: doc }),
  toggleImmersive: () => set((s) => ({ isImmersive: !s.isImmersive })),

  addBookmark: (label, location) => {
    const bookmark: Bookmark = { id: uid(), label, location, createdAt: Date.now() };
    set((s) => ({ bookmarks: [...s.bookmarks, bookmark] }));
    get().persistState();
  },

  removeBookmark: (id) => {
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }));
    get().persistState();
  },

  isBookmarked: (location) => {
    return get().bookmarks.some((b) => b.location === location);
  },

  addHighlight: (text, cfiRange, color = '#fbbf24') => {
    const highlight: Highlight = { id: uid(), text, cfiRange, color, createdAt: Date.now() };
    set((s) => ({ highlights: [...s.highlights, highlight] }));
    get().persistState();
  },

  removeHighlight: (id) => {
    set((s) => ({ highlights: s.highlights.filter((h) => h.id !== id) }));
    get().persistState();
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (val) => set({ isSearching: val }),

  persistState: () => {
    const { bookId, title, author, file, fileType, bookmarks, highlights, progress, currentCfi } =
      get();
    if (!bookId || !file || !fileType) return;

    const meta: BookMeta = {
      id: bookId,
      title,
      author,
      filename: file.name,
      fileType,
      lastPosition: currentCfi,
      progress,
      lastRead: Date.now(),
      bookmarks,
      highlights,
    };
    upsertBookMeta(meta);
  },
}));

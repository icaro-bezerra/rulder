import { create } from 'zustand';
import { getPunctuationDelay } from '../utils/textExtractor';

const STORAGE_PREFIX = 'rulder';
const WBW_KEY = `${STORAGE_PREFIX}:wbw`;

/** Persisted word-by-word reading positions keyed by bookId */
interface WbwPositions {
  [bookId: string]: number;
}

function loadWbwPositions(): WbwPositions {
  try {
    const raw = localStorage.getItem(WBW_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveWbwPositions(positions: WbwPositions): void {
  try {
    localStorage.setItem(WBW_KEY, JSON.stringify(positions));
  } catch {
    /* non-critical */
  }
}

export interface WordByWordState {
  /** Full word list extracted from the current book */
  words: string[];
  /** Whether text extraction is in progress */
  isExtracting: boolean;
  /** Current word index */
  currentIndex: number;
  /** Whether playback is running */
  isPlaying: boolean;
  /** Speed in words per minute */
  wpm: number;
  /** Whether to highlight the focal letter (ORP) */
  highlightFocalLetter: boolean;
  /** Chunk size: 1 = single word, 2–3 = multi-word */
  chunkSize: number;
  /** Bold the current word */
  boldWord: boolean;
  /** Font size override for the word display (px) */
  displayFontSize: number;

  /* ── Actions ─────────────────────────────────────────────────── */
  setWords: (words: string[], bookId?: string) => void;
  setIsExtracting: (val: boolean) => void;
  setCurrentIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  restart: () => void;
  nextWord: (count?: number) => void;
  prevWord: (count?: number) => void;
  setWpm: (wpm: number) => void;
  increaseSpeed: () => void;
  decreaseSpeed: () => void;
  setChunkSize: (size: number) => void;
  setHighlightFocalLetter: (val: boolean) => void;
  setBoldWord: (val: boolean) => void;
  setDisplayFontSize: (size: number) => void;
  seekTo: (index: number) => void;
  persistPosition: (bookId: string) => void;
  restorePosition: (bookId: string) => void;
  reset: () => void;

  /* ── Playback engine internals ───────────────────────────────── */
  _timerId: ReturnType<typeof setTimeout> | null;
  _scheduleNext: () => void;
  _stopTimer: () => void;
}

export const useWordByWordStore = create<WordByWordState>((set, get) => ({
  words: [],
  isExtracting: false,
  currentIndex: 0,
  isPlaying: false,
  wpm: 250,
  highlightFocalLetter: true,
  chunkSize: 1,
  boldWord: true,
  displayFontSize: 48,
  _timerId: null,

  setWords: (words, bookId) => {
    set({ words, currentIndex: 0 });
    if (bookId) {
      get().restorePosition(bookId);
    }
  },

  setIsExtracting: (val) => set({ isExtracting: val }),

  setCurrentIndex: (index) => {
    const { words } = get();
    set({ currentIndex: Math.max(0, Math.min(index, words.length - 1)) });
  },

  play: () => {
    set({ isPlaying: true });
    get()._scheduleNext();
  },

  pause: () => {
    get()._stopTimer();
    set({ isPlaying: false });
  },

  togglePlayPause: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  restart: () => {
    get()._stopTimer();
    set({ currentIndex: 0, isPlaying: false });
  },

  nextWord: (count = 1) => {
    const { words, currentIndex } = get();
    const next = Math.min(currentIndex + count, words.length - 1);
    set({ currentIndex: next });
  },

  prevWord: (count = 1) => {
    const { currentIndex } = get();
    const prev = Math.max(currentIndex - count, 0);
    set({ currentIndex: prev });
  },

  setWpm: (wpm) => {
    set({ wpm: Math.max(50, Math.min(1000, wpm)) });
    // Reschedule if playing to apply new speed immediately
    const { isPlaying, _stopTimer, _scheduleNext } = get();
    if (isPlaying) {
      _stopTimer();
      _scheduleNext();
    }
  },

  increaseSpeed: () => {
    const { wpm, setWpm } = get();
    setWpm(Math.min(wpm + 25, 1000));
  },

  decreaseSpeed: () => {
    const { wpm, setWpm } = get();
    setWpm(Math.max(wpm - 25, 50));
  },

  setChunkSize: (size) => set({ chunkSize: Math.max(1, Math.min(5, size)) }),
  setHighlightFocalLetter: (val) => set({ highlightFocalLetter: val }),
  setBoldWord: (val) => set({ boldWord: val }),
  setDisplayFontSize: (size) => set({ displayFontSize: Math.max(20, Math.min(96, size)) }),

  seekTo: (index) => {
    const { words, isPlaying, _stopTimer, _scheduleNext } = get();
    const clamped = Math.max(0, Math.min(index, words.length - 1));
    set({ currentIndex: clamped });
    if (isPlaying) {
      _stopTimer();
      _scheduleNext();
    }
  },

  persistPosition: (bookId) => {
    const positions = loadWbwPositions();
    positions[bookId] = get().currentIndex;
    saveWbwPositions(positions);
  },

  restorePosition: (bookId) => {
    const positions = loadWbwPositions();
    const saved = positions[bookId];
    if (saved !== undefined && saved >= 0 && saved < get().words.length) {
      set({ currentIndex: saved });
    }
  },

  reset: () => {
    get()._stopTimer();
    set({
      words: [],
      isExtracting: false,
      currentIndex: 0,
      isPlaying: false,
    });
  },

  _stopTimer: () => {
    const { _timerId } = get();
    if (_timerId !== null) {
      clearTimeout(_timerId);
      set({ _timerId: null });
    }
  },

  _scheduleNext: () => {
    const { words, currentIndex, wpm, chunkSize, isPlaying } = get();

    if (!isPlaying || currentIndex >= words.length - 1) {
      if (currentIndex >= words.length - 1) {
        set({ isPlaying: false });
      }
      return;
    }

    const baseDelay = 60000 / wpm; // ms per word
    const currentWord = words[currentIndex] ?? '';
    const punctuationMultiplier = getPunctuationDelay(currentWord);
    const delay = baseDelay * punctuationMultiplier;

    const timer = setTimeout(() => {
      const state = get();
      if (!state.isPlaying) return;

      const nextIndex = Math.min(state.currentIndex + chunkSize, state.words.length - 1);
      set({ currentIndex: nextIndex });

      // Schedule the next tick
      state._scheduleNext();
    }, delay);

    set({ _timerId: timer });
  },
}));

import { create } from 'zustand';
import type { Theme, ReadingMode, RulerSettings, TypographySettings, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { loadSettings, saveSettings } from '../lib/storage';

interface SettingsState extends AppSettings {
  /* ── Panel visibility ────────────────────────────────────────── */
  settingsPanelOpen: boolean;
  tocPanelOpen: boolean;
  searchPanelOpen: boolean;
  bookmarksPanelOpen: boolean;

  /* ── Actions ─────────────────────────────────────────────────── */
  setTheme: (theme: Theme) => void;
  setReadingMode: (mode: ReadingMode) => void;
  setTypography: (partial: Partial<TypographySettings>) => void;
  setRuler: (partial: Partial<RulerSettings>) => void;
  toggleRuler: () => void;
  toggleSettingsPanel: () => void;
  toggleTocPanel: () => void;
  toggleSearchPanel: () => void;
  toggleBookmarksPanel: () => void;
  closeAllPanels: () => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const saved = loadSettings();

  const persist = () => {
    const { theme, readingMode, typography, ruler } = get();
    saveSettings({ theme, readingMode, typography, ruler });
  };

  return {
    ...saved,
    settingsPanelOpen: false,
    tocPanelOpen: false,
    searchPanelOpen: false,
    bookmarksPanelOpen: false,

    setTheme: (theme: Theme) => {
      set({ theme });
      document.documentElement.setAttribute('data-theme', theme);
      persist();
    },

    setReadingMode: (readingMode: ReadingMode) => {
      set({ readingMode });
      persist();
    },

    setTypography: (partial: Partial<TypographySettings>) => {
      set((s) => ({ typography: { ...s.typography, ...partial } }));
      persist();
    },

    setRuler: (partial: Partial<RulerSettings>) => {
      set((s) => ({ ruler: { ...s.ruler, ...partial } }));
      persist();
    },

    toggleRuler: () => {
      set((s) => ({ ruler: { ...s.ruler, enabled: !s.ruler.enabled } }));
      persist();
    },

    toggleSettingsPanel: () =>
      set((s) => ({
        settingsPanelOpen: !s.settingsPanelOpen,
        tocPanelOpen: false,
        searchPanelOpen: false,
        bookmarksPanelOpen: false,
      })),

    toggleTocPanel: () =>
      set((s) => ({
        tocPanelOpen: !s.tocPanelOpen,
        settingsPanelOpen: false,
        searchPanelOpen: false,
        bookmarksPanelOpen: false,
      })),

    toggleSearchPanel: () =>
      set((s) => ({
        searchPanelOpen: !s.searchPanelOpen,
        settingsPanelOpen: false,
        tocPanelOpen: false,
        bookmarksPanelOpen: false,
      })),

    toggleBookmarksPanel: () =>
      set((s) => ({
        bookmarksPanelOpen: !s.bookmarksPanelOpen,
        settingsPanelOpen: false,
        tocPanelOpen: false,
        searchPanelOpen: false,
      })),

    closeAllPanels: () =>
      set({
        settingsPanelOpen: false,
        tocPanelOpen: false,
        searchPanelOpen: false,
        bookmarksPanelOpen: false,
      }),

    resetSettings: () => {
      set({ ...DEFAULT_SETTINGS });
      document.documentElement.setAttribute('data-theme', DEFAULT_SETTINGS.theme);
      persist();
    },
  };
});

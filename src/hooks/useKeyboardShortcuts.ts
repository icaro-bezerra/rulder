import { useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useReaderStore } from '../store/readerStore';
import { useSettingsStore } from '../store/settingsStore';

/** Returns true when running inside a Tauri native window. */
const isTauri = (): boolean => '__TAURI_INTERNALS__' in window;

/**
 * Global keyboard shortcuts for the reader application.
 * Binds key events for navigation, ruler, immersive mode, and panel toggles.
 */
export function useKeyboardShortcuts(): void {
  const rendition = useReaderStore((s) => s.epubRendition);
  const fileType = useReaderStore((s) => s.fileType);
  const toggleImmersive = useReaderStore((s) => s.toggleImmersive);
  const toggleRuler = useSettingsStore((s) => s.toggleRuler);
  const toggleSettings = useSettingsStore((s) => s.toggleSettingsPanel);
  const toggleToc = useSettingsStore((s) => s.toggleTocPanel);
  const toggleSearch = useSettingsStore((s) => s.toggleSearchPanel);
  const closeAllPanels = useSettingsStore((s) => s.closeAllPanels);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Escape always works — close panels
      if (e.key === 'Escape') {
        closeAllPanels();
        return;
      }

      // Skip if user is typing in an input
      if (isInput) return;

      switch (e.key) {
        /* ── Navigation ──────────────────────────────────── */
        case 'ArrowRight':
        case 'PageDown':
          if (fileType === 'epub' && rendition) {
            e.preventDefault();
            rendition.next();
          }
          break;
        case 'ArrowLeft':
        case 'PageUp':
          if (fileType === 'epub' && rendition) {
            e.preventDefault();
            rendition.prev();
          }
          break;

        /* ── Toggles ─────────────────────────────────────── */
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            toggleRuler();
          }
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleSearch();
          } else {
            toggleImmersive();
          }
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) {
            toggleSettings();
          }
          break;
        case 't':
          if (!e.ctrlKey && !e.metaKey) {
            toggleToc();
          }
          break;

        /* ── Fullscreen (Tauri native window only) ───────── */
        case 'F11':
          e.preventDefault();
          if (isTauri()) {
            getCurrentWindow().isFullscreen().then((full) => {
              getCurrentWindow().setFullscreen(!full);
            });
          }
          break;

        /* ── Theme cycle ─────────────────────────────────── */
        case 'd':
          if (!e.ctrlKey && !e.metaKey) {
            const { theme, setTheme } = useSettingsStore.getState();
            const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'sepia' : 'light';
            setTheme(next);
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [rendition, fileType, toggleImmersive, toggleRuler, toggleSettings, toggleToc, toggleSearch, closeAllPanels]);
}

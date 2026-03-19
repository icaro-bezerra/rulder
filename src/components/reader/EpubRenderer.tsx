import React, { useEffect, useRef, useCallback } from 'react';
import ePub from 'epubjs';
import type { Rendition, Book, Location, NavItem } from 'epubjs';
import { useReaderStore } from '../../store/readerStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { Chapter } from '../../types';
import { FONT_OPTIONS } from '../../types';

/** Convert epub.js NavItem[] into our Chapter type */
function mapChapters(items: NavItem[]): Chapter[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label.trim(),
    href: item.href,
    subitems: item.subitems ? mapChapters(item.subitems) : undefined,
  }));
}

const EpubRenderer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const arrayBuffer = useReaderStore((s) => s.arrayBuffer);
  const currentCfi = useReaderStore((s) => s.currentCfi);
  const highlights = useReaderStore((s) => s.highlights);
  const setProgress = useReaderStore((s) => s.setProgress);
  const setCfi = useReaderStore((s) => s.setCfi);
  const setChapters = useReaderStore((s) => s.setChapters);
  const setCurrentChapter = useReaderStore((s) => s.setCurrentChapter);
  const setTitle = useReaderStore((s) => s.setTitle);
  const setAuthor = useReaderStore((s) => s.setAuthor);
  const setEpubBook = useReaderStore((s) => s.setEpubBook);
  const setEpubRendition = useReaderStore((s) => s.setEpubRendition);
  const addHighlight = useReaderStore((s) => s.addHighlight);
  const persistState = useReaderStore((s) => s.persistState);

  const readingMode = useSettingsStore((s) => s.readingMode);
  const theme = useSettingsStore((s) => s.theme);
  const typography = useSettingsStore((s) => s.typography);

  /* ── Apply theme + typography to rendition ──────────────────── */
  const applyStyles = useCallback(
    (rendition: Rendition) => {
      const fontOpt = FONT_OPTIONS.find((f) => f.value === typography.fontFamily);
      const fontFamily = fontOpt?.family ?? "'Inter', sans-serif";

      const bgColor =
        theme === 'dark' ? '#0f172a' : theme === 'sepia' ? '#f5f0e8' : '#ffffff';
      const textColor =
        theme === 'dark' ? '#cbd5e1' : theme === 'sepia' ? '#3d2b1f' : '#1a1a2e';

      rendition.themes.default({
        body: {
          'font-family': fontFamily,
          'font-size': `${typography.fontSize}px`,
          'line-height': `${typography.lineHeight}`,
          color: textColor,
          background: bgColor,
          padding: `20px ${typography.margins}px`,
          'max-width': '100%',
          margin: '0 auto',
        },
        'a, a:visited': {
          color: 'var(--accent, #6366f1)',
        },
        '::selection': {
          background: 'rgba(99, 102, 241, 0.2)',
        },
        'p, li, dd, dt, blockquote': {
          'line-height': `${typography.lineHeight}`,
        },
      });
    },
    [theme, typography],
  );

  /* ── Initialise book ────────────────────────────────────────── */
  useEffect(() => {
    if (!arrayBuffer || !containerRef.current) return;

    const container = containerRef.current;
    // Clear previous content
    container.innerHTML = '';

    const book = ePub(arrayBuffer);
    bookRef.current = book;
    setEpubBook(book);

    const flow = readingMode === 'paginated' ? 'paginated' : 'scrolled-doc';

    const rendition = book.renderTo(container, {
      width: '100%',
      height: '100%',
      flow,
      spread: 'none',
      snap: readingMode === 'paginated',
    });

    renditionRef.current = rendition;
    setEpubRendition(rendition);
    applyStyles(rendition);

    // Display at saved position or start
    const startCfi = currentCfi || undefined;
    rendition.display(startCfi);

    // Generate locations for accurate progress
    book.locations.generate(1600).catch(() => {
      /* non-critical */
    });

    /* ── Events ───────────────────────────────────────────────── */
    rendition.on('relocated', (...args: unknown[]) => {
      const location = args[0] as Location;
      const start = location.start;
      const pct = start.percentage ?? 0;
      const page = start.displayed?.page ?? 0;
      const total = start.displayed?.total ?? 0;
      setProgress(page, total, pct);
      setCfi(start.cfi);
      setCurrentChapter(start.href);
      persistState();
    });

    // Handle text selection → highlight
    rendition.on('selected', (...args: unknown[]) => {
      const cfiRange = args[0] as string;
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? '';
      if (text.length > 2) {
        addHighlight(text, cfiRange);
        rendition.annotations.highlight(cfiRange, {}, () => {}, 'hl', {
          fill: 'rgba(251, 191, 36, 0.3)',
        });
      }
    });

    /* ── Load metadata & TOC ──────────────────────────────────── */
    book.loaded.metadata.then((meta) => {
      if (meta.title) setTitle(meta.title);
      if (meta.creator) setAuthor(meta.creator);
    });

    book.loaded.navigation.then((nav) => {
      setChapters(mapChapters(nav.toc));
    });

    return () => {
      try {
        rendition.destroy();
      } catch {
        /* ignore */
      }
      try {
        book.destroy();
      } catch {
        /* ignore */
      }
    };
    // Only re-init when arrayBuffer or readingMode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrayBuffer, readingMode]);

  /* ── Re-apply styles when theme/typography change ───────────── */
  useEffect(() => {
    if (renditionRef.current) {
      applyStyles(renditionRef.current);
    }
  }, [applyStyles]);

  /* ── Re-apply existing highlights ───────────────────────────── */
  useEffect(() => {
    const rendition = renditionRef.current;
    if (!rendition) return;

    highlights.forEach((hl) => {
      try {
        rendition.annotations.highlight(hl.cfiRange, {}, () => {}, 'hl', {
          fill: hl.color ?? 'rgba(251, 191, 36, 0.3)',
        });
      } catch {
        /* CFI may not be in current spine item */
      }
    });
  }, [highlights]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full epub-container"
      style={{ overflow: readingMode === 'scroll' ? 'auto' : 'hidden' }}
    />
  );
};

export default EpubRenderer;

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useReaderStore } from '../../store/readerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { debounce } from '../../utils/cn';

// Configure pdf.js worker via CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type PDFDocProxy = ReturnType<typeof pdfjsLib.getDocument> extends { promise: Promise<infer T> } ? T : never;

const OVERSCAN = 2; // Number of pages to render ahead/behind

const PdfRenderer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<PDFDocProxy | null>(null);
  const renderedPages = useRef<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const arrayBuffer = useReaderStore((s) => s.arrayBuffer);
  const setProgress = useReaderStore((s) => s.setProgress);
  const setPdfDocument = useReaderStore((s) => s.setPdfDocument);
  const setTitle = useReaderStore((s) => s.setTitle);
  const persistState = useReaderStore((s) => s.persistState);

  const readingMode = useSettingsStore((s) => s.readingMode);
  const typography = useSettingsStore((s) => s.typography);
  const theme = useSettingsStore((s) => s.theme);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const bgColor =
    theme === 'dark' ? '#0f172a' : theme === 'sepia' ? '#f5f0e8' : '#ffffff';

  /* ── Render a single page to canvas ─────────────────────────── */
  const renderPage = useCallback(
    async (pdf: PDFDocProxy, pageNum: number, container: HTMLElement) => {
      if (renderedPages.current.has(pageNum)) return;
      renderedPages.current.add(pageNum);

      try {
        const page = await pdf.getPage(pageNum);
        const scale = typography.fontSize / 14; // Base scale relative to default 14
        const viewport = page.getViewport({ scale: scale * 1.5 });

        const wrapper = container.querySelector(`[data-page="${pageNum}"]`) as HTMLElement;
        if (!wrapper) return;

        // Clear placeholder content
        wrapper.innerHTML = '';

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';

        wrapper.appendChild(canvas);
        wrapper.style.height = 'auto';

        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error(`Failed to render page ${pageNum}:`, err);
        renderedPages.current.delete(pageNum);
      }
    },
    [typography.fontSize],
  );

  /* ── Load PDF document ──────────────────────────────────────── */
  useEffect(() => {
    if (!arrayBuffer || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';
    renderedPages.current.clear();

    let cancelled = false;

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        pdfDocRef.current = pdf;
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);

        // Try to extract title from metadata
        const meta = await pdf.getMetadata().catch(() => null);
        if (meta?.info && typeof (meta.info as Record<string, unknown>).Title === 'string') {
          const title = (meta.info as Record<string, unknown>).Title as string;
          if (title) setTitle(title);
        }

        if (readingMode === 'scroll') {
          createScrollLayout(pdf, container);
        } else {
          renderPage(pdf, 1, container);
        }
      } catch (err) {
        console.error('Failed to load PDF:', err);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      observerRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrayBuffer, readingMode]);

  /* ── Create scroll layout with lazy-loading via IntersectionObserver */
  const createScrollLayout = useCallback(
    (pdf: PDFDocProxy, container: HTMLElement) => {
      container.innerHTML = '';
      renderedPages.current.clear();

      // Create placeholder wrappers for all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-page', String(i));
        wrapper.className = 'pdf-page-container';
        wrapper.style.minHeight = '400px';
        wrapper.style.marginBottom = '16px';
        wrapper.style.background = bgColor;
        wrapper.style.borderRadius = '4px';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';

        // Loading placeholder
        const placeholder = document.createElement('div');
        placeholder.textContent = `Page ${i}`;
        placeholder.style.color = 'var(--content-tertiary)';
        placeholder.style.fontSize = '14px';
        wrapper.appendChild(placeholder);

        container.appendChild(wrapper);
      }

      // IntersectionObserver for lazy loading
      observerRef.current?.disconnect();
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const pageNum = Number(entry.target.getAttribute('data-page'));
              if (!pageNum) return;

              // Render this page + overscan pages
              for (let p = Math.max(1, pageNum - OVERSCAN); p <= Math.min(pdf.numPages, pageNum + OVERSCAN); p++) {
                renderPage(pdf, p, container);
              }
            }
          });
        },
        { root: container, rootMargin: '200px 0px' },
      );

      observerRef.current = observer;
      container.querySelectorAll('[data-page]').forEach((el) => observer.observe(el));

      // Track scroll position for progress
      const handleScroll = debounce(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const progress = scrollTop / (scrollHeight - clientHeight || 1);
        const estimatedPage = Math.round(progress * pdf.numPages) || 1;
        setCurrentPage(estimatedPage);
        setProgress(estimatedPage, pdf.numPages, progress);
        persistState();
      }, 150);

      container.addEventListener('scroll', handleScroll as EventListener);
    },
    [renderPage, bgColor, setProgress, persistState],
  );

  /* ── Paginated mode: re-render on page change ───────────────── */
  useEffect(() => {
    if (readingMode !== 'paginated' || !pdfDocRef.current || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';
    renderedPages.current.clear();

    // Create a single page wrapper
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-page', String(currentPage));
    wrapper.className = 'pdf-page-container';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    container.appendChild(wrapper);

    renderPage(pdfDocRef.current, currentPage, container);
    setProgress(currentPage, totalPages, currentPage / totalPages);
    persistState();
  }, [currentPage, readingMode, renderPage, totalPages, setProgress, persistState]);

  /* ── Navigation for paginated mode ──────────────────────────── */
  useEffect(() => {
    if (readingMode !== 'paginated') return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentPage((p) => Math.min(p + 1, totalPages));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentPage((p) => Math.max(p - 1, 1));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [readingMode, totalPages]);

  /* ── Re-render when typography changes ──────────────────────── */
  useEffect(() => {
    if (!pdfDocRef.current || !containerRef.current) return;
    const pdf = pdfDocRef.current;
    const container = containerRef.current;

    renderedPages.current.clear();

    if (readingMode === 'scroll') {
      createScrollLayout(pdf, container);
    } else {
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-page', String(currentPage));
      wrapper.className = 'pdf-page-container';
      wrapper.style.height = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      container.appendChild(wrapper);
      renderPage(pdf, currentPage, container);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typography.fontSize]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto"
      style={{
        padding: `20px ${typography.margins}px`,
        background: bgColor,
      }}
    />
  );
};

export default PdfRenderer;

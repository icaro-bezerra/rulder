import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReaderStore } from '../../store/readerStore';
import { useSettingsStore } from '../../store/settingsStore';
import EpubRenderer from './EpubRenderer';
import PdfRenderer from './PdfRenderer';
import ReadingRuler from './ReadingRuler';
import WordByWordView from './WordByWordView';

/**
 * ReaderView chooses the appropriate renderer (EPUB or PDF)
 * and overlays the ReadingRuler on top.
 */
const ReaderView: React.FC = () => {
  const fileType = useReaderStore((s) => s.fileType);
  const isLoading = useReaderStore((s) => s.isLoading);
  const readingMode = useSettingsStore((s) => s.readingMode);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-content-secondary">Loading…</span>
        </div>
      </div>
    );
  }

  /* ── Word-by-word mode replaces the standard renderer ─────── */
  if (readingMode === 'word-by-word' && fileType) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key="word-by-word"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <WordByWordView />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {fileType === 'epub' && (
          <motion.div
            key="epub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <EpubRenderer />
          </motion.div>
        )}
        {fileType === 'pdf' && (
          <motion.div
            key="pdf"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <PdfRenderer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading ruler overlay */}
      <ReadingRuler />
    </div>
  );
};

export default ReaderView;

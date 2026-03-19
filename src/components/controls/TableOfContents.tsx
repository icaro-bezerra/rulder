import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useReaderStore } from '../../store/readerStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { Chapter } from '../../types';
import GlassPanel from '../ui/GlassPanel';
import IconButton from '../ui/IconButton';

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

const TableOfContents: React.FC = () => {
  const open = useSettingsStore((s) => s.tocPanelOpen);
  const togglePanel = useSettingsStore((s) => s.toggleTocPanel);
  const chapters = useReaderStore((s) => s.chapters);
  const currentChapter = useReaderStore((s) => s.currentChapter);
  const rendition = useReaderStore((s) => s.epubRendition);

  const navigateTo = (href: string) => {
    if (rendition) {
      rendition.display(href);
    }
  };

  const renderChapter = (chapter: Chapter, depth = 0) => {
    const isCurrent = currentChapter?.includes(chapter.href);
    return (
      <div key={chapter.id}>
        <button
          onClick={() => navigateTo(chapter.href)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center gap-2 ${
            isCurrent
              ? 'bg-accent-muted text-accent font-medium'
              : 'text-content-secondary hover:bg-surface-tertiary hover:text-content-primary'
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {chapter.subitems && chapter.subitems.length > 0 && (
            <ChevronRight size={12} className="text-content-tertiary" />
          )}
          <span className="truncate">{chapter.label}</span>
        </button>
        {chapter.subitems?.map((sub) => renderChapter(sub, depth + 1))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="toc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={togglePanel}
          />

          <motion.div
            key="toc-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[90vw] overflow-y-auto"
          >
            <GlassPanel className="h-full rounded-none rounded-l-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-content-primary">Contents</h2>
                <IconButton onClick={togglePanel} size="sm">
                  <X size={16} />
                </IconButton>
              </div>

              {chapters.length === 0 ? (
                <p className="text-sm text-content-tertiary text-center py-8">
                  No table of contents available
                </p>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {chapters.map((ch) => renderChapter(ch))}
                </div>
              )}
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TableOfContents;

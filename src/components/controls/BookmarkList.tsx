import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, BookmarkIcon } from 'lucide-react';
import { useReaderStore } from '../../store/readerStore';
import { useSettingsStore } from '../../store/settingsStore';
import GlassPanel from '../ui/GlassPanel';
import IconButton from '../ui/IconButton';

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

const BookmarkList: React.FC = () => {
  const open = useSettingsStore((s) => s.bookmarksPanelOpen);
  const togglePanel = useSettingsStore((s) => s.toggleBookmarksPanel);

  const bookmarks = useReaderStore((s) => s.bookmarks);
  const removeBookmark = useReaderStore((s) => s.removeBookmark);
  const rendition = useReaderStore((s) => s.epubRendition);
  const fileType = useReaderStore((s) => s.fileType);

  const navigateTo = (location: string) => {
    if (fileType === 'epub' && rendition) {
      rendition.display(location);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={togglePanel}
          />

          <motion.div
            key="bm-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[90vw] overflow-y-auto"
          >
            <GlassPanel className="h-full rounded-none rounded-l-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-content-primary">Bookmarks</h2>
                <IconButton onClick={togglePanel} size="sm">
                  <X size={16} />
                </IconButton>
              </div>

              {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-content-tertiary">
                  <BookmarkIcon size={32} strokeWidth={1} />
                  <p className="text-sm">No bookmarks yet</p>
                  <p className="text-xs text-center">Select text or use the bookmark button to save your position</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-tertiary transition-colors group"
                    >
                      <button
                        onClick={() => navigateTo(bm.location)}
                        className="flex-1 text-left text-sm text-content-secondary hover:text-content-primary truncate"
                      >
                        {bm.label}
                      </button>
                      <span className="text-[10px] text-content-tertiary whitespace-nowrap">
                        {new Date(bm.createdAt).toLocaleDateString()}
                      </span>
                      <IconButton
                        onClick={() => removeBookmark(bm.id)}
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </IconButton>
                    </div>
                  ))}
                </div>
              )}
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookmarkList;

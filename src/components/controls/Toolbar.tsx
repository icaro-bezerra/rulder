import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Maximize2,
  Minimize2,
  Moon,
  Ruler,
  Search,
  Settings,
  Sun,
  Wheat,
} from 'lucide-react';
import { useReaderStore } from '../../store/readerStore';
import { useSettingsStore } from '../../store/settingsStore';
import IconButton from '../ui/IconButton';

interface ToolbarProps {
  visible: boolean;
}

const themeIcons: Record<string, React.ReactNode> = {
  light: <Sun size={18} />,
  dark: <Moon size={18} />,
  sepia: <Wheat size={18} />,
};

const Toolbar: React.FC<ToolbarProps> = ({ visible }) => {
  const title = useReaderStore((s) => s.title);
  const closeFile = useReaderStore((s) => s.closeFile);
  const isImmersive = useReaderStore((s) => s.isImmersive);
  const toggleImmersive = useReaderStore((s) => s.toggleImmersive);
  const currentCfi = useReaderStore((s) => s.currentCfi);
  const addBookmark = useReaderStore((s) => s.addBookmark);
  const isBookmarked = useReaderStore((s) => s.isBookmarked);
  const fileType = useReaderStore((s) => s.fileType);
  const currentPage = useReaderStore((s) => s.currentPage);

  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const rulerEnabled = useSettingsStore((s) => s.ruler.enabled);
  const toggleRuler = useSettingsStore((s) => s.toggleRuler);
  const toggleSettings = useSettingsStore((s) => s.toggleSettingsPanel);
  const toggleToc = useSettingsStore((s) => s.toggleTocPanel);
  const toggleSearch = useSettingsStore((s) => s.toggleSearchPanel);
  const toggleBookmarks = useSettingsStore((s) => s.toggleBookmarksPanel);

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'sepia' : 'light';
    setTheme(next);
  };

  const bookmarkLocation = fileType === 'epub' ? currentCfi : String(currentPage);
  const alreadyBookmarked = isBookmarked(bookmarkLocation);

  const handleBookmark = () => {
    if (!alreadyBookmarked) {
      const label = fileType === 'epub' ? `Page ${currentPage}` : `Page ${currentPage}`;
      addBookmark(label, bookmarkLocation);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute top-0 left-0 right-0 z-30 flex items-center gap-2 px-4 py-2 glass"
        >
          {/* Back button */}
          <IconButton onClick={closeFile} tooltip="Close book (Esc)">
            <ArrowLeft size={18} />
          </IconButton>

          {/* Title */}
          <h1 className="flex-1 text-sm font-medium text-content-primary truncate px-2">
            {title}
          </h1>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <IconButton onClick={toggleSearch} tooltip="Search (Ctrl+F)">
              <Search size={18} />
            </IconButton>

            {fileType === 'epub' && (
              <IconButton onClick={toggleToc} tooltip="Table of contents (T)">
                <BookOpen size={18} />
              </IconButton>
            )}

            <IconButton onClick={toggleBookmarks} tooltip="Bookmarks">
              <Bookmark size={18} fill={alreadyBookmarked ? 'currentColor' : 'none'} />
            </IconButton>

            <IconButton onClick={handleBookmark} tooltip="Add bookmark" size="sm">
              <Bookmark size={14} />
            </IconButton>

            <IconButton active={rulerEnabled} onClick={toggleRuler} tooltip="Reading ruler (R)">
              <Ruler size={18} />
            </IconButton>

            <IconButton onClick={cycleTheme} tooltip="Change theme (D)">
              {themeIcons[theme]}
            </IconButton>

            <IconButton onClick={toggleImmersive} tooltip="Immersive mode (F)">
              {isImmersive ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </IconButton>

            <IconButton onClick={toggleSettings} tooltip="Settings (S)">
              <Settings size={18} />
            </IconButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toolbar;

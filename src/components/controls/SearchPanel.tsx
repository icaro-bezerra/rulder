import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2 } from 'lucide-react';
import { useReaderStore } from '../../store/readerStore';
import { useSettingsStore } from '../../store/settingsStore';
import type { SearchResult } from '../../types';
import GlassPanel from '../ui/GlassPanel';
import IconButton from '../ui/IconButton';

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

const SearchPanel: React.FC = () => {
  const open = useSettingsStore((s) => s.searchPanelOpen);
  const togglePanel = useSettingsStore((s) => s.toggleSearchPanel);

  const epubBook = useReaderStore((s) => s.epubBook);
  const rendition = useReaderStore((s) => s.epubRendition);
  const fileType = useReaderStore((s) => s.fileType);
  const searchQuery = useReaderStore((s) => s.searchQuery);
  const searchResults = useReaderStore((s) => s.searchResults);
  const isSearching = useReaderStore((s) => s.isSearching);
  const setSearchQuery = useReaderStore((s) => s.setSearchQuery);
  const setSearchResults = useReaderStore((s) => s.setSearchResults);
  const setIsSearching = useReaderStore((s) => s.setIsSearching);

  const inputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSearch = useCallback(async () => {
    const query = localQuery.trim();
    if (!query) return;

    setSearchQuery(query);
    setIsSearching(true);
    setSearchResults([]);

    if (fileType === 'epub' && epubBook) {
      try {
        const results: SearchResult[] = [];
        const spine = epubBook.spine;

        // Search through each spine item
        const spineItems = spine.spineItems || [];
        for (const item of spineItems) {
          if (typeof (item as unknown as { find: (q: string) => Promise<Array<{ cfi: string; excerpt: string }>> }).find === 'function') {
            const matches = await (item as unknown as { find: (q: string) => Promise<Array<{ cfi: string; excerpt: string }>> }).find(query);
            for (const match of matches) {
              results.push({
                cfi: match.cfi,
                excerpt: match.excerpt,
              });
            }
          }
        }

        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }

    setIsSearching(false);
  }, [localQuery, fileType, epubBook, setSearchQuery, setIsSearching, setSearchResults]);

  const navigateToResult = (result: SearchResult) => {
    if (result.cfi && rendition) {
      rendition.display(result.cfi);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={togglePanel}
          />

          <motion.div
            key="search-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[90vw] overflow-y-auto"
          >
            <GlassPanel className="h-full rounded-none rounded-l-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-content-primary">Search</h2>
                <IconButton onClick={togglePanel} size="sm">
                  <X size={16} />
                </IconButton>
              </div>

              {/* Search input */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-tertiary mb-4">
                <Search size={14} className="text-content-tertiary flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search in document…"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-sm text-content-primary outline-none placeholder:text-content-tertiary"
                />
                {isSearching && <Loader2 size={14} className="animate-spin text-accent" />}
              </div>

              {/* Results */}
              {searchResults.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] text-content-tertiary mb-2">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  {searchResults.map((result, i) => (
                    <button
                      key={`${result.cfi ?? result.page}-${i}`}
                      onClick={() => navigateToResult(result)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-content-secondary hover:bg-surface-tertiary hover:text-content-primary transition-all duration-150 line-clamp-2"
                    >
                      {result.excerpt}
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && searchResults.length === 0 && searchQuery && (
                <p className="text-sm text-content-tertiary text-center py-8">No results found</p>
              )}

              {fileType === 'pdf' && (
                <p className="text-xs text-content-tertiary text-center py-4 mt-2">
                  PDF search is limited. For best results, use EPUB files.
                </p>
              )}
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchPanel;

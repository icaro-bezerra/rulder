import React, { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Clock, Trash2 } from 'lucide-react';
import { useReaderStore } from '../store/readerStore';
import { loadLibrary, removeBookMeta } from '../lib/storage';
import type { BookMeta } from '../types';
import GlassPanel from './ui/GlassPanel';
import IconButton from './ui/IconButton';

const HomeScreen: React.FC = () => {
  const openFile = useReaderStore((s) => s.openFile);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [recentBooks, setRecentBooks] = useState<BookMeta[]>(() =>
    loadLibrary().sort((a, b) => b.lastRead - a.lastRead),
  );

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'epub' || ext === 'pdf') {
        openFile(file);
      }
    },
    [openFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemoveRecent = (id: string) => {
    removeBookMeta(id);
    setRecentBooks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="flex items-center justify-center w-full h-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-muted mb-4"
          >
            <BookOpen size={28} className="text-accent" />
          </motion.div>
          <h1 className="text-2xl font-semibold text-content-primary tracking-tight">Rulder</h1>
          <p className="text-sm text-content-secondary mt-1">A minimalist reader for EPUB and PDF</p>
        </div>

        {/* Drop zone */}
        <GlassPanel
          className={`cursor-pointer transition-all duration-300 ${
            isDragOver ? 'drop-zone-active ring-2 ring-accent/30 scale-[1.02]' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4 py-10">
            <div
              className={`p-4 rounded-2xl transition-colors duration-300 ${
                isDragOver ? 'bg-accent/20' : 'bg-surface-tertiary'
              }`}
            >
              <Upload
                size={24}
                className={`transition-colors duration-300 ${
                  isDragOver ? 'text-accent' : 'text-content-tertiary'
                }`}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-content-primary">
                Drop a file here or click to browse
              </p>
              <p className="text-xs text-content-tertiary mt-1">Supports .epub and .pdf files</p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".epub,.pdf"
            onChange={handleInputChange}
            className="hidden"
          />
        </GlassPanel>

        {/* Recent books */}
        {recentBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-content-tertiary mb-3 flex items-center gap-1.5">
              <Clock size={11} />
              Recent
            </h2>
            <div className="flex flex-col gap-1">
              {recentBooks.slice(0, 5).map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-tertiary transition-colors group cursor-default"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                    <BookOpen size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-content-primary truncate">{book.title}</p>
                    <p className="text-[11px] text-content-tertiary">
                      {Math.round(book.progress * 100)}% · {book.fileType.toUpperCase()}
                    </p>
                  </div>
                  <IconButton
                    onClick={() => handleRemoveRecent(book.id)}
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    tooltip="Remove from recent"
                  >
                    <Trash2 size={12} />
                  </IconButton>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Keyboard shortcuts hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-[11px] text-content-tertiary">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-content-secondary text-[10px]">R</kbd> for ruler ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-content-secondary text-[10px]">F</kbd> immersive ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-content-secondary text-[10px]">D</kbd> theme
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomeScreen;

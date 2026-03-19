import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReaderStore } from './store/readerStore';
import { useSettingsStore } from './store/settingsStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import HomeScreen from './components/HomeScreen';
import AppShell from './components/AppShell';

const App: React.FC = () => {
  const file = useReaderStore((s) => s.file);
  const theme = useSettingsStore((s) => s.theme);

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Global keyboard shortcuts
  useKeyboardShortcuts();

  // Global drag-and-drop to open files
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer?.files[0];
      if (droppedFile) {
        const ext = droppedFile.name.split('.').pop()?.toLowerCase();
        if (ext === 'epub' || ext === 'pdf') {
          useReaderStore.getState().openFile(droppedFile);
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div className="w-full h-full bg-surface-primary transition-theme">
      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="reader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <AppShell />
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <HomeScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

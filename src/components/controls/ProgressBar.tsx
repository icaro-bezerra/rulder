import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReaderStore } from '../../store/readerStore';
import { formatPercent } from '../../utils/cn';

interface ProgressBarProps {
  visible: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ visible }) => {
  const progress = useReaderStore((s) => s.progress);
  const currentPage = useReaderStore((s) => s.currentPage);
  const totalPages = useReaderStore((s) => s.totalPages);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 z-30 px-4 py-3 glass"
        >
          <div className="flex items-center gap-3">
            {/* Progress bar track */}
            <div className="flex-1 h-1 rounded-full bg-surface-tertiary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={false}
                animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            {/* Page / percentage info */}
            <span className="text-xs tabular-nums text-content-secondary whitespace-nowrap min-w-[80px] text-right">
              {totalPages > 0 && (
                <>
                  {currentPage}/{totalPages} · {formatPercent(progress)}
                </>
              )}
              {totalPages === 0 && formatPercent(progress)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProgressBar;

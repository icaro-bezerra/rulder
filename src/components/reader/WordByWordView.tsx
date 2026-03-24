import React, { useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Gauge, Eye, Bold, Type, Layers } from 'lucide-react';
import { useWordByWordStore } from '../../store/wordByWordStore';
import { useReaderStore } from '../../store/readerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { extractTextFromEpub, extractTextFromPdf, getORPIndex } from '../../utils/textExtractor';
import { formatPercent } from '../../utils/cn';
import GlassPanel from '../ui/GlassPanel';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';
import IconButton from '../ui/IconButton';

/**
 * Word-by-word reading view.
 * Displays one word (or chunk) at a time with playback controls,
 * speed adjustment, and a navigation progress slider.
 */
const WordByWordView: React.FC = () => {
  const fileType = useReaderStore((s) => s.fileType);
  const epubBook = useReaderStore((s) => s.epubBook);
  const arrayBuffer = useReaderStore((s) => s.arrayBuffer);
  const bookId = useReaderStore((s) => s.bookId);
  const title = useReaderStore((s) => s.title);

  const theme = useSettingsStore((s) => s.theme);

  const words = useWordByWordStore((s) => s.words);
  const currentIndex = useWordByWordStore((s) => s.currentIndex);
  const isPlaying = useWordByWordStore((s) => s.isPlaying);
  const isExtracting = useWordByWordStore((s) => s.isExtracting);
  const wpm = useWordByWordStore((s) => s.wpm);
  const chunkSize = useWordByWordStore((s) => s.chunkSize);
  const highlightFocalLetter = useWordByWordStore((s) => s.highlightFocalLetter);
  const boldWord = useWordByWordStore((s) => s.boldWord);
  const displayFontSize = useWordByWordStore((s) => s.displayFontSize);
  const setWords = useWordByWordStore((s) => s.setWords);
  const setIsExtracting = useWordByWordStore((s) => s.setIsExtracting);
  const togglePlayPause = useWordByWordStore((s) => s.togglePlayPause);
  const restart = useWordByWordStore((s) => s.restart);
  const seekTo = useWordByWordStore((s) => s.seekTo);
  const setWpm = useWordByWordStore((s) => s.setWpm);
  const setChunkSize = useWordByWordStore((s) => s.setChunkSize);
  const setHighlightFocalLetter = useWordByWordStore((s) => s.setHighlightFocalLetter);
  const setBoldWord = useWordByWordStore((s) => s.setBoldWord);
  const setDisplayFontSize = useWordByWordStore((s) => s.setDisplayFontSize);
  const persistPosition = useWordByWordStore((s) => s.persistPosition);
  const reset = useWordByWordStore((s) => s.reset);

  /* ── Extract text on mount ──────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    const extract = async () => {
      setIsExtracting(true);

      try {
        let extracted: string[] = [];

        if (fileType === 'epub' && epubBook) {
          extracted = await extractTextFromEpub(epubBook);
        } else if (fileType === 'pdf' && arrayBuffer) {
          extracted = await extractTextFromPdf(arrayBuffer);
        }

        if (!cancelled && extracted.length > 0) {
          setWords(extracted, bookId ?? undefined);
        }
      } catch (err) {
        console.error('Failed to extract text:', err);
      } finally {
        if (!cancelled) {
          setIsExtracting(false);
        }
      }
    };

    extract();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileType, epubBook, arrayBuffer, bookId]);

  /* ── Persist position periodically ──────────────────────────── */
  useEffect(() => {
    if (!bookId || words.length === 0) return;

    const interval = setInterval(() => {
      persistPosition(bookId);
    }, 5000);

    return () => {
      clearInterval(interval);
      persistPosition(bookId);
    };
  }, [bookId, words.length, persistPosition]);

  /* ── Cleanup on unmount ─────────────────────────────────────── */
  useEffect(() => {
    return () => {
      if (bookId) {
        useWordByWordStore.getState().persistPosition(bookId);
      }
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Current display words ──────────────────────────────────── */
  const displayWords = useMemo(() => {
    if (words.length === 0) return [];
    const end = Math.min(currentIndex + chunkSize, words.length);
    return words.slice(currentIndex, end);
  }, [words, currentIndex, chunkSize]);

  const progress = words.length > 0 ? currentIndex / (words.length - 1) : 0;

  const handleProgressChange = useCallback(
    (value: number) => {
      seekTo(value);
    },
    [seekTo],
  );

  /* ── Background color ───────────────────────────────────────── */
  const bgColor = theme === 'dark'
    ? 'bg-[#0f172a]'
    : theme === 'sepia'
      ? 'bg-[#f5f0e8]'
      : 'bg-white';

  /* ── Extraction loading state ───────────────────────────────── */
  if (isExtracting) {
    return (
      <div className={`flex items-center justify-center w-full h-full ${bgColor}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-content-secondary">Extracting text…</span>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className={`flex items-center justify-center w-full h-full ${bgColor}`}>
        <div className="flex flex-col items-center gap-3">
          <Type size={32} className="text-content-tertiary" />
          <span className="text-sm text-content-secondary">No text content found</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full h-full ${bgColor} select-none`}>
      {/* ── Main word display area ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.08, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            {displayWords.map((word, i) => (
              <span key={`${currentIndex}-${i}`} className="mx-2">
                <WordDisplay
                  word={word}
                  fontSize={displayFontSize}
                  bold={boldWord}
                  highlightFocal={highlightFocalLetter}
                />
              </span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Controls panel ──────────────────────────────────────── */}
      <div className="shrink-0 px-4 pb-4">
        <GlassPanel className="space-y-4">
          {/* Progress slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={0}
              max={Math.max(words.length - 1, 0)}
              value={currentIndex}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-surface-tertiary
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-accent
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent
                [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
            />
            <div className="flex items-center justify-between text-[11px] text-content-tertiary tabular-nums">
              <span>{currentIndex + 1} / {words.length.toLocaleString()} words</span>
              <span>{formatPercent(progress)}</span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-center gap-3">
            <IconButton onClick={restart} tooltip="Restart (Home)">
              <RotateCcw size={18} />
            </IconButton>

            <button
              onClick={togglePlayPause}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full
                bg-accent text-white shadow-lg hover:bg-accent-hover
                transition-all duration-200 active:scale-95
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
            </button>

            <div className="flex items-center gap-1.5 ml-3">
              <Gauge size={14} className="text-content-tertiary" />
              <span className="text-xs tabular-nums text-content-secondary font-medium min-w-[4rem] text-center">
                {wpm} WPM
              </span>
            </div>
          </div>

          {/* Speed slider */}
          <Slider
            label="Reading speed"
            value={wpm}
            min={50}
            max={800}
            step={25}
            unit=" WPM"
            onChange={setWpm}
          />

          {/* Advanced controls (collapsible) */}
          <AdvancedControls
            displayFontSize={displayFontSize}
            setDisplayFontSize={setDisplayFontSize}
            chunkSize={chunkSize}
            setChunkSize={setChunkSize}
            highlightFocalLetter={highlightFocalLetter}
            setHighlightFocalLetter={setHighlightFocalLetter}
            boldWord={boldWord}
            setBoldWord={setBoldWord}
          />
        </GlassPanel>
      </div>
    </div>
  );
};

/* ── Word display with optional ORP highlighting ──────────────── */

interface WordDisplayProps {
  word: string;
  fontSize: number;
  bold: boolean;
  highlightFocal: boolean;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ word, fontSize, bold, highlightFocal }) => {
  if (!highlightFocal) {
    return (
      <span
        className="text-content-primary transition-theme"
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: bold ? 700 : 400,
          letterSpacing: '0.02em',
        }}
      >
        {word}
      </span>
    );
  }

  const orpIdx = getORPIndex(word);

  return (
    <span
      className="transition-theme"
      style={{
        fontSize: `${fontSize}px`,
        fontWeight: bold ? 700 : 400,
        letterSpacing: '0.02em',
      }}
    >
      <span className="text-content-secondary">{word.slice(0, orpIdx)}</span>
      <span className="text-accent" style={{ fontWeight: 800 }}>{word[orpIdx]}</span>
      <span className="text-content-secondary">{word.slice(orpIdx + 1)}</span>
    </span>
  );
};

/* ── Advanced controls sub-panel ──────────────────────────────── */

interface AdvancedControlsProps {
  displayFontSize: number;
  setDisplayFontSize: (v: number) => void;
  chunkSize: number;
  setChunkSize: (v: number) => void;
  highlightFocalLetter: boolean;
  setHighlightFocalLetter: (v: boolean) => void;
  boldWord: boolean;
  setBoldWord: (v: boolean) => void;
}

const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  displayFontSize,
  setDisplayFontSize,
  chunkSize,
  setChunkSize,
  highlightFocalLetter,
  setHighlightFocalLetter,
  boldWord,
  setBoldWord,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-content-tertiary hover:text-content-secondary transition-colors"
      >
        <span className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>▶</span>
        Display options
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              <Slider
                label="Display font size"
                value={displayFontSize}
                min={20}
                max={96}
                step={2}
                unit="px"
                onChange={setDisplayFontSize}
              />
              <Slider
                label="Words per chunk"
                value={chunkSize}
                min={1}
                max={5}
                step={1}
                onChange={setChunkSize}
              />
              <Toggle
                label="Highlight focal letter"
                checked={highlightFocalLetter}
                onChange={setHighlightFocalLetter}
              />
              <Toggle
                label="Bold word"
                checked={boldWord}
                onChange={setBoldWord}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordByWordView;

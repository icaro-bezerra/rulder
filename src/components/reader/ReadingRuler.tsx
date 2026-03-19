import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../../store/settingsStore';

/** Encode hex color + alpha into rgba() — avoids conflicts with framer-motion's opacity */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * ReadingRuler — the signature feature.
 *
 * Curtain animation: top region slides down from the very top of the screen,
 * bottom region slides up from the very bottom. The ruler stripe fades in
 * with a slight delay for a staggered feel.
 *
 * Opacity is encoded directly into backgroundColor so it never conflicts
 * with framer-motion's internal opacity animation system.
 */
const ReadingRuler: React.FC = () => {
  const enabled = useSettingsStore((s) => s.ruler.enabled);
  const height = useSettingsStore((s) => s.ruler.height);
  const opacity = useSettingsStore((s) => s.ruler.opacity);
  const color = useSettingsStore((s) => s.ruler.color);
  const transition = useSettingsStore((s) => s.ruler.transition);
  const autoFollow = useSettingsStore((s) => s.ruler.autoFollow);

  const [posY, setPosY] = useState<number>(window.innerHeight * 0.4);
  const rafRef = useRef<number>(0);
  const mouseYRef = useRef<number>(window.innerHeight * 0.4);

  /* ── Track mouse position ───────────────────────────────────── */
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (autoFollow) return;
      mouseYRef.current = e.clientY;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPosY(mouseYRef.current);
      });
    },
    [autoFollow],
  );

  /* ── Auto-follow: keep ruler at 40% of viewport ─────────────── */
  useEffect(() => {
    if (!enabled) return;

    if (autoFollow) {
      setPosY(window.innerHeight * 0.4);
      const handleResize = () => setPosY(window.innerHeight * 0.4);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, autoFollow, handlePointerMove]);

  /* ── Keyboard nudge ─────────────────────────────────────────── */
  useEffect(() => {
    if (!enabled) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        setPosY((prev) => Math.max(0, prev - 10));
      } else if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        setPosY((prev) => Math.min(window.innerHeight, prev + 10));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [enabled]);

  const topH = Math.max(0, posY - height / 2);
  const bottomTop = posY + height / 2;
  // Encode opacity into the color itself — framer-motion never touches it
  const bgColor = hexToRgba(color, opacity);
  const moveTrans = `${transition}s ease`;

  return (
    <AnimatePresence>
      {enabled && (
        // Parent propagates "hidden" / "visible" variants to all children
        <motion.div
          key="reading-ruler"
          className="ruler-overlay"
          aria-hidden="true"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Top curtain — slides down from the top edge of the screen */}
          <motion.div
            variants={{
              hidden: { scaleY: 0 },
              visible: { scaleY: 1 },
            }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: topH,
              backgroundColor: bgColor,
              transformOrigin: 'top center',
              transition: `height ${moveTrans}`,
            }}
          />

          {/* Ruler stripe — fades in with slight delay for stagger effect */}
          <motion.div
            className="ruler-stripe"
            variants={{
              hidden: { opacity: 0, scaleX: 0.88 },
              visible: { opacity: 1, scaleX: 1 },
            }}
            transition={{ duration: 0.3, delay: 0.12, ease: 'easeOut' }}
            style={{
              top: topH,
              height,
              borderColor: `color-mix(in srgb, var(--accent) 40%, transparent)`,
              transition: `top ${moveTrans}, height ${moveTrans}`,
            }}
          />

          {/* Bottom curtain — slides up from the bottom edge of the screen */}
          <motion.div
            variants={{
              hidden: { scaleY: 0 },
              visible: { scaleY: 1 },
            }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: 'absolute',
              top: bottomTop,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: bgColor,
              transformOrigin: 'bottom center',
              transition: `top ${moveTrans}`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReadingRuler;

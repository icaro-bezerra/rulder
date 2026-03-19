import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Auto-hide UI elements after a period of inactivity.
 * Returns `visible` boolean and a `poke` function to reset the timer.
 */
export function useAutoHide(timeout = 3000): { visible: boolean; poke: () => void } {
  const [visible, setVisible] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const poke = useCallback(() => {
    setVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), timeout);
  }, [timeout]);

  useEffect(() => {
    const handleMove = () => poke();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);
    poke(); // Start the timer

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      clearTimeout(timer.current);
    };
  }, [poke]);

  return { visible, poke };
}

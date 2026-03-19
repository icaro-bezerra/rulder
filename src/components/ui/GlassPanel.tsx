import React from 'react';
import { cn } from '../../utils/cn';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: boolean;
}

/** A glassmorphism panel with backdrop blur and translucent background */
const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ children, className, padding = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'glass rounded-2xl transition-theme',
        padding && 'p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

GlassPanel.displayName = 'GlassPanel';

export default GlassPanel;

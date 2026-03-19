import React from 'react';
import { cn } from '../../utils/cn';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the button is in an active/toggled-on state */
  active?: boolean;
  /** Tooltip text */
  tooltip?: string;
  /** Smaller size variant */
  size?: 'sm' | 'md';
}

/** A round glassmorphism icon button */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className, active, tooltip, size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      title={tooltip}
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all duration-200',
        'hover:bg-glass-hover active:scale-95',
        'text-content-secondary hover:text-content-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10',
        active && 'bg-accent-muted text-accent',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

IconButton.displayName = 'IconButton';

export default IconButton;

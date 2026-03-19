import React from 'react';
import { cn } from '../../utils/cn';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

/** A styled range slider with label and value display */
const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-content-secondary">{label}</span>
      <span className="text-xs tabular-nums text-content-tertiary">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        'w-full h-1.5 rounded-full appearance-none cursor-pointer',
        'bg-surface-tertiary',
        '[&::-webkit-slider-thumb]:appearance-none',
        '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
        '[&::-webkit-slider-thumb]:rounded-full',
        '[&::-webkit-slider-thumb]:bg-accent',
        '[&::-webkit-slider-thumb]:shadow-md',
        '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150',
        '[&::-webkit-slider-thumb]:hover:scale-110',
        '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
        '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent',
        '[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md',
      )}
    />
  </div>
);

export default Slider;

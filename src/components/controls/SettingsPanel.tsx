import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Wheat, Type } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { FONT_OPTIONS } from '../../types';
import type { Theme, ReadingMode } from '../../types';
import GlassPanel from '../ui/GlassPanel';
import IconButton from '../ui/IconButton';
import Slider from '../ui/Slider';
import Toggle from '../ui/Toggle';

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={16} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  { value: 'sepia', label: 'Sepia', icon: <Wheat size={16} /> },
];

const MODE_OPTIONS: { value: ReadingMode; label: string }[] = [
  { value: 'scroll', label: 'Scroll' },
  { value: 'paginated', label: 'Paginated' },
];

const SettingsPanel: React.FC = () => {
  const open = useSettingsStore((s) => s.settingsPanelOpen);
  const togglePanel = useSettingsStore((s) => s.toggleSettingsPanel);

  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const readingMode = useSettingsStore((s) => s.readingMode);
  const setReadingMode = useSettingsStore((s) => s.setReadingMode);
  const typography = useSettingsStore((s) => s.typography);
  const setTypography = useSettingsStore((s) => s.setTypography);
  const ruler = useSettingsStore((s) => s.ruler);
  const setRuler = useSettingsStore((s) => s.setRuler);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={togglePanel}
          />

          {/* Panel */}
          <motion.div
            key="settings-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[90vw] overflow-y-auto"
          >
            <GlassPanel className="h-full rounded-none rounded-l-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-content-primary">Settings</h2>
                <IconButton onClick={togglePanel} size="sm">
                  <X size={16} />
                </IconButton>
              </div>

              {/* ── Theme ───────────────────────────────────── */}
              <Section title="Appearance">
                <div className="grid grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        theme === opt.value
                          ? 'bg-accent-muted text-accent ring-1 ring-accent/30'
                          : 'hover:bg-surface-tertiary text-content-secondary'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Section>

              {/* ── Reading mode ─────────────────────────────── */}
              <Section title="Reading mode">
                <div className="grid grid-cols-2 gap-2">
                  {MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setReadingMode(opt.value)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                        readingMode === opt.value
                          ? 'bg-accent-muted text-accent ring-1 ring-accent/30'
                          : 'hover:bg-surface-tertiary text-content-secondary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Section>

              {/* ── Typography ───────────────────────────────── */}
              <Section title="Typography">
                {/* Font selector */}
                <div className="flex flex-col gap-1.5 mb-3">
                  <span className="text-xs font-medium text-content-secondary flex items-center gap-1.5">
                    <Type size={12} />
                    Font family
                  </span>
                  <select
                    value={typography.fontFamily}
                    onChange={(e) => setTypography({ fontFamily: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-surface-tertiary text-content-primary border-0 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Slider
                  label="Font size"
                  value={typography.fontSize}
                  min={12}
                  max={32}
                  unit="px"
                  onChange={(v) => setTypography({ fontSize: v })}
                />
                <div className="h-2" />
                <Slider
                  label="Line height"
                  value={typography.lineHeight}
                  min={1.2}
                  max={3}
                  step={0.1}
                  onChange={(v) => setTypography({ lineHeight: v })}
                />
                <div className="h-2" />
                <Slider
                  label="Margins"
                  value={typography.margins}
                  min={16}
                  max={200}
                  unit="px"
                  onChange={(v) => setTypography({ margins: v })}
                />
              </Section>

              {/* ── Reading ruler ─────────────────────────────── */}
              <Section title="Reading ruler">
                <Toggle
                  label="Enable ruler"
                  checked={ruler.enabled}
                  onChange={(v) => setRuler({ enabled: v })}
                />
                {ruler.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-3 mt-3"
                  >
                    <Slider
                      label="Ruler height"
                      value={ruler.height}
                      min={20}
                      max={120}
                      unit="px"
                      onChange={(v) => setRuler({ height: v })}
                    />
                    <Slider
                      label="Background opacity"
                      value={ruler.opacity}
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      onChange={(v) => setRuler({ opacity: v })}
                    />
                    <Slider
                      label="Transition speed"
                      value={ruler.transition}
                      min={0}
                      max={0.5}
                      step={0.05}
                      unit="s"
                      onChange={(v) => setRuler({ transition: v })}
                    />

                    {/* Ruler color */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-content-secondary">Color</span>
                      <input
                        type="color"
                        value={ruler.color}
                        onChange={(e) => setRuler({ color: e.target.value })}
                        className="w-8 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                    </div>

                    <Toggle
                      label="Auto-follow scroll"
                      checked={ruler.autoFollow}
                      onChange={(v) => setRuler({ autoFollow: v })}
                    />
                  </motion.div>
                )}
              </Section>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ── Section wrapper ──────────────────────────────────────────── */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-content-tertiary mb-3">
      {title}
    </h3>
    {children}
  </div>
);

export default SettingsPanel;

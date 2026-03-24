/* ── Theme ──────────────────────────────────────────────────────── */

export type Theme = 'light' | 'dark' | 'sepia';

export type ReadingMode = 'scroll' | 'paginated' | 'word-by-word';

export type FileType = 'epub' | 'pdf';

/* ── Font ───────────────────────────────────────────────────────── */

export interface FontOption {
  readonly label: string;
  readonly value: string;
  readonly family: string;
}

export const FONT_OPTIONS: readonly FontOption[] = [
  { label: 'Inter', value: 'inter', family: "'Inter', system-ui, sans-serif" },
  { label: 'Merriweather', value: 'merriweather', family: "'Merriweather', Georgia, serif" },
  { label: 'Literata', value: 'literata', family: "'Literata', serif" },
  { label: 'Lora', value: 'lora', family: "'Lora', serif" },
  { label: 'Georgia', value: 'georgia', family: 'Georgia, serif' },
  { label: 'JetBrains Mono', value: 'jetbrains', family: "'JetBrains Mono', monospace" },
] as const;

/* ── Bookmark ──────────────────────────────────────────────────── */

export interface Bookmark {
  readonly id: string;
  readonly label: string;
  /** CFI for EPUB, page number (as string) for PDF */
  readonly location: string;
  readonly createdAt: number;
}

/* ── Highlight ─────────────────────────────────────────────────── */

export interface Highlight {
  readonly id: string;
  readonly text: string;
  readonly color: string;
  /** CFI range for EPUB, page + rect info for PDF */
  readonly cfiRange: string;
  readonly createdAt: number;
}

/* ── Chapter (EPUB) ────────────────────────────────────────────── */

export interface Chapter {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly subitems?: readonly Chapter[];
}

/* ── Search Result ─────────────────────────────────────────────── */

export interface SearchResult {
  readonly cfi?: string;
  readonly page?: number;
  readonly excerpt: string;
}

/* ── Book Metadata ─────────────────────────────────────────────── */

export interface BookMeta {
  readonly id: string;
  readonly title: string;
  readonly author: string;
  readonly filename: string;
  readonly fileType: FileType;
  readonly coverUrl?: string;
  readonly lastPosition: string;
  readonly progress: number;
  readonly lastRead: number;
  readonly bookmarks: Bookmark[];
  readonly highlights: Highlight[];
}

/* ── Settings ──────────────────────────────────────────────────── */

export interface RulerSettings {
  enabled: boolean;
  height: number;
  opacity: number;
  color: string;
  transition: number;
  autoFollow: boolean;
}

export interface TypographySettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margins: number;
}

export interface AppSettings {
  theme: Theme;
  readingMode: ReadingMode;
  typography: TypographySettings;
  ruler: RulerSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  readingMode: 'scroll',
  typography: {
    fontSize: 18,
    fontFamily: 'inter',
    lineHeight: 1.8,
    margins: 80,
  },
  ruler: {
    enabled: false,
    height: 40,
    opacity: 0.55,
    color: '#000000',
    transition: 0.15,
    autoFollow: true,
  },
};

# Rulder

A modern, minimalist reader application for **EPUB** and **PDF** files, focused on delivering a fluid, comfortable, and customisable reading experience.

![Rulder](https://img.shields.io/badge/Platform-Linux%20|%20Web-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### Reading
- Full **EPUB** support via [epub.js](https://github.com/futurepress/epub.js)
- Full **PDF** support via [pdf.js](https://mozilla.github.io/pdf.js/) with lazy-loaded pages
- Two reading modes: **vertical scroll** and **horizontal pagination**
- Smooth page-turn animations (paginated mode)

### 📏 Reading ruler (signature feature)
- Spotlight-style ruler that highlights the current reading line
- Dims the rest of the viewport for focused reading
- Fully customisable: height, opacity, colour, transition speed
- Auto-follow scroll or manual mouse-tracking mode
- Quick toggle via toolbar button or `R` keyboard shortcut
- Keyboard nudge with `Alt+↑` / `Alt+↓`

### 🎨 Interface
- **Glassmorphism** design — backdrop blur, translucent panels, subtle shadows
- Clean, minimal UI with no visual clutter
- Controls auto-hide in immersive mode
- Smooth transitions powered by Framer Motion

### 🔤 Typography
- Multiple font families (Inter, Merriweather, Literata, Lora, Georgia, JetBrains Mono)
- Adjustable font size, line height, and margins
- Live preview as you change settings

### 🌙 Themes
- **Light**, **Dark**, and **Sepia** modes
- Smooth CSS transitions between themes
- Persistent theme selection

### ⚙️ Controls
- Progress bar with page number and percentage
- Chapter navigation (EPUB table of contents)
- In-document text search (EPUB)
- Bookmarks with one-click save
- Text highlighting via selection

### ⌨️ Keyboard shortcuts
| Key | Action |
|-----|--------|
| `R` | Toggle reading ruler |
| `F` | Toggle immersive (full-focus) mode |
| `D` | Cycle theme (light → dark → sepia) |
| `S` | Open settings panel |
| `T` | Open table of contents |
| `Ctrl+F` | Open search |
| `←` / `→` | Previous / next page (paginated) |
| `Alt+↑` / `Alt+↓` | Nudge ruler position |
| `Esc` | Close open panels |

### 🧠 Performance
- Lazy page loading for large PDFs via IntersectionObserver
- Lightweight state management with Zustand
- Minimal re-renders through selective subscriptions
- Efficient CSS transitions (no JS animation loops)

### 💾 Persistence
- Auto-saves reading position, bookmarks, and highlights to localStorage
- Recent books list on the home screen
- All settings persisted across sessions

---

## 🏗️ Architecture

```
src/
├── types/            # TypeScript type definitions & constants
├── store/            # Zustand state stores (reader, settings)
├── hooks/            # Custom React hooks (keyboard, auto-hide)
├── lib/              # Storage utilities (localStorage)
├── utils/            # Helper functions (cn, debounce, clamp)
└── components/
    ├── ui/           # Reusable UI primitives (GlassPanel, Toggle, Slider)
    ├── reader/       # Core renderers (EPUB, PDF, ReadingRuler, ReaderView)
    ├── controls/     # Toolbar, ProgressBar, Settings, TOC, Search, Bookmarks
    ├── HomeScreen    # Landing page with drag-and-drop
    └── AppShell      # Layout orchestrator with auto-hiding controls
```

**Key decisions:**
- **React + TypeScript + Vite** — fast dev server, instant HMR, type safety
- **Zustand** over Redux — minimal boilerplate, excellent performance with selectors
- **epub.js** — mature EPUB rendering with pagination, annotations, search
- **pdfjs-dist** — Mozilla's PDF engine, lazy canvas rendering for performance
- **Framer Motion** — declarative animations with AnimatePresence for enter/exit
- **Tailwind CSS** — utility-first styling with CSS custom properties for theming
- **CSS custom properties** — enables smooth theme transitions without full re-renders

---

## 🚀 Getting started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9 (or pnpm / yarn)

### Installation

```bash
# Clone the repository
git clone <repo-url> rulder
cd rulder

# Install dependencies
npm install

# Start development server
npm run dev
```

The app opens at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview   # Preview the production build locally
```

The built files are in `dist/` — serve them with any static file server.

### Arch Linux deployment

```bash
# Install Node.js if needed
sudo pacman -S nodejs npm

# Then follow the steps above
npm install && npm run dev
```

---

## 📦 Tech stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 |
| Language | TypeScript 5 |
| Bundler | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand |
| Animations | Framer Motion |
| EPUB engine | epub.js |
| PDF engine | pdfjs-dist (Mozilla) |
| Icons | Lucide React |

---

## 📄 License

MIT

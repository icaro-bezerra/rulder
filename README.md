# Rulder

A modern, minimalist reader application for **EPUB** and **PDF** files, focused on delivering a fluid, comfortable, and customisable reading experience.

![Rulder](https://img.shields.io/badge/Platform-Linux%20|%20Web-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### Reading
- Full **EPUB** support via [epub.js](https://github.com/futurepress/epub.js)
- Full **PDF** support via [pdf.js](https://mozilla.github.io/pdf.js/) with lazy-loaded pages
- Three reading modes: **vertical scroll**, **horizontal pagination**, and **word-by-word**
- Smooth page-turn animations (paginated mode)

### 🔤 Word-by-word mode (RSVP speed reading)
- Displays text **one word at a time**, centered on screen for focused reading
- Automatic playback with **play / pause / restart** controls
- Configurable speed from **50 to 1000 WPM** (words per minute)
- **Punctuation-aware timing** — slight pauses on commas, longer pauses on sentence endings
- **Progress slider** for scrubbing through the full text
- **ORP focal letter highlighting** — accents the optimal recognition point for speed reading
- Chunk mode — display 1–5 words at a time
- Adjustable display font size (20–96 px) and bold toggle
- Position is **saved and restored** per book across sessions
- Works with both EPUB and PDF files
- Quick toggle via toolbar ⚡ button or `W` keyboard shortcut

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
| `W` | Toggle word-by-word mode |
| `Space` | Play / pause (word-by-word) |
| `←` / `→` | Previous / next word (word-by-word) |
| `Shift+←` / `Shift+→` | Skip 10 words (word-by-word) |
| `↑` / `↓` | Increase / decrease speed (word-by-word) |
| `Home` | Restart from beginning (word-by-word) |

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
├── store/            # Zustand state stores (reader, settings, wordByWord)
├── hooks/            # Custom React hooks (keyboard, auto-hide)
├── lib/              # Storage utilities (localStorage)
├── utils/            # Helper functions (cn, debounce, clamp, textExtractor)
└── components/
    ├── ui/           # Reusable UI primitives (GlassPanel, Toggle, Slider)
    ├── reader/       # Core renderers (EPUB, PDF, ReadingRuler, WordByWord, ReaderView)
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

## � Podman / Docker

### `rulder.sh` — one-command launch

The project ships with a shell script that builds the image and opens the browser automatically:

```bash
./rulder.sh
```

What it does, step by step:

1. **Verifica dependência** — aborta com mensagem amigável se `podman` não estiver instalado
2. **Para container anterior** — faz `podman stop` + `podman rm` do container `rulder` se já existir, para evitar conflito de porta
3. **Build da imagem** — executa `podman build -t rulder .` a partir do `Dockerfile` multi-stage:
   - **Stage 1** (`node:20-alpine`): instala dependências com `npm ci` e roda `npm run build`
   - **Stage 2** (`nginx:alpine`): copia apenas o `dist/` gerado — Node.js e `node_modules` são descartados
   - Imagem final: ~40 MB
4. **Inicia o container** — `podman run -d --replace -p 8080:8080 rulder`
5. **Abre o browser** — chama `xdg-open http://localhost:8080` automaticamente

### Porta customizável

```bash
RULDER_PORT=3000 ./rulder.sh   # sobe na porta 3000
```

### Comandos manuais

```bash
# Build
podman build -t rulder .

# Rodar
podman run -d --name rulder -p 8080:8080 rulder

# Parar
podman stop rulder && podman rm rulder

# Ver logs
podman logs -f rulder
```

> **Nota Arch Linux:** as imagens usam nomes completamente qualificados (`docker.io/library/node:20-alpine`, `docker.io/library/nginx:alpine`) para compatibilidade com o Podman sem registries padrão configurados em `/etc/containers/registries.conf`.

---

## �📦 Tech stack

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

#!/usr/bin/env bash
# install.sh — Install Rulder as a native desktop application on Arch Linux
# Run this after `npm run tauri:build` has completed successfully.
#
# What it does:
#   1. Copies the binary to /usr/local/bin/
#   2. Installs the .desktop file so Rulder appears in the app launcher / search bar
#   3. Installs the icon in the hicolor theme
#   4. Refreshes the desktop and icon caches

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BINARY="$SCRIPT_DIR/src-tauri/target/release/rulder"
DESKTOP_FILE="$SCRIPT_DIR/src-tauri/target/release/bundle/deb/Rulder_0.1.0_amd64/data/usr/share/applications/Rulder.desktop"
ICON_SRC="$SCRIPT_DIR/src-tauri/icons/128x128.png"

# ── Sanity checks ────────────────────────────────────────────────────────────
if [[ ! -f "$BINARY" ]]; then
  echo "❌  Binary not found. Run 'npm run tauri:build' first."
  exit 1
fi

# ── Install binary ────────────────────────────────────────────────────────────
echo "📦  Installing binary to /usr/local/bin/rulder …"
sudo install -Dm755 "$BINARY" /usr/local/bin/rulder

# ── Install .desktop file ─────────────────────────────────────────────────────
APPS_DIR="$HOME/.local/share/applications"
mkdir -p "$APPS_DIR"
echo "🖥️   Installing .desktop file …"
cat > "$APPS_DIR/rulder.desktop" <<'DESKTOP'
[Desktop Entry]
Name=Rulder
Comment=A modern, minimalist reader for EPUB and PDF
Exec=env WEBKIT_DISABLE_DMABUF_RENDERER=1 WEBKIT_DISABLE_COMPOSITING_MODE=1 rulder
Icon=rulder
Type=Application
Categories=Office;Viewer;
Terminal=false
StartupWMClass=rulder
Keywords=epub;pdf;reader;book;ebook;
DESKTOP

# ── Install icon ──────────────────────────────────────────────────────────────
echo "🎨  Installing icon …"
ICON_DIR="$HOME/.local/share/icons/hicolor/128x128/apps"
mkdir -p "$ICON_DIR"
install -Dm644 "$ICON_SRC" "$ICON_DIR/rulder.png"

# Also install at 32x32 for smaller contexts (taskbar, etc.)
ICON_DIR_32="$HOME/.local/share/icons/hicolor/32x32/apps"
mkdir -p "$ICON_DIR_32"
install -Dm644 "$SCRIPT_DIR/src-tauri/icons/32x32.png" "$ICON_DIR_32/rulder.png"

# ── Refresh caches ────────────────────────────────────────────────────────────
update-desktop-database "$APPS_DIR" 2>/dev/null || true
gtk-update-icon-cache "$HOME/.local/share/icons/hicolor" 2>/dev/null || true
xdg-desktop-menu install --novendor "$APPS_DIR/rulder.desktop" 2>/dev/null || true

echo ""
echo "✅  Rulder installed!"
echo "    You can now find it in your application launcher or run 'rulder' in a terminal."

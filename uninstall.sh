#!/usr/bin/env bash
# uninstall.sh — Remove Rulder from the system

set -euo pipefail

echo "🗑️   Removing Rulder …"
sudo rm -f /usr/local/bin/rulder
rm -f "$HOME/.local/share/applications/rulder.desktop"
rm -f "$HOME/.local/share/icons/hicolor/128x128/apps/rulder.png"
rm -f "$HOME/.local/share/icons/hicolor/32x32/apps/rulder.png"

update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
gtk-update-icon-cache "$HOME/.local/share/icons/hicolor" 2>/dev/null || true

echo "✅  Rulder uninstalled."

#!/usr/bin/env bash
# ── rulder.sh ── Build & run Rulder in Podman, then open the browser ──
set -euo pipefail

NAME="rulder"
PORT="${RULDER_PORT:-8080}"
IMAGE="localhost/${NAME}"
URL="http://localhost:${PORT}"

# ── Helpers ────────────────────────────────────────────────────
info()  { printf '\033[1;34m▸ %s\033[0m\n' "$*"; }
ok()    { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
err()   { printf '\033[1;31m✘ %s\033[0m\n' "$*" >&2; exit 1; }

# ── Pre-checks ────────────────────────────────────────────────
command -v podman >/dev/null 2>&1 || err "podman not found. Install it: sudo pacman -S podman"

# ── Stop & remove previous container if running ───────────────
if podman container exists "${NAME}" 2>/dev/null; then
  info "Stopping existing '${NAME}' container…"
  podman stop "${NAME}" >/dev/null 2>&1 || true
  podman rm   "${NAME}" >/dev/null 2>&1 || true
fi

# ── Build image ───────────────────────────────────────────────
info "Building image '${IMAGE}'…"
podman build -t "${NAME}" "$(dirname "$0")"
ok "Image built"

# ── Run container ─────────────────────────────────────────────
info "Starting container on port ${PORT}…"
podman run -d \
  --name "${NAME}" \
  --replace \
  -p "${PORT}:8080" \
  "${IMAGE}" >/dev/null

ok "Rulder running at ${URL}"

# ── Open browser ──────────────────────────────────────────────
sleep 0.5

if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "${URL}" 2>/dev/null &
elif command -v open >/dev/null 2>&1; then
  open "${URL}" &
else
  info "Open ${URL} in your browser"
fi

#!/usr/bin/env bash
# Convertit {slug}.mov → {slug}.mp4 + {slug}.jpg dans public/selection-app/
# Usage : bash scripts/ingest-selection-app-video.sh bevel ~/Downloads/bevel.mov

set -euo pipefail

SLUG="${1:?slug requis (ex. bevel)}"
INPUT="${2:?fichier .mov requis}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/selection-app"
VIDEOAUTO="$ROOT/public/videoauto"

require_ffmpeg() {
  command -v ffmpeg >/dev/null 2>&1 || {
    echo "ffmpeg introuvable : brew install ffmpeg" >&2
    exit 1
  }
}

require_ffmpeg
[[ -f "$INPUT" ]] || {
  echo "Fichier introuvable : $INPUT" >&2
  exit 1
}

cp "$INPUT" "$DEST/${SLUG}.mov"
cp "$INPUT" "$VIDEOAUTO/${SLUG}.mov"

ffmpeg -y -hide_banner -loglevel error -i "$INPUT" \
  -vf "scale=720:-2:flags=lanczos" \
  -c:v libx264 -crf 26 -preset medium \
  -c:a aac -b:a 96k \
  -movflags +faststart \
  "$DEST/${SLUG}.mp4"

ffmpeg -y -hide_banner -loglevel error -ss 00:00:01.2 -i "$INPUT" -vframes 1 -q:v 2 \
  "$DEST/${SLUG}.jpg"

cp "$DEST/${SLUG}.mp4" "$VIDEOAUTO/${SLUG}.mp4"
cp "$DEST/${SLUG}.jpg" "$VIDEOAUTO/${SLUG}.jpg"

echo "OK — $SLUG intégré dans selection-app/ et videoauto/"

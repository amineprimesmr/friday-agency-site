#!/usr/bin/env bash
# Compresse une démo écran pour TikTok Developer App review (max 50 Mo / fichier).
# Prérequis : ffmpeg — brew install ffmpeg
#
# Usage :
#   bash scripts/compress-tiktok-demo-video.sh ~/Desktop/trackapp.mov
#   bash scripts/compress-tiktok-demo-video.sh ./demo.mov ./sortie.mp4

set -euo pipefail

MAX_BYTES=$((50 * 1024 * 1024))

file_size() {
  local f="$1"
  if stat --version 2>/dev/null | grep -q GNU; then
    stat -c%s "$f"
  else
    stat -f%z "$f"
  fi
}

require_ffmpeg() {
  if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "ffmpeg introuvable. Installe-le : brew install ffmpeg" >&2
    exit 1
  fi
}

INPUT="${1:?Usage: $0 <video.mov|mp4> [sortie.mp4]}"
OUTPUT="${2:-}"

if [[ -z "$OUTPUT" ]]; then
  dir=$(dirname "$INPUT")
  base=$(basename "$INPUT")
  name="${base%.*}"
  OUTPUT="${dir}/${name}_tiktok_under50mb.mp4"
fi

require_ffmpeg
[[ -f "$INPUT" ]] || {
  echo "Fichier introuvable : $INPUT" >&2
  exit 1
}

tmp="/tmp/tiktok_demo_compress_$$.mp4"
rm -f "$tmp"

encode() {
  local scale="$1" crf="$2" strip_audio="$3"
  rm -f "$tmp"
  if [[ "$strip_audio" == "1" ]]; then
    ffmpeg -y -hide_banner -loglevel error -i "$INPUT" \
      -vf "scale=${scale}:-2" \
      -c:v libx264 -crf "$crf" -preset fast \
      -an \
      -movflags +faststart \
      "$tmp"
  else
    ffmpeg -y -hide_banner -loglevel error -i "$INPUT" \
      -vf "scale=${scale}:-2" \
      -c:v libx264 -crf "$crf" -preset fast \
      -c:a aac -b:a 64k \
      -movflags +faststart \
      "$tmp"
  fi
}

for strip in 0 1; do
  for scale in 1280 960 854 720 640; do
    for crf in 26 28 30 32 34 36 38; do
      encode "$scale" "$crf" "$strip"
      sz=$(file_size "$tmp")
      if ((sz <= MAX_BYTES)); then
        mv -f "$tmp" "$OUTPUT"
        mb=$((sz * 10 / 1024 / 1024))
        mb_int=$((mb / 10))
        mb_dec=$((mb % 10))
        audio_note="audio AAC 64k"
        [[ "$strip" == "1" ]] && audio_note="sans audio (réduit encore la taille)"
        echo "OK → $OUTPUT (${mb_int}.${mb_dec} Mo) — scale=${scale}px, crf=${crf}, ${audio_note}"
        exit 0
      fi
    done
  done
done

rm -f "$tmp"
echo "Impossible de passer sous 50 Mo même très compressé." >&2
echo "Enregistre une vidéo plus courte (vise 1–2 min, 720p) puis relance ce script." >&2
exit 1

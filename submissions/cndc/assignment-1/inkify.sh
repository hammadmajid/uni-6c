#!/usr/bin/env bash
# Build handwritten.pdf: typed zabdoc cover + clean typst render -> ink-on-paper raster.
set -euo pipefail
cd "$(dirname "$0")"
tmp=$(mktemp -d)
# Times New Roman for the cover, if this machine has the zabdocs copy; otherwise a fallback serif.
tnr=/home/bine/Developer/uni/zabdocs
typst compile --root ../.. $([ -d "$tnr" ] && echo --font-path "$tnr") --no-pdf-tags cover.typ "$tmp/cover.pdf"
typst compile --font-path ../../_shared/fonts handwritten.typ "$tmp/raw.pdf"
pdftoppm -r 150 -png "$tmp/raw.pdf" "$tmp/p"
uv run --quiet --with numpy,scipy,pillow python inkify.py 150 "$tmp/body.pdf" "$tmp"/p-*.png
pdfunite "$tmp/cover.pdf" "$tmp/body.pdf" handwritten.pdf
rm -rf "$tmp"

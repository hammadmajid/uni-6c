#!/usr/bin/env bash
# Build 2312200.pdf: typed zabdoc cover + clean typst render -> ink-on-paper raster.
set -euo pipefail
cd "$(dirname "$0")"
tmp=$(mktemp -d)
# Times New Roman for the cover, if this machine has the zabdocs copy; otherwise a fallback serif.
tnr=/home/bine/Developer/uni/zabdocs
typst compile --root ../.. $([ -d "$tnr" ] && echo --font-path "$tnr") --no-pdf-tags cover.typ "$tmp/cover.pdf"
# Look chosen from prototypes.pdf, variant I: per-letter jitter, tilting lines, ballpoint skips and blobs.
typst compile --font-path ../../_shared/fonts --input letters=1 handwritten.typ "$tmp/raw.pdf"
pdftoppm -r 200 -png "$tmp/raw.pdf" "$tmp/p"
INK_SLOPE=1 INK_DEFECTS=1 uv run --quiet --with numpy,scipy,pillow,scikit-image python inkify.py 200 "$tmp/body.pdf" "$tmp"/p-*.png
pdfunite "$tmp/cover.pdf" "$tmp/body.pdf" 2312200.pdf
rm -rf "$tmp"

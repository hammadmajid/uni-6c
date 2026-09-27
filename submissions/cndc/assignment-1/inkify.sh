#!/usr/bin/env bash
# Build handwritten.pdf: clean typst render -> ink-on-paper raster.
set -euo pipefail
cd "$(dirname "$0")"
tmp=$(mktemp -d)
typst compile --font-path ../../_shared/fonts handwritten.typ "$tmp/raw.pdf"
pdftoppm -r 150 -png "$tmp/raw.pdf" "$tmp/p"
uv run --quiet --with numpy,scipy,pillow python inkify.py 150 handwritten.pdf "$tmp"/p-*.png
rm -rf "$tmp"

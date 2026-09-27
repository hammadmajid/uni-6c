#!/usr/bin/env bash
# Build a handwritten-style submission: typed zabdoc cover + ink-on-paper answer pages.
# Usage: submissions/_shared/handwriting/build.sh <item dir under submissions/> <out.pdf>
#   e.g. build.sh cndc/assignment-1 2312200.pdf
# Needs in the item dir: cover.typ (zabdoc cover only) and handwritten.typ (answers).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
subs="$(cd "$here/../.." && pwd)"
item="$subs/$1"
out="$item/$2"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
# Times New Roman for the cover, if this machine has the zabdocs copy; otherwise a fallback serif.
tnr=/home/bine/Developer/uni/zabdocs
typst compile --root "$subs" $([ -d "$tnr" ] && echo --font-path "$tnr") --no-pdf-tags "$item/cover.typ" "$tmp/cover.pdf"
# Look chosen by the owner (prototype I): per-letter jitter, tilting lines, ballpoint skips and blobs, blue ballpoint.
typst compile --root "$subs" --font-path "$subs/_shared/fonts" --input letters=1 "$item/handwritten.typ" "$tmp/raw.pdf"
pdftoppm -r 200 -png "$tmp/raw.pdf" "$tmp/p"
INK_SLOPE=1 INK_DEFECTS=1 uv run --quiet --with numpy,scipy,pillow,scikit-image python "$here/inkify.py" 200 "$tmp/body.pdf" "$tmp"/p-*.png
pdfunite "$tmp/cover.pdf" "$tmp/body.pdf" "$out"
echo "wrote $out"

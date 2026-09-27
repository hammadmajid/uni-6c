#!/usr/bin/env bash
# Render page 1 of an item's handwritten.typ in every look variant, one labelled page each,
# into <item>/prototypes.pdf, so the owner can mix and match.
# Usage: submissions/_shared/handwriting/prototypes.sh <item dir under submissions/>
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
subs="$(cd "$here/../.." && pwd)"
item="$subs/$1"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
dpi=200
variant() {  # name, label, typst inputs, env
  local name=$1 label=$2 inputs=$3; shift 3
  typst compile --root "$subs" --font-path "$subs/_shared/fonts" $inputs "$item/handwritten.typ" "$tmp/$name.pdf"
  pdftoppm -r $dpi -f 1 -l 1 -png "$tmp/$name.pdf" "$tmp/$name"
  env "$@" uv run --quiet --with numpy,scipy,pillow,scikit-image python "$here/inkify.py" $dpi "$tmp/$name-ink.pdf" "$tmp/$name"-1.png
  pdftoppm -r $dpi -png "$tmp/$name-ink.pdf" "$tmp/$name-ink"
  echo "$tmp/$name-ink-1.png|$label" >> "$tmp/list"
}
variant A "A  plain" "" X=1
variant B "B  every letter drawn differently" "--input letters=1" X=1
variant C "C  lines tilt and sag (no ruled paper)" "" INK_SLOPE=1
variant D "D  ballpoint skips and blobs" "" INK_DEFECTS=1
variant E "E  black ballpoint" "" INK_PEN=black
variant F "F  blue gel pen" "" INK_PEN=gel
variant G "G  pencil" "" INK_PEN=pencil
variant H "H  rushed: twice as messy" "--input mess=2" X=1
variant I "I  B + C + D, blue ballpoint (the owner's default)" "--input letters=1" INK_SLOPE=1 INK_DEFECTS=1
uv run --quiet --with pillow python - "$tmp/list" "$item/prototypes.pdf" $dpi <<'PY'
import subprocess, sys
from PIL import Image, ImageDraw, ImageFont
lst, out, dpi = sys.argv[1], sys.argv[2], int(sys.argv[3])
font = ImageFont.truetype(subprocess.run(["fc-match", "-f", "%{file}", "sans:bold"], capture_output=True, text=True).stdout, dpi // 5)
pages = []
for line in open(lst):
    path, label = line.rstrip("\n").split("|")
    im = Image.open(path).convert("RGB")
    bar = dpi // 3
    o = Image.new("RGB", (im.width, im.height + bar), (225, 50, 50))
    o.paste(im, (0, bar))
    ImageDraw.Draw(o).text((dpi // 6, dpi // 14), label, fill="white", font=font)
    pages.append(o)
pages[0].save(out, save_all=True, append_images=pages[1:], resolution=dpi, quality=85)
PY
echo "wrote $item/prototypes.pdf"

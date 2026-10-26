"""Draw the output of experiments.py as a terminal screenshot for the report.

    python terminal.py    # writes figures/terminal-output.png

It reruns `experiments.py --plot` (which reprints the same table from results/results.json,
without rerunning the simulation) and draws the captured text in a terminal window.
"""

import pathlib
import subprocess
import sys

import matplotlib
from PIL import Image, ImageDraw, ImageFont

HERE = pathlib.Path(__file__).parent
# DejaVu Sans Mono ships with Matplotlib, so this works on any machine that runs the experiments.
FONTS = pathlib.Path(matplotlib.get_data_path()) / "fonts" / "ttf"
MONO, MONO_BOLD = str(FONTS / "DejaVuSansMono.ttf"), str(FONTS / "DejaVuSansMono-Bold.ttf")

BG, BAR, FG = (30, 30, 36), (52, 52, 60), (220, 223, 228)
GREEN, BLUE, MUTED = (126, 211, 133), (122, 162, 247), (150, 154, 165)


def main():
    out = subprocess.run([sys.executable, "experiments.py", "--plot"], cwd=HERE,
                         capture_output=True, text=True, check=True).stdout.rstrip("\n").splitlines()
    size, scale = 15, 2
    font = ImageFont.truetype(MONO, size * scale)
    bold = ImageFont.truetype(MONO_BOLD, size * scale)
    lh = int(size * 1.45 * scale)
    pad, bar = 18 * scale, 34 * scale
    cw = font.getlength("M")
    cols = max(len(l) for l in out + ["sim $ python experiments.py"]) + 2
    w = int(pad * 2 + cw * cols)
    h = bar + pad * 2 + lh * (len(out) + 2)

    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=10 * scale, fill=BG)
    d.rounded_rectangle([0, 0, w - 1, bar + 10 * scale], radius=10 * scale, fill=BAR)
    d.rectangle([0, bar, w - 1, bar + 10 * scale], fill=BG)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        x, y, r = 22 * scale + i * 22 * scale, bar // 2, 6 * scale
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
    title = "Terminal — ai-lab/project-report/sim"
    d.text(((w - font.getlength(title) * 0.85) / 2, bar // 2), title, fill=MUTED,
           font=ImageFont.truetype(MONO, int(size * 0.85 * scale)), anchor="lm")

    y = bar + pad
    d.text((pad, y), "sim", fill=BLUE, font=bold)
    d.text((pad + cw * 4, y), "$", fill=GREEN, font=bold)
    d.text((pad + cw * 6, y), "python experiments.py", fill=FG, font=font)
    for line in out:
        y += lh
        d.text((pad, y), line, fill=GREEN if line.startswith("Prequal") else FG, font=font)
    y += lh
    d.text((pad, y), "sim", fill=BLUE, font=bold)
    d.text((pad + cw * 4, y), "$", fill=GREEN, font=bold)
    d.rectangle([pad + cw * 6, y + 2 * scale, pad + cw * 7, y + lh - 6 * scale], fill=FG)

    dest = HERE.parent / "figures" / "terminal-output.png"
    img.save(dest)
    print("wrote", dest)


if __name__ == "__main__":
    main()

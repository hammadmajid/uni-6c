"""Turn the clean typst render into something that looks written with a ballpoint on paper.

Warps strokes (hand wobble), varies pen pressure, adds ink grain and a slight bleed,
then lays the ink on plain paper. Run through inkify.sh.
"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, map_coordinates

rng = np.random.default_rng(7)
PAPER = np.array([247, 245, 236], float)
INK = np.array([24, 36, 112], float)


def noise(shape, sigma, lo, hi):
    n = gaussian_filter(rng.standard_normal(shape), sigma)
    n = (n - n.min()) / (n.max() - n.min() + 1e-9)
    return lo + n * (hi - lo)


def warp(a, sigma, amp):
    h, w = a.shape
    dx = gaussian_filter(rng.standard_normal((h, w)), sigma)
    dy = gaussian_filter(rng.standard_normal((h, w)), sigma)
    dx *= amp / (np.abs(dx).max() + 1e-9)
    dy *= amp / (np.abs(dy).max() + 1e-9)
    y, x = np.mgrid[0:h, 0:w]
    return map_coordinates(a, [y + dy, x + dx], order=1, mode="nearest")


def page(path, dpi):
    g = np.asarray(Image.open(path).convert("L"), float) / 255
    ink = 1 - g
    h, w = ink.shape
    ink = warp(ink, 6, 0.9 * dpi / 150)      # letter-level wobble
    ink = warp(ink, 60, 3 * dpi / 150)       # slow drift across a line
    ink = gaussian_filter(ink, 0.35 * dpi / 150)   # slight bleed
    ink = np.clip(ink, 0, 1) ** 1.15               # thin ballpoint line, not marker
    pressure = noise((h, w), 30 * dpi / 150, 0.78, 1.0)
    grain = 1 - 0.2 * rng.random((h, w)) ** 3
    ink *= pressure * grain

    paper = np.ones((h, w, 3)) * PAPER
    paper *= noise((h, w), 2, 0.975, 1.0)[..., None]     # paper fibre
    paper *= noise((h, w), 200, 0.975, 1.0)[..., None]    # uneven light

    ink_rgb = INK * noise((h, w), 80, 0.92, 1.08)[..., None]
    out = paper * (1 - ink[..., None]) + ink_rgb * ink[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


if __name__ == "__main__":
    dpi = int(sys.argv[1])
    out = sys.argv[2]
    pages = [page(p, dpi) for p in sys.argv[3:]]
    pages[0].save(out, save_all=True, append_images=pages[1:], resolution=dpi, quality=88)

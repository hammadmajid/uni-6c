"""Turn the clean typst render into something that looks written with a ballpoint on paper.

Warps strokes (hand wobble), varies pen pressure, adds ink grain and a slight bleed,
then lays the ink on plain white paper. Run through build.sh.
"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import convolve, gaussian_filter, map_coordinates
from skimage.morphology import skeletonize

import os

rng = np.random.default_rng(7)
PAPER = np.array([255, 255, 255], float)
# Knobs for trying variants (env vars): INK_PEN, INK_SLOPE, INK_DEFECTS.
PEN = os.environ.get("INK_PEN", "blue")          # blue | black | gel | pencil
SLOPE = float(os.environ.get("INK_SLOPE", "0"))  # 0 = straight lines; 1 = lines tilt and sag like unruled paper
DEFECTS = os.environ.get("INK_DEFECTS", "0") == "1"  # ballpoint skips and blobs
INK = {"blue": (24, 36, 112), "black": (28, 28, 34), "gel": (12, 20, 70), "pencil": (52, 52, 60)}[PEN]
INK = np.array(INK, float)


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


def page(path, dpi, mess):
    g = np.asarray(Image.open(path).convert("L"), float) / 255
    ink = 1 - g
    h, w = ink.shape
    if SLOPE:
        # Unruled paper: each line drifts up or down across the page and sags a little,
        # and neighbouring lines don't agree on the angle.
        yy, xx = np.mgrid[0:h, 0:w]
        xn = xx / w
        tilt = gaussian_filter(rng.standard_normal(h), 45 * dpi / 150)
        tilt *= 1 / (np.abs(tilt).max() + 1e-9)
        sag = gaussian_filter(rng.standard_normal(h), 80 * dpi / 150)
        sag *= 1 / (np.abs(sag).max() + 1e-9)
        dy = SLOPE * mess * dpi / 150 * (30 * tilt[:, None] * xn + 16 * sag[:, None] * (xn - 0.5) ** 2 * 4)
        ink = map_coordinates(ink, [yy + dy, xx], order=1, mode="constant")
    ink = warp(ink, 6, 0.9 * mess * dpi / 150)      # letter-level wobble
    ink = warp(ink, 60, 3 * mess * dpi / 150)       # slow drift across a line
    if PEN == "gel":
        ink = gaussian_filter(ink, 0.6 * dpi / 150)   # gel spreads more, darker and even
        ink = np.clip(ink * 1.3, 0, 1)
        pressure = noise((h, w), 30 * dpi / 150, 0.92, 1.0)
        grain = np.ones((h, w))
    elif PEN == "pencil":
        ink = gaussian_filter(ink, 0.45 * dpi / 150)
        pressure = noise((h, w), 30 * dpi / 150, 0.75, 1.0)
        tooth = noise((h, w), 0.7, 0, 1)             # graphite catches only the paper's high points
        grain = np.clip((tooth - 0.15) * 1.8, 0.4, 1)
    else:
        ink = gaussian_filter(ink, 0.35 * dpi / 150)   # slight bleed
        ink = np.clip(ink, 0, 1) ** 1.15               # thin ballpoint line, not marker
        pressure = noise((h, w), 30 * dpi / 150, 0.78, 1.0)
        grain = 1 - 0.2 * rng.random((h, w)) ** 3
    ink *= pressure * grain
    if DEFECTS:
        # Ballpoint skips: short thin gaps where the ball didn't roll.
        streak = gaussian_filter(rng.standard_normal((h, w)), (0.8 * dpi / 150, 3.5 * dpi / 150))
        ink *= np.where(streak > np.quantile(streak, 0.97), 0.15, 1.0)
        # Blobs: ink pools where the pen lands or lifts, so only at stroke ends,
        # never partway along a stroke. Found as skeleton pixels with one neighbour.
        skel = skeletonize(ink > 0.45)
        nb = convolve(skel.astype(int), np.ones((3, 3), int), mode="constant") - skel
        ends = np.argwhere(skel & (nb == 1))
        want = 0.7 * 0.002 * (ink > 0.5).sum()          # 30% fewer than before
        pick = ends[rng.random(len(ends)) < min(1, want / max(1, len(ends)))]
        blob = np.zeros_like(ink)
        r = int(6 * dpi / 150)
        for y, x in pick:
            # Every blob a little different: size, strength, and a short smear.
            sig = rng.uniform(0.8, 2.0) * dpi / 150
            amp = rng.uniform(0.35, 1.0)
            ang = rng.uniform(0, 2 * np.pi)
            for step in range(rng.integers(1, 4)):
                cy = y + np.sin(ang) * step * sig * 0.8
                cx = x + np.cos(ang) * step * sig * 0.8
                y0, y1 = max(0, int(cy) - r), min(h, int(cy) + r + 1)
                x0, x1 = max(0, int(cx) - r), min(w, int(cx) + r + 1)
                gy, gx = np.mgrid[y0:y1, x0:x1]
                blob[y0:y1, x0:x1] += amp * np.exp(-((gy - cy) ** 2 + (gx - cx) ** 2) / (2 * sig ** 2)) * (0.8 ** step)
        ink = np.clip(ink + blob, 0, 1)

    paper = np.ones((h, w, 3)) * PAPER

    ink_rgb = INK * noise((h, w), 80, 0.92, 1.08)[..., None]
    if PEN == "pencil":
        ink = ink * 0.92   # graphite never gets fully dark
    out = paper * (1 - ink[..., None]) + ink_rgb * ink[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


if __name__ == "__main__":
    dpi = int(sys.argv[1])
    out = sys.argv[2]
    files = sys.argv[3:]
    # later pages wobble more: the hand gets tired
    pages = [page(p, dpi, 1 + 0.5 * k / max(1, len(files) - 1)) for k, p in enumerate(files)]
    pages[0].save(out, save_all=True, append_images=pages[1:], resolution=dpi, quality=88)

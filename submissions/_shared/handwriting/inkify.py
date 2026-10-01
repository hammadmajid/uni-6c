"""Turn the clean typst render into something that looks written with a ballpoint on paper.

Warps strokes (hand wobble), varies pen pressure, adds ink grain and a slight bleed,
then lays the ink on plain white paper. Run through build.sh.
"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, convolve, distance_transform_edt, gaussian_filter, map_coordinates
from skimage.morphology import skeletonize

import os

rng = np.random.default_rng(7)
PAPER = np.array([255, 255, 255], float)
# Knobs for trying variants (env vars): INK_PEN, INK_SLOPE, INK_DEFECTS, INK_WIDTH.
PEN = os.environ.get("INK_PEN", "blue")          # blue | black | gel | pencil
SLOPE = float(os.environ.get("INK_SLOPE", "0"))  # 0 = straight lines; 1 = lines tilt and sag like unruled paper
DEFECTS = os.environ.get("INK_DEFECTS", "0") == "1"  # ballpoint skips and blobs
INK = {"blue": (22, 44, 150), "black": (28, 28, 34), "gel": (12, 20, 70), "pencil": (52, 52, 60)}[PEN]
INK = np.array(INK, float)
# Ballpoint line width in mm. The fonts draw about 0.5 mm at 23pt, which printed like a thick pen.
WIDTH = float(os.environ.get("INK_WIDTH", "0.28"))


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


def line_touches(ink, dpi, rate=0.6):
    """Per written line: the start drifts a little left or right (a hand never lines lines up),
    and now and then the last word runs out of room: squeezed, and still running ~1% off the page."""
    h, w = ink.shape
    rows = (ink > 0.3).sum(axis=1) > 2
    bands, y = [], 0
    while y < h:
        if rows[y]:
            y0 = y
            while y < h and rows[y]:
                y += 1
            if 0.15 * dpi <= y - y0 <= 0.6 * dpi:   # one line of writing, not a diagram or table
                bands.append((y0, y))
        y += 1

    def shift(y0, y1, dx):
        band = ink[y0:y1].copy()
        ink[y0:y1] = 0
        if dx >= 0:
            ink[y0:y1, dx:] = band[:, :w - dx]
        else:
            ink[y0:y1, :w + dx] = band[:, -dx:]

    for y0, y1 in bands:
        shift(y0, y1, int(rng.uniform(-1, 1) * 0.05 * dpi))
    # About one line per page (60% chance) that runs out of room, picked among lines that can.
    chosen = rng.random() < rate
    for y0, y1 in [bands[i] for i in rng.permutation(len(bands))]:
        if not chosen:
            break
        # Words on the line: runs of inked columns split by gaps wider than a letter gap.
        cols = np.flatnonzero((ink[y0:y1] > 0.3).any(axis=0))
        if len(cols) < 2:
            continue
        cuts = np.flatnonzero(np.diff(cols) > 0.06 * dpi)
        words = list(zip(cols[np.r_[0, cuts + 1]], cols[np.r_[cuts, len(cols) - 1]] + 1))
        if len(words) < 4:
            continue
        x0, x1 = words[-1]
        f = rng.uniform(0.86, 0.92)
        n = int((x1 - x0) * f)
        extra = int(w * 1.01) - (x0 + n)    # how far the squeezed word must move to end ~1% off the page
        if extra < 0 or extra > (len(words) - 1) * 0.06 * dpi:
            continue   # the word gaps would have to stretch too much
        src = ink[y0:y1].copy()
        ink[y0:y1] = 0
        last = map_coordinates(src[:, x0:x1], np.meshgrid(np.arange(y1 - y0), np.arange(n) / f, indexing="ij"), order=1)
        # spread the push over the word gaps, so no single gap gives it away
        for k, (a, b) in enumerate(words):
            d = int(extra * k / (len(words) - 1))
            piece = last if k == len(words) - 1 else src[:, a:b]
            lo, hi = a + d, min(w, a + d + piece.shape[1])
            if lo < hi:
                ink[y0:y1, lo:hi] = np.maximum(ink[y0:y1, lo:hi], piece[:, :hi - lo])
        break
    return ink


def stray_marks(ink, dpi, n):
    """A pen dot or a short slip-stroke trailing off a word ending, next to the writing, never on it."""
    h, w = ink.shape
    skel = skeletonize(ink > 0.5)
    nb = convolve(skel.astype(int), np.ones((3, 3), int), mode="constant") - skel
    ends = np.argwhere(skel & (nb == 1))
    k = dpi / 200
    yy, xx = np.mgrid[0:h, 0:w]
    done = 0
    for y, x in ends[rng.permutation(len(ends))]:
        if done >= n:
            break
        if rng.random() < 0.5:   # dot where the pen touched down
            cy, cx = y + rng.uniform(-8, 8) * k, x + rng.uniform(9, 20) * k
            pts = [(cy, cx, rng.uniform(1.1, 1.7) * k)]
        else:                    # slip: the pen keeps going a little after the word
            ang = rng.uniform(0.15, 1.1)
            L = rng.uniform(12, 26) * k
            pts = [(y + np.sin(ang) * t * L, x + 3 * k + np.cos(ang) * t * L, (1.2 - 0.8 * t) * k) for t in np.linspace(0.15, 1, 14)]
        ys = [p[0] for p in pts]; xs = [p[1] for p in pts]
        y0, y1 = int(min(ys) - 6 * k), int(max(ys) + 6 * k)
        x0, x1 = int(min(xs) - 6 * k), int(max(xs) + 6 * k)
        if y0 < 0 or x0 < 0 or y1 >= h or x1 >= w:
            continue
        # must land on blank paper (the word end it leaves from aside)
        clear = ink[y0:y1, x0:x1].copy()
        clear[max(0, y - y0 - 5):y - y0 + 6, max(0, x - x0 - 5):x - x0 + 6] = 0
        if clear.max() > 0.15:
            continue
        sub_y, sub_x = yy[y0:y1, x0:x1], xx[y0:y1, x0:x1]
        mark = np.zeros((y1 - y0, x1 - x0))
        for cy, cx, r in pts:
            mark = np.maximum(mark, np.clip(r + 0.5 - np.hypot(sub_y - cy, sub_x - cx), 0, 1))
        ink[y0:y1, x0:x1] = np.maximum(ink[y0:y1, x0:x1], mark)
        done += 1
    return ink


def page(path, dpi, mess, marks=0):
    g = np.asarray(Image.open(path).convert("L"), float) / 255
    ink = 1 - g
    h, w = ink.shape
    ink = line_touches(ink, dpi)
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
        # A ballpoint draws one width whatever the font did: redraw every stroke
        # (text and diagram lines alike) as a line of WIDTH around its skeleton,
        # with the width breathing a little along the stroke.
        skel = skeletonize(ink > 0.5)
        r = WIDTH / 25.4 * dpi / 2 * noise((h, w), 12 * dpi / 150, 0.85, 1.12)
        thin = np.clip(r + 0.5 - distance_transform_edt(~skel), 0, 1)
        # Scribbled-out words are solid patches, not strokes: keep those as dense as drawn.
        k = dpi / 200
        solid = binary_dilation(distance_transform_edt(ink > 0.5) >= 3.5 * k, iterations=int(4 * k))
        ink = np.maximum(thin, ink * solid)
        ink = gaussian_filter(ink, 0.25 * dpi / 150)   # slight bleed
        ink = np.clip(ink * 1.15, 0, 1)
        pressure = noise((h, w), 30 * dpi / 150, 0.9, 1.0)
        grain = 1 - 0.1 * rng.random((h, w)) ** 3
    if marks:
        ink = stray_marks(ink, dpi, marks)
    ink *= pressure * grain
    if DEFECTS:
        # Ballpoint skips: short thin gaps where the ball didn't roll.
        streak = gaussian_filter(rng.standard_normal((h, w)), (0.8 * dpi / 150, 3.5 * dpi / 150))
        # Rare and partial, or the writing looks faded on paper.
        ink *= np.where(streak > np.quantile(streak, 0.994), 0.45, 1.0)
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
            sig = rng.uniform(0.6, 1.4) * dpi / 150
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
    # one or two stray pen marks across the whole sheet
    marks = np.bincount(rng.integers(0, len(files), rng.integers(1, 3)), minlength=len(files))
    pages = [page(p, dpi, 1 + 0.5 * k / max(1, len(files) - 1), marks[k]) for k, p in enumerate(files)]
    pages[0].save(out, save_all=True, append_images=pages[1:], resolution=dpi, quality=88)

"""Plain 16:9 slide decks in the style of the Prequal NSDI '24 talk: white slides, a short
title, a few bullets and one large picture. Used by the CNDC Lab and AI Lab project decks.

Each deck script builds a list of slides and calls `save(slides, out_dir, stem)`, which writes
  <out_dir>/<stem>.pptx                  slides only
  <out_dir>/speaker-notes/<stem>.pptx    same slides with a speaker script in the notes
  <out_dir>/<stem>.pdf                   PDF export of the slides (needs LibreOffice)
"""

import pathlib
import shutil
import subprocess
import tempfile

from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

W, H = 13.333, 7.5
FONT = "Arial"
INK = RGBColor(0x1F, 0x29, 0x33)
MUTED = RGBColor(0x6B, 0x72, 0x80)
ACCENT = RGBColor(0x3C, 0x78, 0xD8)


class Slide:
    """title, bullets (str, or (str, level) for sub-bullets), image(s) and a speaker note."""

    def __init__(self, title, bullets=(), images=(), notes="", caption="", layout="right",
                 kind="content", big=None, table=None, widths=None):
        self.title, self.bullets, self.images = title, list(bullets), list(images)
        self.notes, self.caption, self.layout, self.kind, self.big = notes, caption, layout, kind, big
        self.table, self.widths = table, widths  # table: rows of cells, first row is the header


def _text(slide, x, y, w, h, paras, size=18, color=INK, bold=False, align=PP_ALIGN.LEFT,
          anchor=MSO_ANCHOR.TOP, bullets=False):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    for i, p in enumerate(paras):
        text, level = (p if isinstance(p, tuple) else (p, 0))
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = align
        para.space_after = Pt(8 if level == 0 else 4)
        if bullets and text:
            # A real hanging bullet, so wrapped lines line up with the text.
            ppr = para._p.get_or_add_pPr()
            indent = Inches(0.3)
            ppr.set("marL", str(int(indent * (level + 1))))
            ppr.set("indent", str(-int(indent)))
            bu = ppr.makeelement(qn("a:buChar"), {"char": "●" if level == 0 else "○"})
            ppr.append(bu)
        run = para.add_run()
        run.text = text
        f = run.font
        f.name, f.size, f.bold = FONT, Pt(size - 3 * level), bold
        f.color.rgb = color if level == 0 else MUTED
    return tb


def _picture(slide, path, x, y, w, h):
    """Fit the image inside the box, centred."""
    iw, ih = Image.open(path).size
    scale = min(w / iw, h / ih)
    pw, ph = iw * scale, ih * scale
    slide.shapes.add_picture(str(path), Inches(x + (w - pw) / 2), Inches(y + (h - ph) / 2),
                             Inches(pw), Inches(ph))


def _table(slide, rows, x, y, w, widths=None, size=16):
    n, m = len(rows), len(rows[0])
    shape = slide.shapes.add_table(n, m, Inches(x), Inches(y), Inches(w), Inches(0.5 * n))
    tbl = shape.table
    widths = widths or [1] * m
    for j, wj in enumerate(widths):
        tbl.columns[j].width = Inches(w * wj / sum(widths))
    for i, row in enumerate(rows):
        for j, cell_text in enumerate(row):
            cell = tbl.cell(i, j)
            cell.text = cell_text
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(0xC9, 0xDA, 0xF8) if i == 0 else (
                RGBColor(0xFF, 0xFF, 0xFF) if i % 2 else RGBColor(0xF3, 0xF4, 0xF6))
            for p in cell.text_frame.paragraphs:
                for r in p.runs:
                    r.font.name, r.font.size, r.font.color.rgb = FONT, Pt(size), INK
                    r.font.bold = i == 0 or j == 0


def _build(slides, footer, with_notes):
    prs = Presentation()
    prs.slide_width, prs.slide_height = Inches(W), Inches(H)
    blank = prs.slide_layouts[6]
    for n, s in enumerate(slides, 1):
        sl = prs.slides.add_slide(blank)
        if s.kind == "title":
            _text(sl, 0.8, 1.3, W - 1.6, 2.0, s.title.split("\n"), size=38, align=PP_ALIGN.CENTER,
                  anchor=MSO_ANCHOR.MIDDLE)
            _text(sl, 0.8, 3.5, W - 1.6, 3.4, s.bullets, size=18, align=PP_ALIGN.CENTER)
        else:
            _text(sl, 0.55, 0.3, W - 1.1, 0.9, [s.title], size=30, anchor=MSO_ANCHOR.MIDDLE)
            top, bottom = 1.3, H - 0.65
            if s.big:
                _text(sl, 0.8, top, W - 1.6, 1.2, [s.big], size=22, color=ACCENT, bold=True,
                      align=PP_ALIGN.CENTER)
                top += 1.1
            if s.table:
                ty = top
                if s.bullets:
                    _text(sl, 0.7, top, W - 1.4, 0.45 * len(s.bullets) + 0.2, s.bullets, size=18, bullets=True)
                    ty += 0.45 * len(s.bullets) + 0.35
                _table(sl, s.table, 0.7, ty, W - 1.4, s.widths)
                box = None
            elif s.images and s.bullets and s.layout == "right":
                _text(sl, 0.6, top + 0.1, 4.3, bottom - top, s.bullets, size=18, bullets=True)
                box = (5.1, top, W - 5.5, bottom - top - (0.35 if s.caption else 0))
            elif s.images and s.bullets:  # bullets above the picture
                lines = len(s.bullets)
                _text(sl, 0.7, top, W - 1.4, 0.45 * lines + 0.2, s.bullets, size=18, bullets=True)
                top += 0.45 * lines + 0.35
                box = (0.6, top, W - 1.2, bottom - top - (0.35 if s.caption else 0))
            elif s.images:
                box = (0.6, top, W - 1.2, bottom - top - (0.35 if s.caption else 0))
            else:
                _text(sl, 0.8, top + 0.1, W - 1.6, bottom - top, s.bullets, size=20, bullets=True)
                box = None
            if box:
                x, y, w, h = box
                k = len(s.images)
                gap = 0.25
                cw = (w - gap * (k - 1)) / k
                for i, img in enumerate(s.images):
                    _picture(sl, img, x + i * (cw + gap), y, cw, h)
                if s.caption:
                    _text(sl, x, y + h + 0.02, w, 0.35, [s.caption], size=11, color=MUTED,
                          align=PP_ALIGN.CENTER)
            _text(sl, 0.55, H - 0.45, 9, 0.35, [footer], size=10, color=MUTED)
            _text(sl, W - 1.35, H - 0.45, 0.8, 0.35, [str(n)], size=10, color=MUTED, align=PP_ALIGN.RIGHT)
        if with_notes and s.notes:
            sl.notes_slide.notes_text_frame.text = s.notes
    return prs


def save(slides, out_dir, stem, footer):
    out = pathlib.Path(out_dir)
    (out / "speaker-notes").mkdir(parents=True, exist_ok=True)
    plain = out / f"{stem}.pptx"
    _build(slides, footer, with_notes=False).save(plain)
    _build(slides, footer, with_notes=True).save(out / "speaker-notes" / f"{stem}.pptx")
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", tmp, str(plain)],
                       check=True, capture_output=True)
        shutil.move(pathlib.Path(tmp) / f"{stem}.pdf", out / f"{stem}.pdf")
    print("wrote", plain, out / "speaker-notes" / f"{stem}.pptx", out / f"{stem}.pdf")

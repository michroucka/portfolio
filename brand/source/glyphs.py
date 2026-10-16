"""Text -> outlined SVG path data from a variable font instance (exploration helper)."""
import functools
import os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONTS = os.path.join(os.path.dirname(__file__), "fonts") + "/"


@functools.lru_cache(None)
def font(name, **axes):
    f = TTFont(FONTS + name + ".ttf")
    if "fvar" in f:
        f = instancer.instantiateVariableFont(f, axes)
    return f


def text_path(name, text, size, x=0, baseline=0, tracking=0, axes=None, kern=None):
    """Return (d, width, (xmin,ymin,xmax,ymax)) for text set at `size` px, baseline at y."""
    f = font(name, **(axes or {}))
    upm = f["head"].unitsPerEm
    s = size / upm
    gs = f.getGlyphSet()
    cmap = f.getBestCmap()
    hmtx = f["hmtx"]
    pen = SVGPathPen(gs, ntos=lambda v: ("%.2f" % v).rstrip("0").rstrip("."))
    bp = BoundsPen(gs)
    cx = x
    kern = kern or {}
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        t = (s, 0, 0, -s, cx, baseline)
        gs[g].draw(TransformPen(pen, t))
        gs[g].draw(TransformPen(bp, t))
        cx += hmtx[g][0] * s + tracking + kern.get(i, 0)
    width = cx - x - tracking
    return pen.getCommands(), width, bp.bounds


def metrics(name, size, axes=None):
    f = font(name, **(axes or {}))
    s = size / f["head"].unitsPerEm
    os2 = f["OS/2"]
    return {"cap": os2.sCapHeight * s, "x": os2.sxHeight * s}

"""Final masters for the mr. logo (positive + optically corrected negative)."""
import os
from glyphs import text_path

OUT = os.path.join(os.path.dirname(__file__), "..", "logo")
os.makedirs(OUT, exist_ok=True)

INK, GRAPHITE, PAPER = "#0E0F11", "#1B1D21", "#F5F3EE"
SIGNAL, SIGNAL_DEEP = "#FF6A3D", "#C2410C"

# positive = dark on light; negative = light on dark (thinner + smaller dot against irradiation)
VERSIONS = {
    "positive": dict(wght=800, name_wght=600, dot=0.119, gap=0.065, fg=INK, dot_fg=SIGNAL_DEEP),
    "negative": dict(wght=770, name_wght=580, dot=0.119, gap=0.065, fg=PAPER, dot_fg=SIGNAL),
}


def mark(S, v, fg, dot_fg):
    """mr ligature + round dot nested under r's arm. Origin = left of m stem, baseline y=0."""
    A = {"wdth": 125, "wght": v["wght"]}
    _, _, bl = text_path("Archivo", "l", S, axes=A)
    stem = bl[2] - bl[0]
    _, _, bm = text_path("Archivo", "m", S, axes=A)
    _, _, br = text_path("Archivo", "r", S, axes=A)
    lsb = br[0]
    rx = (bm[2] - stem) - lsb                      # r stem sits exactly on m's last stem
    dm, _, _ = text_path("Archivo", "m", S, x=-bm[0], axes=A)
    dr, _, _ = text_path("Archivo", "r", S, x=rx - bm[0], axes=A)
    stem_r = rx - bm[0] + lsb + stem
    r = v["dot"] * S
    cx = stem_r + v["gap"] * S + r
    width = max(cx + r, rx - bm[0] + br[2])
    body = (f'<path fill="{fg}" d="{dm} {dr}"/>'
            f'<circle fill="{dot_fg}" cx="{cx:.2f}" cy="{-r:.2f}" r="{r:.2f}"/>')
    return body, width, -bm[1], 2 * r


def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" '
            f'height="{h:.0f}" role="img" aria-labelledby="t"><title id="t">{title}</title>{body}</svg>\n')


def write(name, content):
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content)


for key, v in VERSIONS.items():
    for mode, fg, dfg in [("color", v["fg"], v["dot_fg"]), ("mono", v["fg"], v["fg"])]:
        suffix = f"{key}" if mode == "color" else f"{key}-mono"
        # symbol: 256 square, ~8 % padding
        S = 150
        b, w, h, dot = mark(S, v, fg, dfg)
        write(f"mr-symbol-{suffix}.svg",
              svg(256, 256, f'<g transform="translate({(256 - w) / 2:.2f} {128 + h / 2:.2f})">{b}</g>',
                  "Michal Roučka – logo mr."))
        # horizontal lockup: gap and padding = 1 dot diameter
        S = 130
        b, w, h, dot = mark(S, v, fg, dfg)
        name_d, name_w, nb = text_path("Archivo", "Michal Roučka", 52,
                                       axes={"wdth": 125, "wght": v["name_wght"]}, tracking=-1)
        cap = -nb[1]
        H = h + 2 * dot
        tx = dot + w + dot
        body = (f'<g transform="translate({dot:.2f} {dot + h:.2f})">{b}</g>'
                f'<path fill="{fg}" transform="translate({tx:.2f} {dot + h / 2 + cap / 2:.2f})" d="{name_d}"/>')
        write(f"mr-horizontal-{suffix}.svg", svg(tx + name_w + dot, H, body, "Michal Roučka"))
        # stacked lockup
        S = 200
        b, w, h, dot = mark(S, v, fg, dfg)
        name_d, name_w, nb = text_path("Archivo", "Michal Roučka", 46,
                                       axes={"wdth": 125, "wght": v["name_wght"]}, tracking=-0.5)
        cap = -nb[1]
        W = max(w, name_w) + 2 * dot
        body = (f'<g transform="translate({(W - w) / 2:.2f} {dot + h:.2f})">{b}</g>'
                f'<path fill="{fg}" transform="translate({(W - name_w) / 2:.2f} {dot + h + dot * 0.9 + cap:.2f})" d="{name_d}"/>')
        write(f"mr-stacked-{suffix}.svg", svg(W, dot + h + dot * 0.9 + cap + dot, body, "Michal Roučka"))

# favicon / app-icon source: negative mark on an Ink tile (dark tabs + light tabs both work)
v = dict(VERSIONS["positive"])  # heavier geometry survives 16 px better
S = 158
b, w, h, dot = mark(S, v, PAPER, SIGNAL)
write("mr-favicon.svg",
      svg(256, 256, f'<rect width="256" height="256" rx="56" fill="{INK}"/>'
                    f'<g transform="translate({(256 - w) / 2:.2f} {128 + h / 2 - 4:.2f})">{b}</g>',
          "Michal Roučka"))
print("ok")

# motion storyboard: dot -> underscore cursor (negative version, frames for the guidelines)
MOT = os.path.join(os.path.dirname(__file__), "..", "motion")
os.makedirs(MOT, exist_ok=True)
v = VERSIONS["negative"]
S = 150
b, w, h, dot = mark(S, v, PAPER, SIGNAL)
cx_line = b.split('cx="')[1].split('"')[0]
cx = float(cx_line); r = dot / 2
letters = b.split("<circle")[0]
bar_w, bar_h = 0.46 * S, 0.15 * S
x0 = cx - r
frames = [
    ("1-tecka", f'<circle fill="{SIGNAL}" cx="{cx:.2f}" cy="{-r:.2f}" r="{r:.2f}"/>'),
    ("2-morph", f'<rect fill="{SIGNAL}" x="{x0:.2f}" y="{-(r * 1.2):.2f}" width="{(dot + bar_w) / 2:.2f}" height="{r * 1.2:.2f}" rx="{r * 0.6:.2f}"/>'),
    ("3-kurzor", f'<rect fill="{SIGNAL}" x="{x0:.2f}" y="{-bar_h:.2f}" width="{bar_w:.2f}" height="{bar_h:.2f}"/>'),
    ("4-blik", f'<rect fill="{SIGNAL}" opacity="0.12" x="{x0:.2f}" y="{-bar_h:.2f}" width="{bar_w:.2f}" height="{bar_h:.2f}"/>'),
]
W = x0 + max(dot, bar_w)
for n, extra in frames:
    with open(f"{MOT}/frame-{n}.svg", "w") as f:
        f.write(svg(300, 256, f'<rect width="300" height="256" fill="{INK}"/><g transform="translate({(300 - W) / 2:.2f} {128 + h / 2:.2f})">{letters}{extra}</g>', n))
print("motion ok")

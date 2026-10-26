"""Method diagrams for the Prequal review, redrawn from the paper and its NSDI '24 slides.

    python diagrams.py [out_dir]   # default: ./figures

The AI lab report uses the same diagrams: python diagrams.py ../../ai-lab/project-report/figures
"""

import pathlib
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).parent / "figures")

INK = "#1f2933"
MUTED = "#6b7280"
BLUE, BLUE_EDGE = "#c9daf8", "#3c78d8"
GREEN, GREEN_EDGE, GREEN_DARK = "#d9ead3", "#6aa84f", "#93c47d"
RED, RED_EDGE = "#f4cccc", "#cc0000"
AMBER, AMBER_EDGE = "#fff2cc", "#bf9000"
GREY, GREY_EDGE = "#f3f4f6", "#9ca3af"

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11, "savefig.dpi": 220})


def canvas(w=10, h=5.2):
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(0, w * 10)
    ax.set_ylim(0, h * 10)
    ax.axis("off")
    return fig, ax


def box(ax, x, y, w, h, text="", fc=GREY, ec=GREY_EDGE, size=11, weight="normal", color=INK, r=1.2, lw=1.4):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0,rounding_size={r}",
                                fc=fc, ec=ec, lw=lw))
    if text:
        ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=size,
                weight=weight, color=color)


def arrow(ax, a, b, color=INK, style="-|>", lw=1.4, ls="-", rad=0.0, text=None, tsize=9, tpos=0.5, toff=(0, 1.2)):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle=style, mutation_scale=12, color=color, lw=lw,
                                 linestyle=ls, connectionstyle=f"arc3,rad={rad}", shrinkA=2, shrinkB=2))
    if text:
        x = a[0] + (b[0] - a[0]) * tpos + toff[0]
        y = a[1] + (b[1] - a[1]) * tpos + toff[1]
        ax.text(x, y, text, ha="center", va="bottom", fontsize=tsize, color=color)


def save(fig, name):
    OUT.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUT / name, bbox_inches="tight", pad_inches=0.08, facecolor="white")
    plt.close(fig)


def fleet():
    """Clients spread queries over a fleet of server replicas."""
    fig, ax = canvas(10, 4.6)
    clients = [12 + i * 16 for i in range(5)]
    servers = [6 + i * 12 for i in range(7)]
    for cx in clients:
        for sx in servers:
            ax.plot([cx + 4, sx + 4], [33, 13], color="#cbd5e1", lw=0.8, zorder=0)
    for cx in clients:
        box(ax, cx, 33, 8, 6, "C", BLUE, BLUE_EDGE, 10)
    for sx in servers:
        box(ax, sx, 7, 8, 6, "S", RED, RED_EDGE, 10)
    ax.text(94, 36, "client tasks\n(e.g. YouTube\nfrontends)", fontsize=10, va="center", color=INK)
    ax.text(94, 10, "server replicas\n(same service,\nhundreds of copies)", fontsize=10, va="center", color=INK)
    ax.text(50, 43, "Each client picks a replica for every query", ha="center", fontsize=12, weight="bold", color=INK)
    ax.text(50, 1.5, "goal: lowest latency for users, especially the slowest 1% (p99 tail)",
            ha="center", fontsize=10, color=MUTED)
    ax.set_xlim(0, 115)
    save(fig, "fleet.png")


def cpu_vs_rif():
    """Same CPU reading, very different queues: why CPU is the wrong signal."""
    fig, ax = canvas(10, 4.8)
    for x0, name, own, ant, rif, lat, ok in [
        (4, "Server A", 0.55, 0.05, 2, "12 ms", True),
        (54, "Server B", 0.20, 0.40, 9, "95 ms", False),
    ]:
        ec = GREEN_EDGE if ok else RED_EDGE
        box(ax, x0, 4, 42, 40, "", "white", ec, lw=2)
        ax.text(x0 + 21, 40, name, ha="center", fontsize=13, weight="bold", color=INK)
        # CPU bar: our share plus the antagonist's share
        ax.text(x0 + 3, 33, "CPU, 1 s average", fontsize=10, color=MUTED)
        ax.add_patch(FancyBboxPatch((x0 + 3, 27), 36, 4, boxstyle="square,pad=0", fc=GREY, ec=GREY_EDGE))
        ax.add_patch(FancyBboxPatch((x0 + 3, 27), 36 * own, 4, boxstyle="square,pad=0", fc=BLUE_EDGE, ec="none"))
        ax.add_patch(FancyBboxPatch((x0 + 3 + 36 * own, 27), 36 * ant, 4, boxstyle="square,pad=0",
                                    fc=AMBER_EDGE, ec="none"))
        ax.text(x0 + 3 + 36 * (own + ant) + 1, 29, "60%", va="center", fontsize=11, weight="bold", color=INK)
        # requests in flight
        ax.text(x0 + 3, 20, "Requests in flight (RIF) right now", fontsize=10, color=MUTED)
        for i in range(rif):
            box(ax, x0 + 3 + i * 4, 13, 3.2, 5, "", RED if not ok else GREEN, ec, r=0.5, lw=1)
        ax.text(x0 + 3 + rif * 4 + 1, 15.5, str(rif), va="center", fontsize=11, weight="bold", color=INK)
        ax.text(x0 + 21, 7, f"next request waits about {lat}", ha="center", fontsize=11,
                color=GREEN_EDGE if ok else RED_EDGE, weight="bold")
    ax.add_patch(FancyBboxPatch((20, 46.5), 3, 2, boxstyle="square,pad=0", fc=BLUE_EDGE, ec="none"))
    ax.text(24, 47.5, "this service", va="center", fontsize=9, color=MUTED)
    ax.add_patch(FancyBboxPatch((40, 46.5), 3, 2, boxstyle="square,pad=0", fc=AMBER_EDGE, ec="none"))
    ax.text(44, 47.5, "antagonist (another job on the same machine)", va="center", fontsize=9, color=MUTED)
    ax.set_ylim(0, 50)
    save(fig, "cpu-vs-rif.png")


def signals():
    """What each server tracks: RIF and latency per RIF level."""
    fig, ax = canvas(10, 4.4)
    box(ax, 32, 6, 36, 32, "", RED, RED_EDGE, lw=2)
    ax.text(50, 33, "RIF = 3", ha="center", fontsize=13, weight="bold", color=RED_EDGE, family="monospace")
    for i in range(3):
        box(ax, 40, 23 - i * 6, 20, 4.5, "request", "white", RED_EDGE, 10, r=0.6, lw=1)
    ax.text(50, 8, "server replica", ha="center", fontsize=11, color=INK)
    box(ax, 4, 18, 14, 6, "request", BLUE, BLUE_EDGE, 10)
    arrow(ax, (18, 21), (31.5, 21))
    ax.text(10, 28, "arrives at t_start", ha="center", fontsize=10, color=INK, family="monospace")
    ax.text(10, 12, "RIF + 1", ha="center", fontsize=12, color=GREEN_EDGE, weight="bold", family="monospace")
    box(ax, 82, 18, 14, 6, "response", BLUE, BLUE_EDGE, 10)
    arrow(ax, (68.5, 21), (82, 21))
    ax.text(89, 28, "leaves at t_finish", ha="center", fontsize=10, color=INK, family="monospace")
    ax.text(89, 12, "RIF − 1", ha="center", fontsize=12, color=GREEN_EDGE, weight="bold", family="monospace")
    ax.text(50, -1, "latency(r) = median of recent (t_finish − t_start)\nfor requests that arrived when RIF was r",
            ha="center", va="top", fontsize=10.5, color=INK, family="monospace")
    ax.set_ylim(-8, 44)
    save(fig, "signals.png")


def probe_pool():
    """Asynchronous probes fill a small pool; the query picks from the pool without waiting."""
    fig, ax = canvas(10, 5.4)
    box(ax, 22, 4, 44, 46, "", "#fafafa", GREY_EDGE, lw=1.6, r=2)
    ax.text(44, 46.5, "Prequal client", ha="center", fontsize=12, weight="bold", color=INK)
    box(ax, 27, 37, 34, 6, "probe sender (background)", GREEN_DARK, GREEN_EDGE, 10)
    box(ax, 27, 15, 34, 19, "", GREEN, GREEN_EDGE, lw=1.4)
    ax.text(44, 31, "probe pool (max 16, each ≤ 1 s old)", ha="center", fontsize=9.5, color=INK)
    for i, t in enumerate(["S2: RIF 1, 15 ms", "S5: RIF 3, 10 ms", "S4: RIF 14, 90 ms"]):
        box(ax, 30, 25 - i * 4.6, 28, 3.8, t, "white", GREEN_EDGE, 9, r=0.6, lw=1)
    box(ax, 27, 7, 34, 6, "pick best server", BLUE, BLUE_EDGE, 10, weight="bold")
    box(ax, 2, 7, 13, 6, "query", BLUE, BLUE_EDGE, 10)
    arrow(ax, (15, 10), (26.5, 10), BLUE_EDGE)
    ys = [44, 37, 30, 23, 16, 9]
    for i, y in enumerate(ys):
        box(ax, 84, y, 14, 5, f"server S{i + 1}", RED, RED_EDGE, 9.5)
    for y in [44, 30, 16]:
        arrow(ax, (61.5, 40), (83.5, y + 2.5), GREEN_EDGE, ls="--", lw=1.2)
    ax.text(72, 45, "probe", fontsize=9, color=GREEN_EDGE, rotation=10)
    arrow(ax, (83.5, 28), (61.5, 24), GREEN_EDGE, lw=1.2)
    ax.text(73, 20.5, "reply:\nRIF + latency", ha="center", fontsize=9, color=GREEN_EDGE)
    arrow(ax, (61.5, 10), (83.5, 25.5), BLUE_EDGE, lw=2, text="query", tsize=10, tpos=0.55, toff=(3, -3))
    ax.text(44, 0.5, "about 3 probes per query, sent in the background; the query never waits for a probe",
            ha="center", fontsize=10, color=MUTED)
    ax.set_xlim(0, 100)
    ax.set_ylim(-1, 52)
    save(fig, "probe-pool.png")


def hot_cold():
    """Hot/cold lexicographic selection on the probe pool."""
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.6))
    cases = [
        ("Some cold probes: lowest-latency cold server wins",
         [("D", 1, 15), ("M", 3, 10), ("B", 4, 50), ("F", 14, 90), ("X", 20, 210)], 1, 3),
        ("All probes hot: lowest-RIF server wins",
         [("E", 15, 50), ("A", 19, 40), ("J", 25, 80), ("H", 40, 120), ("W", 60, 210)], 0, 0),
    ]
    for ax, (title, rows, pick, n_cold) in zip(axes, cases):
        ax.set_xlim(-4, 62)
        ax.set_ylim(0, 46)
        ax.axis("off")
        ax.text(30, 44, title, ha="center", fontsize=11.5, weight="bold", color=INK)
        for x, h in [(8, "server"), (24, "RIF"), (40, "latency (ms)")]:
            ax.text(x + 6, 37.5, h, ha="center", fontsize=10, color=MUTED)
        for i, (s, rif, lat) in enumerate(rows):
            y = 31 - i * 6.2
            cold = i < n_cold
            fc, ec = (GREEN, GREEN_EDGE) if cold else (RED, RED_EDGE)
            lw = 3 if i == pick else 1.2
            ec = "#f1c232" if i == pick else ec
            box(ax, 4, y, 52, 5, "", fc, ec, lw=lw, r=0.8)
            for x, v in [(8, s), (24, rif), (40, lat)]:
                ax.text(x + 6, y + 2.5, str(v), ha="center", va="center", fontsize=11, color=INK)
            if i == pick:
                ax.text(57, y + 2.5, "◀ pick", va="center", fontsize=10, weight="bold", color="#b45f06")
        if n_cold:
            y = 31 - n_cold * 6.2 + 5.6
            ax.plot([1, 59], [y, y], ls=":", color=INK, lw=1.2)
            ax.text(3.5, y + 0.8, "cold ▲", fontsize=9, color=GREEN_EDGE, ha="right")
            ax.text(3.5, y - 2.4, "hot ▼", fontsize=9, color=RED_EDGE, ha="right")
        ax.text(30, 0.5, "hot = RIF above the Q_RIF quantile (≈ p84) of recent RIF values",
                ha="center", fontsize=9.5, color=MUTED)
    fig.tight_layout()
    save(fig, "hot-cold.png")


def pool_upkeep():
    """How probes leave the pool: age, reuse, and removing the oldest/worst on every query."""
    fig, ax = canvas(10, 4.6)
    box(ax, 30, 4, 40, 38, "", GREEN, GREEN_EDGE, lw=1.6, r=2)
    ax.text(50, 38, "probe pool (capacity 16)", ha="center", fontsize=11, weight="bold", color=INK)
    rows = [("RIF 1, 15 ms, age 40 ms", GREEN_EDGE), ("RIF 3, 10 ms, age 120 ms", GREEN_EDGE),
            ("RIF 4, 50 ms, age 300 ms", GREEN_EDGE), ("RIF 14, 90 ms, age 80 ms", RED_EDGE),
            ("RIF 20, 210 ms, age 900 ms", RED_EDGE)]
    for i, (t, ec) in enumerate(rows):
        box(ax, 33, 30 - i * 6, 34, 4.6, t, "white" if ec == GREEN_EDGE else RED, ec, 9.5, r=0.6, lw=1.2)
    box(ax, 2, 28, 18, 7, "new probe reply", GREEN_DARK, GREEN_EDGE, 9.5)
    arrow(ax, (20, 31.5), (32.5, 31.5), GREEN_EDGE)
    for y, t in [(33, "pool full?\ndrop the oldest"), (21, "used for a query\n(b_reuse times)"),
                 (11, "older than 1 s\n(timeout)"), (1, "every query: drop one,\nalternating oldest / worst")]:
        box(ax, 77, y, 22, 8, t, AMBER, AMBER_EDGE, 9)
        arrow(ax, (67.5, min(max(y + 4, 8), 34)), (76.5, y + 4), AMBER_EDGE)
    ax.text(15, 14, "stops the pool\nfilling up with stale\nor overloaded servers", ha="center", fontsize=10, color=MUTED)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 44)
    save(fig, "pool-upkeep.png")


if __name__ == "__main__":
    for f in [fleet, cpu_vs_rif, signals, probe_pool, hot_cold, pool_upkeep]:
        f()
    print("wrote", sorted(p.name for p in OUT.glob("*.png")))

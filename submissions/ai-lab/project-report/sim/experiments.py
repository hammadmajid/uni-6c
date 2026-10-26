"""Run every experiment in the report and draw its figures.

    python experiments.py          # about 10 minutes on 4 cores
    python experiments.py --plot   # redraw figures from results/results.json only

Writes results/results.json and figures/*.png.
"""

from concurrent.futures import ProcessPoolExecutor
import json
import pathlib
import sys

import numpy as np
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker

import prequal_sim as sim

HERE = pathlib.Path(__file__).parent
RESULTS, FIGURES = HERE / "results", HERE / "figures"
AGENTS = ["rr", "cpu", "p2c", "prequal"]
NAMES = {"rr": "Round-robin", "cpu": "Lowest-CPU", "p2c": "Power of two", "prequal": "Prequal"}
COLORS = {"rr": "#9b2226", "cpu": "#ca6702", "p2c": "#0a9396", "prequal": "#3a0ca3"}
LOADS = [0.5, 0.6, 0.7, 0.8, 0.85, 0.9]
SEEDS = [1, 2]
TIMEOUT_MS = 5000  # the paper's testbed gives up on a query after 5 s
QUANTILES = [50, 90, 99, 99.9]


def summarise(r):
    lat = r["latencies"]
    n = len(lat) + r["unfinished"]
    return {
        "agent": r["agent"], "load": r["load"],
        "quantiles": {str(q): float(np.percentile(lat, q)) for q in QUANTILES},
        "timeouts": float((np.sum(lat > TIMEOUT_MS) + r["unfinished"]) / n),
        "n": int(n),
    }


def job(spec):
    kind, agent, load, seed, kwargs = spec
    r = sim.run(agent, load=load, seed=seed, agent_kwargs=kwargs, trace=(kind == "trace"))
    out = summarise(r)
    out.update(kind=kind, seed=seed, kwargs=kwargs)
    if kind == "trace":
        out["rif_trace"] = r["rif_trace"].tolist()
        out["cdf"] = np.percentile(r["latencies"], np.linspace(0, 100, 401)).tolist()
    return out


def specs():
    for load in LOADS:
        for a in AGENTS:
            for seed in SEEDS:
                yield ("ramp", a, load, seed, {})
    for a in AGENTS:
        yield ("trace", a, 0.85, 1, {})
    for rate in [0.5, 1, 2, 3, 4, 6]:
        yield ("probe_rate", "prequal", 0.85, 1, {"probes_per_query": rate})
    for q in [0.0, 0.5, 0.7, 0.84, 0.95, 1.0]:
        yield ("q_rif", "prequal", 0.85, 1, {"q_rif": q})


def ramp_table(results):
    """Mean over seeds of each quantile, per agent and load."""
    table = {}
    for a in AGENTS:
        for load in LOADS:
            rows = [r for r in results if r["kind"] == "ramp" and r["agent"] == a and r["load"] == load]
            table[(a, load)] = {
                **{q: np.mean([r["quantiles"][q] for r in rows]) for q in map(str, QUANTILES)},
                "timeouts": np.mean([r["timeouts"] for r in rows]),
            }
    return table


def style(ax):
    if ax.get_yscale() == "log":
        ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:,.0f}"))
        ax.yaxis.set_minor_formatter(matplotlib.ticker.NullFormatter())
    if ax.get_xscale() == "log":
        ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda v, _: f"{v:,.0f}"))
    ax.spines[["top", "right"]].set_visible(False)
    ax.grid(True, which="major", color="#dddddd", linewidth=0.6)
    ax.set_axisbelow(True)


def plot(results):
    FIGURES.mkdir(exist_ok=True)
    plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "savefig.dpi": 220})
    table = ramp_table(results)

    # 1. Tail and median latency as load rises (the paper's load-ramp experiment, Fig. 6).
    fig, axes = plt.subplots(1, 2, figsize=(9, 3.6))
    for ax, q, title in [(axes[0], "50", "Median latency (p50)"), (axes[1], "99", "Tail latency (p99)")]:
        for a in AGENTS:
            ax.plot([l * 100 for l in LOADS], [table[(a, l)][q] for l in LOADS], "o-",
                    color=COLORS[a], label=NAMES[a], linewidth=2, markersize=4)
        if q == "99":
            ax.set_yscale("log")
        ax.set_xlabel("Load (% of fleet capacity)")
        ax.set_ylabel("Latency (ms, log scale)" if q == "99" else "Latency (ms)")
        ax.set_title(title, fontsize=11)
        style(ax)
    axes[0].legend(frameon=False, fontsize=9)
    fig.tight_layout()
    fig.savefig(FIGURES / "load-ramp.png")
    plt.close(fig)

    # 2. Share of requests that miss the 5 s deadline.
    fig, ax = plt.subplots(figsize=(4.6, 3.4))
    for a in AGENTS:
        ax.plot([l * 100 for l in LOADS], [table[(a, l)]["timeouts"] * 100 for l in LOADS], "o-",
                color=COLORS[a], label=NAMES[a], linewidth=2, markersize=4)
    ax.set_xlabel("Load (% of fleet capacity)")
    ax.set_ylabel("Requests over 5 s (%)")
    ax.legend(frameon=False, fontsize=9)
    style(ax)
    fig.tight_layout()
    fig.savefig(FIGURES / "timeouts.png")
    plt.close(fig)

    traces = {r["agent"]: r for r in results if r["kind"] == "trace"}

    # 3. Latency distribution at 85% load.
    fig, ax = plt.subplots(figsize=(5.6, 3.6))
    for a in AGENTS:
        cdf = traces[a]["cdf"]
        ax.plot(cdf, np.linspace(0, 100, len(cdf)), color=COLORS[a], label=NAMES[a], linewidth=2)
    ax.set_xscale("log")
    ax.set_xlim(1, None)
    ax.axhline(99, color="#888888", linestyle="--", linewidth=0.8)
    ax.text(1.2, 96, "p99", color="#666666", fontsize=8)
    ax.set_xlabel("Latency (ms, log scale)")
    ax.set_ylabel("Requests finished (%)")
    ax.set_title("Latency distribution at 85% load", fontsize=11)
    ax.legend(frameon=False, fontsize=9, loc="lower right")
    style(ax)
    fig.tight_layout()
    fig.savefig(FIGURES / "latency-cdf.png")
    plt.close(fig)

    # 4. Requests in flight on every server over time (the paper's RIF heatmap, Fig. 4).
    fig, axes = plt.subplots(2, 2, figsize=(9, 4.6), sharex=True, sharey=True)
    vmax = 60
    for ax, a in zip(axes.flat, AGENTS):
        rif = np.array(traces[a]["rif_trace"]).T  # servers x time
        im = ax.imshow(np.minimum(rif, vmax), aspect="auto", cmap="YlOrRd", vmin=0, vmax=vmax,
                       extent=[0, rif.shape[1] / 10, rif.shape[0], 0], interpolation="nearest")
        ax.set_title(NAMES[a], fontsize=10)
        ax.axvspan(0, 5, color="white", alpha=0.55, lw=0)
        ax.text(2.5, rif.shape[0] - 2, "warm-up\n(not counted)", ha="center", va="bottom", fontsize=7, color="#444444")
    for ax in axes[1]:
        ax.set_xlabel("Time (s)")
    for ax in axes[:, 0]:
        ax.set_ylabel("Server")
    fig.colorbar(im, ax=axes, label=f"Requests in flight (capped at {vmax})", shrink=0.9)
    fig.savefig(FIGURES / "rif-heatmap.png", bbox_inches="tight")
    plt.close(fig)

    # 5 and 6. Prequal's two knobs: probing rate (paper Fig. 8) and the hot threshold Q_RIF (Fig. 9).
    for kind, key, xlabel, fname in [
        ("probe_rate", "probes_per_query", "Probes per query", "probe-rate.png"),
        ("q_rif", "q_rif", "Hot threshold quantile Q_RIF", "q-rif.png"),
    ]:
        rows = sorted((r for r in results if r["kind"] == kind), key=lambda r: r["kwargs"][key])
        xs = [r["kwargs"][key] for r in rows]
        fig, ax = plt.subplots(figsize=(4.6, 3.4))
        for q, c in [("50", "#94a3b8"), ("90", "#6366f1"), ("99", "#3a0ca3")]:
            ax.plot(xs, [r["quantiles"][q] for r in rows], "o-", color=c, label=f"p{q}", linewidth=2, markersize=4)
        ax.set_yscale("log")
        ax.set_xlabel(xlabel)
        ax.set_ylabel("Latency (ms, log scale)")
        ax.set_title("Prequal at 85% load", fontsize=11)
        ax.legend(frameon=False, fontsize=9)
        style(ax)
        fig.tight_layout()
        fig.savefig(FIGURES / fname)
        plt.close(fig)


def print_table(results):
    table = ramp_table(results)
    print(f"{'agent':<14}{'load':>6}{'p50':>9}{'p90':>9}{'p99':>9}{'p99.9':>9}{'>5s':>8}")
    for a in AGENTS:
        for load in LOADS:
            t = table[(a, load)]
            print(f"{NAMES[a]:<14}{load:>6.2f}{t['50']:>9.0f}{t['90']:>9.0f}{t['99']:>9.0f}"
                  f"{t['99.9']:>9.0f}{t['timeouts'] * 100:>7.2f}%")
    for kind, key in [("probe_rate", "probes_per_query"), ("q_rif", "q_rif")]:
        for r in sorted((r for r in results if r["kind"] == kind), key=lambda r: r["kwargs"][key]):
            q = r["quantiles"]
            print(f"{kind} {r['kwargs'][key]:>5}: p50 {q['50']:.0f}  p90 {q['90']:.0f}  p99 {q['99']:.0f}")


if __name__ == "__main__":
    RESULTS.mkdir(exist_ok=True)
    path = RESULTS / "results.json"
    if "--plot" in sys.argv:
        results = json.loads(path.read_text())
    else:
        jobs = sorted(specs(), key=lambda s: -s[2])  # heaviest loads first, they run longest
        with ProcessPoolExecutor() as ex:
            results = list(ex.map(job, jobs))
        path.write_text(json.dumps(results))
    plot(results)
    print_table(results)

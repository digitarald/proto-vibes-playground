# AI Model Garden Weights Training Studio — Design Doc

> **Status:** Early prototype · **Last updated:** 2026-06-30

---

## Problem

Model builders need a fast way to compare multiple candidate models, tune weighting strategies, and decide when to launch or adjust a training run without jumping between separate configuration, telemetry, and scheduling surfaces.

## Solution

The prototype presents a VS Code-style three-panel studio: a model garden list for quick candidate selection, a dedicated training weights panel with live sliders and auto-tune control, and a telemetry panel showing run health, cost, and upcoming checkpoints.

---

## Open Questions

1. Should weight controls support per-layer presets in addition to global percentages?
2. Is run telemetry more useful as compact cards or a continuous chart timeline?
3. Should queued optimization actions allow manual reprioritization during active training?

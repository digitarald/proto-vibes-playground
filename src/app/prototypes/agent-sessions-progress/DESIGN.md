# Agent Sessions Progress — Design Doc

> **Status:** Early prototype · **Last updated:** 2026-06-26

---

## Problem

The Agents window sessions sidebar lists agent sessions grouped by time (Today / Yesterday /
Last 7 Days), each showing a title, repo, diff stats, and a relative timestamp. There's no
at-a-glance signal for *how far along* an actively-running session is — you must open a
session to learn whether it's nearly done, just started, or stalled waiting on input. That
makes triaging a list of parallel agent runs slow.

## Solution

Add a hairline progress bar under each **active** session row that visualizes live agent task
completion. Running sessions show an accent-filled bar with a subtle shimmer and a live `%`
in the meta line. Sessions blocked on a decision turn the bar amber and pause it (pairing
with the "Input needed" pill). Completed sessions collapse the bar into a quiet check so the
list stays calm, and idle/past sessions show no bar at all. The bar reads as ambient
telemetry — true to the 2026 "stealth" aesthetic — rather than a chunky control.

---

## Open Questions

1. Should input-needed sessions surface a count of pending decisions, or stay binary?
2. Does a completed session need any lingering "fresh" affordance, or collapse immediately?
3. Should the bar also encode pace/ETA (e.g. a trailing ghost), or just raw completion?

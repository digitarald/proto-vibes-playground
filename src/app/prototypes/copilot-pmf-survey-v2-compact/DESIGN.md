# Copilot PMF Survey v2 — Compact — Design Doc

> **Status:** Early prototype · **Last updated:** 2026-06-18

---

## Problem

The v1 survey uses natural-language options that are descriptive but long. This variant tests whether shorter labels (≤4 words each) improve scan speed and completion rates without losing signal quality.

## Solution

Same layout and interaction patterns as v1 but with:

- **Reduced option count** — 7 helped-with options (dropped "Planning an implementation"), 8 blockers (merged pricing into fewer items)
- **Shortened labels** — Every option is ≤4 words (e.g., "Getting unstuck" instead of "Getting unstuck on bugs, errors, or unfamiliar code")
- Hypothesis: shorter labels → faster scanning → higher completion, with minimal loss of response precision

---

## Open Questions

1. Do shortened labels lose too much specificity? Would users interpret "Hard to trust" differently than "Output is wrong, incomplete, or hard to trust"?
2. Should we add tooltips on hover to show the full description?
3. Is the reduced set missing critical options that would bias results?

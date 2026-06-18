# Copilot PMF Survey — Design Doc

> **Status:** Early prototype · **Last updated:** 2026-06-18

---

## Problem

The current in-product Copilot PMF survey is a standard static form — radio buttons, dropdowns, and a submit button all visible at once. It looks like a web form, not a VS Code experience. Low engagement is expected because it doesn't feel native, the cognitive load is high (all questions visible), and dropdowns require extra clicks. We also want to avoid open-ended text fields to keep the data structured.

## Solution

A **single-page survey inside an editor tab** — all three questions visible at once, no wizard steps or pagination. Wrapped in a mock VS Code editor tab chrome for realistic screenshots.

### Questions

1. **PMF disappointment** — 5-point Likert scale as a connected segmented control ("Not at all" → "Extremely"). Single select.
2. **Helped with most recently** — 8 natural-language options covering key use cases (writing code faster, getting unstuck, multi-file edits, automation, codebase navigation, planning, code review). Single select with radio indicators. Responsively expands to 2-column grid.
3. **What gets in the way** — 9 blocker options (trust, context, multi-step, overhead, speed, setup, security, pricing, nothing major). Multi-select with checkbox indicators. Same responsive 2-column grid.

### Design choices

- **No open-ended questions** — all structured responses for clean PMF data
- **No frequency question** — can be derived from telemetry
- **Responsive option grids** — long-text options flow into 2 columns at ≥520px
- **Editor tab wrapper** — mock tab bar with inactive `index.ts` tab and active survey tab for realistic context

---

## Open Questions

1. Should the survey appear as a modal dialog, a notification toast, or an editor tab (like the current implementation)?
2. Should we add a "skip" affordance per question, or keep it required to maintain data quality?
3. Can the Likert scale be simplified to 3-point (not disappointed / somewhat / very) to reduce decision fatigue?
4. Should we cap blocker selections (e.g., "pick up to 3") to force prioritization?

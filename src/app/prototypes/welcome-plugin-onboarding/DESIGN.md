# Welcome — Plugin Onboarding — Design Doc

> **Status:** Early prototype · **Last updated:** 2026-07-08

---

## Problem

New VS Code users land in an empty editor with no clear first move. The
extension marketplace is powerful but overwhelming — thousands of options, no
guidance on what a person building _their_ kind of software actually needs. The
first-run experience should turn that blank slate into momentum: help someone
get a relevant, working toolset installed in under a minute, without decision
paralysis.

## Solution

A Welcome editor tab that runs a three-step, guided onboarding:

1. **Focus** — the user picks what they're building (Frontend, Backend, AI, or
   DevOps). This is a single low-stakes choice that curates everything after it.
2. **Extensions** — a curated shortlist filtered to that focus, with the
   essentials pre-selected. The user can toggle any item, then installs them all
   at once. Each install animates through queued → installing (progress bar) →
   installed, so the batch feels alive and trustworthy rather than instant/fake.
3. **Done** — a celebratory summary and three concrete next actions (open a
   folder, ask Copilot, tune settings) so momentum carries past onboarding.

A persistent stepper anchors the flow, and the surface is framed inside a real
editor tab strip so it reads as an actual VS Code Welcome tab, not a mockup.

---

## Validated Patterns

- **Pre-selection over blank choice** — defaulting the essentials to "checked"
  removes decision paralysis while still leaving the user in control.
- **Batch install with staggered progress** — installing sequentially with a
  per-item progress bar communicates real work and makes the moment feel
  earned, versus an instant "all installed" flip.
- **Focus-first curation** — one upfront choice keeps every later screen short
  and relevant instead of showing the full marketplace.

## Open Questions

1. Should the focus choice allow multiple selections (e.g. someone who is both
   frontend and AI), and how does that affect the curated list length?
2. Is a skip/"I'll do this later" affordance needed, or does forcing one focus
   choice produce better activation?
3. How should already-installed extensions surface if the user re-runs
   onboarding — hidden, or shown as "installed" and skipped?

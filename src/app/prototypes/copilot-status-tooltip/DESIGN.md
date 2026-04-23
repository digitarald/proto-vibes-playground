# Copilot Status Tooltip — Design Doc

> **Status:** Early prototype · **Last updated:** 2026-04-23

---

## Problem

Users on Copilot Free need quick access to their key settings — file scope, next-edit suggestions, eagerness — without navigating to full Settings. The status bar Copilot icon already exists; this tooltip popup gives it a lightweight, glanceable control surface.

## Design

A floating tooltip anchored above the status bar Copilot icon.

### Key surfaces

| Surface | Purpose |
|---|---|
| **Header** | "Copilot Free" plan label + gear icon to open full settings. |
| **Tab bar** | "Usage" and "Quick Settings" tabs. |
| **Toggle rows** | Checkbox toggles for "All files" and "Next edit suggestions". |
| **Eagerness** | Label + current value ("Auto") — tappable to cycle or open picker. |
| **Snooze** | Button to temporarily hide suggestions for 5 minutes. |
| **Status bar** | Grounding context — shows the Copilot icon, accounts, notifications. |

## Open questions

- Should "Eagerness" be a dropdown, a slider, or a cycle button?
- Does "Snooze" duration need to be configurable (1/5/15 min)?
- Should "Usage" tab show a progress bar toward monthly limits?

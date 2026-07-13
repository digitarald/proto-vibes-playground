# Auto Approval - Design Doc

> **Status:** Early prototype
> **Last updated:** 2026-07-13

---

## Problem

Approval controls need to communicate three meaningfully different levels of autonomy without making the chat input feel complicated or hiding the risk tradeoff.

## Solution

Keep approval mode as a compact chat input control. Its menu lists Default Approval, Auto Approval, and Bypass Approval in increasing order of autonomy. Parallel descriptions explain how each mode handles tool calls not covered by the user's approval settings, without implying that the selected chat model performs the risk assessment.

---

## Open Questions

1. Is "Auto Approval" distinct enough from "Bypass Approval" at a glance?
2. Should changing to Bypass require an extra confirmation?
3. Does the risk-based description build appropriate trust without overstating the model's judgment?

# Sandbox Section: Outcome First - Design Doc

> **Status:** Early prototype
> **Last updated:** 2026-09-01

---

## Problem

Sandbox settings describe intent, but automatic grants and managed policy determine the actual result. A persistent side inspector made both the configuration and policy too narrow at realistic Customizations editor widths.

## Solution

Use an outcome-first single column. A compact Effective policy summary appears above the configuration and expands in place to show every policy source. Configuration keeps the full editor width, and custom path rules support inline add, edit, access changes, and removal.

---

## Open Questions

1. Is the policy inspector valuable enough to justify the reduced width for configuration?
2. Should selecting a setting highlight the affected policy entries?
3. Does the inspector need a compact and expanded mode?

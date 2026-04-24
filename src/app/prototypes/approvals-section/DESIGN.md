# Approvals Section — Design Doc

> **Status:** Early prototype · **Last updated:** 2025-04-24

---

## Problem

Tool, server, and URL approvals in VS Code are currently managed through a transient QuickTree dialog — hard to discover, impossible to scan at a glance, and disconnected from the rest of AI customization management. Users who've approved tools across workspaces and profiles have no persistent view to audit, toggle, or revoke those permissions.

## Solution

Add an "Approvals" section to the Agent Customizations editor sidebar, matching the existing patterns for Agents, Skills, MCP Servers, and Plugins. The section surfaces all tool (pre/post-execution), server, and URL approvals in a flat list grouped by scope (Workspace / User). Each row shows the approval name, source, kind badge, a checkbox to toggle, and a trash button to remove — fully editable inline with no secondary dialogs.

---

## Structure

| Zone | Content |
|------|---------|
| Sidebar entry | Shield icon, "Approvals" label, count badge |
| Content header | Back arrow, search input |
| Group headers | "Workspace" / "User" with item count |
| Approval row | Checkbox · Source icon · Name (mono) + description · Kind badge · Trash (on hover) |
| Footer | Description text + "Learn more" link |
| Empty state | Shield icon + guidance text |

### Approval kinds

| Kind | Description shown | Source |
|------|-------------------|--------|
| `tool-pre` | "Run without asking" | Confirmation service |
| `tool-post` | "Continue without reviewing results" | Confirmation service |
| `server-pre` | "Start server without asking" | Confirmation service |
| `server-post` | (future) | Confirmation service |
| `url` | "Fetch URL without asking" | Configuration service |

## Open Questions

1. Should URL approvals be visually distinct from tool/server approvals (different grouping or icon treatment)?
2. Is a "select all / deselect all" toggle useful at the group header level?
3. Should removing an approval require a confirmation, or is undo sufficient?
4. How to handle the case where the same tool is approved at both workspace and user scope — show both, or merge with scope indicator?

## Out of Scope

- Combination approvals (tool + specific parameters)
- Session-scope approvals (ephemeral, lost on restart)
- Nested sub-groups by source server/extension
- Replacing the existing quick pick dialog (kept as alternative entry point)

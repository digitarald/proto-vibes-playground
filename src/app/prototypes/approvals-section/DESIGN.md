# Approvals Section — Design Doc

> **Status:** Iterating · **Last updated:** 2026-04-24

---

## Problem

Tool, server, and URL approvals in VS Code are currently managed through a transient Quick Pick dialog — hard to discover, impossible to scan at a glance, and disconnected from the rest of AI customization management. Users who've approved tools across workspaces and profiles have no persistent view to audit, toggle, or revoke those permissions.

## Solution

Add an "Approvals" section to the Agent Customizations editor sidebar. The section surfaces all tool, server, URL, and path approvals in a two-level tree: **Scope** (Workspace / User) → **Source** (MCP server, extension, built-in tools, URLs, folders). Each source has a bulk state toggle and an Add button; each entry has its own tri-state toggle (Allow / Ask / Deny) and a remove button. Everything is editable inline — no secondary dialogs.

---

## Structure

| Zone | Content |
|------|---------|
| Sidebar entry | Shield icon, "Approvals" label, count badge |
| Content header | Back arrow, search/filter input, "Add Rule" button |
| Scope headers | "WORKSPACE" / "USER" uppercase label + source count |
| Source row | Chevron · Icon · Label · Summary text · [+] Add (hover) · Bulk state toggle (compact) |
| Entry row | Mono label · State toggle (Allow/Ask/Deny) · Trash (hover) |
| Footer | Description text + "Learn more" link |
| Empty state | Shield icon + guidance text |

### Source kinds

| Kind | Icon | Example sources |
|------|------|----------------|
| `mcp` | `server` | GitHub MCP Server, Perplexity AI, WorkIQ |
| `extension` | `extensions` | Pylance Language Server, Browser Tools |
| `builtin` | `tools` | Built-in Tools (18 tools) |
| `url` | `globe` | Allowed URLs (glob patterns) |
| `path` | `folder` | Folder Access (workspace paths) |

### Tri-state model

Each entry and each source has the same three states:

| State | Label | Color | Icon | Meaning |
|-------|-------|-------|------|---------|
| `allow` | Allow | Green | `pass-filled` | Runs without confirmation |
| `ask` | Ask | Neutral | `question` | Prompts before running (default) |
| `deny` | Deny | Red | `circle-slash` | Blocked from running |

The bulk toggle on a source header applies to **all tools in that source** — individual entry overrides take precedence for display.

## Validated Patterns

1. **Scope → Source two-level tree**
   - ✅ Scope first (Workspace / User), then sources underneath
   - ❌ Flat list with kind badges (V1) — too noisy, no grouping context
   - ❌ Source-first without scope headers (V4, copied from Quick Pick) — lost the nice hierarchy
   - Why: Users think in terms of "what did I set up for this workspace" vs "my global defaults." The scope-first tree makes this immediately scannable.

2. **Tri-state toggle buttons on every entry**
   - ✅ Small bordered pill button with icon + text (Allow / Ask / Deny), clicking cycles
   - ❌ Checkboxes (V1) — binary, can't express "deny"
   - ❌ Mode cycling text labels (V5, "without approval" / "Approves responses") — confusing wording, not visually actionable
   - Why: Users need to see and change the state at a glance. A color-coded button is immediately scannable and clickable. "Allow / Ask / Deny" are universally understood.

3. **Compact bulk toggle on source headers**
   - ✅ Icon-only compact variant of the same tri-state toggle
   - ❌ No source-level control (V1) — had to configure every tool individually
   - Why: "Allow all tools from Perplexity" is the most common action. The compact toggle keeps source rows dense while providing the escape hatch.

4. **Add button on every source**
   - ✅ [+] button on hover for every source header
   - ❌ Only on URL/path sources (V5) — inconsistent, MCP tools also need individual overrides
   - Why: All source types benefit from adding individual rules. MCP servers have many tools; users want to allow specific ones without bulk-allowing everything.

5. **Clean entry rows — label + toggle + remove**
   - ✅ Mono-font label, state toggle, trash on hover — three elements only
   - ❌ Subtext/descriptions per entry (V1–V4) — too noisy for a dense list
   - ❌ Pre/post mode labels (V5) — "Approves responses" / "without reviewing result" was confusing
   - Why: Entry rows should be scannable. The state toggle is the primary interaction; everything else is noise. Tool names are self-descriptive in mono font.

## Open Questions

1. Should the bulk toggle propagate to individual entries (cascade), or just set a fallback that entries can override?
2. Is the pre/post distinction (approve running vs. approve reviewing output) needed in this view, or should it be an advanced setting elsewhere?
3. Should "Deny" be available at entry level, or only at source level? (Denying a single tool is unusual.)
4. How to handle conflicts when the same tool appears in both Workspace and User scope?
5. Should the Add button open a filtered Quick Pick, or an inline text input?

## Out of Scope

- Pre/post execution distinction (may revisit as advanced toggle)
- Combination approvals (tool + specific parameters)
- Session-scope approvals (ephemeral, lost on restart)
- Replacing the existing Quick Pick dialog (kept as alternative entry point)
- Drag-and-drop reordering of entries

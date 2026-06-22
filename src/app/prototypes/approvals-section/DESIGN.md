# Approvals Section — Design Doc

> **Status:** Iterating · **Last updated:** 2026-05-04

---

## Problem

Tool, server, and URL approvals in VS Code are currently managed through a transient Quick Pick dialog — hard to discover, impossible to scan at a glance, and disconnected from the rest of AI customization management. Users who've approved tools across workspaces and profiles have no persistent view to audit, toggle, or revoke those permissions.

## Solution

Add an "Approvals" section to the Agent Customizations editor sidebar. The section surfaces all tool, server, URL, and path approvals in a two-level tree: **Scope** (Workspace / User) → **Source** (MCP server, extension, built-in tools, URLs, folders). Each source has a bulk "Allow All" action and an Add button; each entry has a clickable allow/deny icon and a remove button. Everything is editable inline — no secondary dialogs.

---

## Structure

| Zone | Content |
|------|---------|
| Sidebar entry | Shield icon, "Approvals" label, count badge |
| Content header | Back arrow, search/filter input, "Add Rule" button |
| Scope headers | "WORKSPACE" / "USER" uppercase label + source count |
| Source row | Chevron · Icon · Label · Summary text · [+] Add (hover) · "Allow All" button (tool sources only) |
| Entry row | Allow/Deny icon (clickable) · Mono label · Trash (hover) |
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

### Binary model

Each entry is either **allowed** or **denied** — matching the underlying VS Code settings model (`true`/`false`):

| State | Color | Icon | Meaning |
|-------|-------|------|---------|
| Allowed | Green | `pass-filled` | Runs without confirmation |
| Denied | Red | `circle-slash` | Blocked from running |

Clicking the icon toggles between states. No tri-state — the "ask" default lives outside this view (anything not in the approvals list prompts by default).

Source-level "Allow All" sets bulk trust for the entire source. A green badge on the source header indicates active bulk-allow.

### Summary text

Source headers show a scannable summary with `·` separator:

- `3 of 12 allowed · 1 denied` — mixed state with total tools context
- `All 4 tools` — bulk allow active
- `2 allowed · 1 denied` — URLs/paths (no total count)
- `No rules` — source with no entries yet

## Validated Patterns

1. **Scope → Source two-level tree**
   - ✅ Scope first (Workspace / User), then sources underneath
   - ❌ Flat list with kind badges (V1) — too noisy, no grouping context
   - ❌ Source-first without scope headers (V3) — lost the nice hierarchy
   - Why: Users think in terms of "what did I set up for this workspace" vs "my global defaults." The scope-first tree makes this immediately scannable.

2. **Binary allow/deny icons per entry**
   - ✅ Green check / red slash icon, clickable to toggle — one element, instant comprehension
   - ❌ Tri-state toggle buttons (V2–V6) — "Ask" state is redundant (anything not listed already asks)
   - ❌ Checkboxes (V1) — binary but wrong affordance for allow/deny semantics
   - ❌ Mode cycling text labels (V5) — confusing wording, not visually actionable
   - Why: The real settings model is binary (`true`/`false`). Adding a third state created confusion about what "Ask" means vs. simply not having a rule. The icon approach is denser and faster to scan than pill buttons.

3. **"Allow All" button on source headers (tool sources only)**
   - ✅ Text button "Allow All" / "All Allowed" with pass icon, only on MCP/extension/builtin sources
   - ❌ Compact tri-state toggle on every source (V2–V6) — over-engineered for URLs/paths
   - ❌ No source-level control (V1) — had to configure every tool individually
   - Why: "Allow all tools from Perplexity" is the most common action. URLs and paths don't have a tool count, so bulk-allow doesn't apply there.

4. **Add button on every source**
   - ✅ [+] button on hover for every source header
   - ❌ Only on URL/path sources (V5) — inconsistent, MCP tools also need individual overrides
   - Why: All source types benefit from adding individual rules. MCP servers have many tools; users want to allow specific ones without bulk-allowing everything.

5. **Clean entry rows — icon + label + remove**
   - ✅ Allow/deny icon, mono-font label, trash on hover — three elements only
   - ❌ Subtext/descriptions per entry (V1–V4) — too noisy for a dense list
   - Why: Entry rows should be scannable. The icon is the primary interaction; everything else is noise. Tool names are self-descriptive in mono font.

6. **Hooks-style spacing for scannability**
   - ✅ 40px source headers, 36px entry rows, 4px group gaps — generous vertical rhythm
   - ❌ Dense 28–32px rows (V1–V7 initial) — felt cramped, harder to click
   - Why: Matches the hooks section's spacing. Taller rows are easier to scan vertically and hit targets on laptops. The extra whitespace groups sources visually without needing separators.

7. **"X of Y allowed" summary format**
   - ✅ `3 of 12 allowed · 1 denied` — fraction gives instant context, `·` separator is lighter than commas
   - ❌ `3 allowed, 1 denied, of 12` (V7 initial) — reads awkwardly, "of 12" dangled at end
   - Why: Putting the fraction first ("3 of 12") answers the most common question: "how much of this source have I configured?" The dot separator is standard VS Code style for inline metadata.

## Open Questions

1. How to handle conflicts when the same tool appears in both Workspace and User scope?
2. Should the Add button open a filtered Quick Pick, or an inline text input?
3. Should frequency hints ("Asked 12× recently") appear in the entry row to surface tools that need attention?
4. Right-click context menu for "Move to Workspace" / "Move to User" — needed?

## Out of Scope

- Pre/post execution distinction (not in current settings model)
- Combination approvals (tool + specific parameters)
- Session-scope approvals (ephemeral, lost on restart)
- Replacing the existing Quick Pick dialog (kept as alternative entry point)
- Drag-and-drop reordering of entries
- Tri-state "Ask" — not in settings model, the absence of a rule is "ask"

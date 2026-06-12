# Plugin Metadata Variations — Design Doc

> **Status:** Iterating
> **Last updated:** 2026-06-11

---

## Problem

The **Agent Customizations → Plugins** surface renders published plugins using only the
flat core fields they ship today (`name`, `description`, `author`, `version`). With a
kebab-case `name` as the title and no icon, the list reads as a column of slugs
(`workiq`, `microsoft-365-agents-toolkit`, `fabric-skills`…) rather than a browsable
catalog. Issue [#7961] asks: if publishers ship a small set of richer presentation
metadata, how should the customization UI use it?

## Solution

Render the real Plugins dialog and let a reviewer flip between **three treatments** of
the *same* enriched dataset via a floating switcher. The dataset models the fields from
#7961 — `displayName`, `icon`, `brandColor`, `category`, `shortDescription`, `contents`
(skills / MCP servers / agents / hooks), `defaultPrompt` — plus core fields rendered well
(publisher/author, version, license, marketplace). Every optional field degrades
gracefully; one sample plugin ships core-only to prove the fallback path.

---

## Structure

A faithful "Agent Customizations for Local" dialog: title bar + left nav rail with
**Plugins** active. The content area splits into a **Configured plugins** section
(installed plugins) on top and a **catalog** below, then swaps between three variations:

| Variation | Intent | Key metadata showcased |
|---|---|---|
| **A — Enriched List** | Lowest-effort P0 win; closest to today's UI | brand logo, `displayName`, verified publisher, `shortDescription` |
| **B — Catalog Grid** | The "browsable catalog" end state | brand logos, `category` section headers + filter chips, two-column cards |
| **C — Detail View** | Informed install decision + activation | tight hero (logo, title, verified-author · category, tagline, enable toggle + Uninstall), labeled facts strip (version/license/publisher/marketplace), **"what this plugin adds" contents** (Skills / MCP servers / Agents / Hooks as bare count-badged chip groups), `defaultPrompt` starter chips |

**Real brand logos** come from Google's favicon service
(`google.com/s2/favicons?domain={domain}&sz=128`) rendered on a rounded light "app icon"
tile; a slug monogram is the fallback. **Verified publisher** is the *author* name + a
blue `verified-filled` check (VS Code style). The **Configured
section** mirrors the GitHub Copilot MCP Servers surface: full-width rows with hover
manage actions (gear/trash), and an **enable/disable toggle** as the single state control.
The detail view does *not* show an abstract permissions panel; instead it lists the
plugin's **contents** — the concrete skills, MCP servers, agents, and hooks it bundles —
so installing reads as "you're adding these N things." Two distinct identity facts: the
**publisher** is who authored the plugin; the **marketplace** is the repo (e.g.
`github/awesome-copilot`) whose `marketplace.json` distributes it.

## Validated Patterns

1. **Real brand logos read as a "real" catalog**
   - ✅ Google favicon service per `domain` — reliable full-color logos, no asset hosting
   - ❌ Simple Icons CDN — drops trademarked logos (Slack, Azure, OpenAI all 404)
   - ❌ `brandColor`-tinted codicon tiles (iteration 1) — felt generic, "AI placeholder"
   - *Why:* recognizable logos are the single biggest "list of slugs → catalog" jump. The `icon` field in #7961 should resolve to a real asset, with a domain/favicon convention as a pragmatic source.

2. **Verified publisher, not a byline of repos**
   - ✅ Publisher name + blue `verified-filled` check; trust signal in one glance
   - ❌ Repeated `by github/...` byline + inline repo link (iteration 1) — noisy, low value in a list
   - *Why:* at browse time users care "is this from a trusted source?", not the exact repo. Publisher ≠ source repo. Repo link moves to the detail page.

3. **Calm catalog: defer detail to the detail view**
   - ✅ List/grid rows show only logo, title, publisher, short description
   - ❌ Inline capability chips + category pill + version + slug on every row (iteration 1) — "MANY badges", too busy
   - *Why:* metadata beyond identity is decision-relevant at *install/configure* time, not while scanning. Concentrating it in the detail view keeps the list scannable.

4. **Configured rows with one toggle as the source of truth**
   - ✅ Installed plugins get a dedicated "Configured" section: full rows, hover manage actions (gear/trash), and a single enable/disable **toggle**
   - ❌ Compact installed-logo strip (iteration 2) — a too-close copy of another app's surface, and it hid management affordances
   - ❌ A status check icon *next to* the toggle (iteration 3) — redundant; two controls implying the same on/off state
   - *Why:* managing installed plugins (enable, disable, remove) is a distinct task from browsing. One toggle communicates state *and* lets you change it; a separate status glyph just adds noise.

5. **Graceful degradation as a first-class case**
   - ✅ Missing logo → slug monogram tile; missing `displayName` → slug as title; missing contents → section omitted; unverified → no check
   - *Why:* most published plugins won't ship the new fields on day one. A core-only sample (`legacy-repo-linter`) keeps the degraded path honest.

6. **Show contents, not abstract permissions**
   - ✅ Detail view lists the concrete things a plugin bundles — Skills (slash commands), MCP servers, Agents, Hooks — each as a titled section with a count badge + capped pill chips ("+N more")
   - ❌ A "Permissions" panel with Read/Write/Interactive capability rows + a "plugins can run code" caution (iteration 3) — abstract, scary, and low-information
   - ❌ A one-line muted description under each section header ("5 slash commands the agent can run.") (iteration 5 first pass) — redundant with the label + count, just added noise
   - *Why:* "you're adding these 8 skills and 1 MCP server" is concrete and reviewable; "this plugin can Write" is vague. The label + count badge already says everything the description did, so the chips carry the detail. Slash-command-style skill names mirror how users invoke them.

7. **Detail header: tight identity block + a labeled facts strip**
   - ✅ Hero groups identity only — logo, title, verified-author · category byline, a one-line tagline, and the actions (enable toggle + a secondary **Uninstall** for installed plugins, or **Add plugin** otherwise) — then a separate **facts strip** with labeled Version / License / Publisher / Marketplace cells
   - ❌ Title, then a muted dot-separated `v1.2 · MIT · Design · Repository` breadcrumb, then description as three unrelated stacked rows (iteration 4 first pass) — read as disorganized
   - ❌ Calling the source link "Repository" (iteration 4) — it's actually the *marketplace* (`marketplace.json` repo) that distributes the plugin, distinct from the author
   - *Why:* the VS Code extension view earns its clarity by separating *identity* (icon, name, byline, actions) from *metadata facts* (a structured Installation panel). Borrowing that split — but as a single inline labeled strip rather than a boxed right sidebar — keeps the dialog's one-column flow while giving each fact a label instead of a guess-the-meaning dot list. Destructive actions (Uninstall) get a secondary, low-emphasis button that warms to a danger tint only on hover.

## Scenario / Demo Flow

Dataset: ~14 recognizable connector-style plugins (GitHub, Azure, Microsoft 365, Figma,
Slack, Notion, Linear, Sentry, Stripe, Jira, Datadog, Google Drive, PostgreSQL) chosen
so real brand logos render, across categories Development, Cloud, Productivity, Design,
Communication, Data & Analytics, Sales & Finance. Six ship as already-configured (with
live toggles); `legacy-repo-linter` is core-only to exercise the fallback path.

```
List ──(click row)──► Detail ◄──(click card)── Grid
  ▲                      │
  └──────(Back)──────────┘
Switcher (bottom): Enriched List · Catalog Grid · Detail View
```

## Open Questions

1. Should `category` be a controlled vocabulary (so grouping is stable across publishers) or free-form? Free-form risks near-duplicate buckets.
2. Now that the detail view lists **contents** (skills, MCP servers, agents, hooks) instead of capability levels, is a separate trust/permission signal still needed, or do the concrete contents carry enough of that weight on their own?
3. Do `defaultPrompt` starter chips belong only on the detail page, or should the top one preview in list/grid rows to drive activation earlier?
4. What is the real source of the `icon`? The prototype uses favicons for fidelity, but shipping plugins need a stable convention (bundled `assets/` per the spec, a publisher domain, or a registry-hosted URL).
5. Should "verified" be publisher-level (one badge per trusted org) or per-plugin? And what earns it?

## Out of Scope

- Real install behavior (the toggle state is local only; manage actions are visual)
- Brand logos depend on Google's favicon service at runtime (prototype-only shortcut)
- Search ranking and `keywords` weighting (search is a simple substring match)
- The other customization tabs (Agents, Skills, Hooks, MCP Servers, etc.)
- Light theme, screenshots/`longDescription` gallery, privacy/ToS links
- Spec-governance decision (core promotion vs. namespaced extension field)

[#7961]: https://github.com/microsoft/vscode-internalbacklog/issues/7961

---
name: new-prototype
description: "Bootstrap a new prototype in the playground. Use when the user wants to create, add, scaffold, copy, or make a variant of a prototype page."
---

# Bootstrap a New Prototype

Create a new prototype folder under `src/app/prototypes/` with all required files so the user can immediately start building.

## Inputs

Derive these from the user's request — infer sensible defaults for anything not stated:

| Field | Source | Default |
|---|---|---|
| **slug** | Kebab-case from the title or topic (see **Variant Naming** below) | — |
| **title** | User's description of the prototype | Titlecase of slug |
| **description** | One-sentence summary of what it does | Generic placeholder based on title |
| **author** | User's name if known | `"Team"` |
| **tags** | 2-4 lowercase keywords from the description | `["prototype"]` |
| **createdAt** | Today's date | `YYYY-MM-DD` |
| **interactive** | Whether the prototype needs client-side state | Infer from description |

## Procedure

### 0. Detect variant vs. new prototype

If the user asks to "copy", "fork", "make a variant of", or "iterate on" an existing prototype, this is a **variant**, not a fresh prototype.

**Variant naming convention:** `<original-slug>-v<N>-<descriptor>`

- `<original-slug>` — the slug of the prototype being forked (e.g. `approvals-section`)
- `<N>` — next available version number. Scan existing folders matching `<original-slug>-v*` to find the highest N, then increment. If none exist, use `v2` (the original is implicitly v1).
- `<descriptor>` — short kebab-case word(s) describing what this variant does differently (e.g. `separated`, `inline-toggles`, `flat-list`)

Examples:
- First variant of `approvals-section` → `approvals-section-v2-separated`
- Second variant → `approvals-section-v3-inline-toggles`
- Variant of `copilot-status-tooltip` → `copilot-status-tooltip-v2-compact`

For variants, copy `page.tsx` and `page.module.css` from the source prototype as the starting point, then apply the requested changes.

### 1. Create the folder

```
src/app/prototypes/<slug>/
```

### 2. Create `meta.json`

```json
{
  "title": "<title>",
  "description": "<description>",
  "author": "<author>",
  "tags": ["<tag1>", "<tag2>"],
  "createdAt": "<YYYY-MM-DD>"
}
```

### 3. Create `page.tsx`

If the prototype is **interactive** (needs state, event handlers), add `"use client";` at the top.

Use CSS Modules with VS Code 2026 design tokens from `globals.css` — load the `design-system` skill for the full palette and patterns.

Create a co-located `page.module.css` with styles using CSS custom properties:

```tsx
// page.tsx
import styles from './page.module.css';

export default function MyPrototypePage() {
  return (
    <div className={styles.wrapper}>
      ...
    </div>
  );
}
```

```css
/* page.module.css */
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: var(--radius-lg);
}

.card:hover {
  border-color: color-mix(in srgb, var(--accent) 30%, transparent);
  box-shadow: var(--shadow-md);
}
```

For VS Code icons, use the shared `Codicon` component — see the `design-system` skill for usage and icon reference.

### 4. Create `DESIGN.md`

Bootstrap a starter design doc so the team has a place to capture learnings from the first iteration. Load the `design-doc` skill for the full structure reference.

```markdown
# <Title> — Design Doc

> **Status:** Early prototype · **Last updated:** <YYYY-MM-DD>

---

## Problem

<One paragraph describing what user problem or design question this prototype explores.>

## Solution

<One paragraph describing the UX approach — what the user sees and does, not how it's built.>

---

## Open Questions

1. <First open question for the next iteration>
```

Keep it minimal — sections like **Validated Patterns**, **Structure**, and **Scenario** get added as the prototype evolves.

### 5. Create `layout.tsx`

Add a layout file that exports Open Graph metadata so the prototype gets a nice title and description when shared as a link in Slack or social media.

```tsx
import { prototypeMetadata } from "../prototype-metadata";
import meta from "./meta.json";

export const metadata = prototypeMetadata(meta);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
```

### 6. Ensure the dev server is running

Check if the `dev` task is already running. If not, start it using `run_task` with the `shell: dev` task. Wait for it to be ready before proceeding.

### 7. Open in integrated browser

Open the prototype page at `http://localhost:3000/prototypes/<slug>` in the integrated browser so the user can see it immediately.

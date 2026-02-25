---
name: new-prototype
description: "Bootstrap a new prototype in the playground. Use when the user wants to create, add, or scaffold a new prototype page."
---

# Bootstrap a New Prototype

Create a new prototype folder under `src/app/prototypes/` with all required files so the user can immediately start building.

## Inputs

Derive these from the user's request — infer sensible defaults for anything not stated:

| Field | Source | Default |
|---|---|---|
| **slug** | Kebab-case from the title or topic | — |
| **title** | User's description of the prototype | Titlecase of slug |
| **description** | One-sentence summary of what it does | Generic placeholder based on title |
| **author** | User's name if known | `"Team"` |
| **tags** | 2-4 lowercase keywords from the description | `["prototype"]` |
| **createdAt** | Today's date | `YYYY-MM-DD` |
| **interactive** | Whether the prototype needs client-side state | Infer from description |

## Procedure

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

Use the VS Code 2026 design tokens from `globals.css` — load the `design-system` skill for the full palette and patterns. Key classes:

- Cards/surfaces: `rounded-xl border border-border bg-card`
- Buttons: `rounded-full border border-border bg-card hover:border-accent/30 hover:shadow-md`

For VS Code icons, use the shared `Codicon` component — see the `design-system` skill for usage and icon reference.

### 4. Ensure the dev server is running

Check if the `dev` task is already running. If not, start it using `run_task` with the `shell: dev` task. Wait for it to be ready before proceeding.

### 5. Open in integrated browser

Open the prototype page at `http://localhost:3000/prototypes/<slug>` in the integrated browser so the user can see it immediately.

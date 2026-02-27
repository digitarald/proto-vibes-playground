---
name: design-doc
description: "Create or update a prototype's DESIGN.md. Use when the user wants to capture learnings, document UX patterns, or write up design rationale for a prototype."
---

# DESIGN.md — Prototype Design Document

Every prototype should have a `DESIGN.md` that captures design rationale and learnings. It's the team's shared memory for each prototype — what problem we're solving, what we tried, what worked, and what's still open.

## When to Create

- After building the initial prototype (bootstrap a starter via `new-prototype` skill)
- After a significant iteration round that validates or invalidates a pattern
- When handing off a prototype to another team member

## When to Update

- After each iteration that changes the UX approach
- When an open question gets answered
- When new patterns are validated or old ones fail

## File Location

```
src/app/prototypes/<slug>/DESIGN.md
```

Co-located with `meta.json`, `page.tsx`, and `page.module.css`.

## Structure

Use this template. Every section is optional except **Problem** and **Solution** — skip sections that don't apply yet and add them as the prototype evolves.

```markdown
# <Prototype Title> — Design Doc

> **Status:** Early prototype | Iterating | Validated | Parked
> **Last updated:** YYYY-MM-DD

---

## Problem

One paragraph. What user problem or design question is this prototype exploring? Ground it in observable behavior, not implementation.

## Solution

One paragraph. What's the approach? Describe the UX concept, not the code.

---

## Structure

Describe the layout, key surfaces, and information hierarchy. Use tables for structured breakdowns (columns, states, zones). Include visual treatment notes (color, borders, motion) that inform the design language.

## Validated Patterns

Number each pattern. For each:

- **What we tried** — bullet list of approaches, marked ✅ (kept) or ❌ (discarded)
- **Why it works** (or why alternatives failed) — the reasoning, not the code
- **Implementation note** — one-liner on the technique, enough for another dev to reproduce

Focus on transferable insights. "Outline beats border for hover highlights" is useful across prototypes. "We set outline-offset to -1px" is implementation detail — keep it brief.

## Scenario / Demo Flow

Describe the demo scenario the prototype uses. Include:
- The cast of actors / objects / entities
- The flow or sequence (ASCII diagrams welcome)
- Decision points or branching

## Open Questions

Numbered list. Each question should be actionable — something the next iteration could answer. Flag questions that need user research vs. more prototyping.

## Out of Scope

Bullet list of things this prototype intentionally does NOT cover. Prevents scope creep and sets expectations for reviewers.
```

## Writing Guidelines

1. **Scannable over thorough** — Headers, tables, and bullet lists. A teammate should get the gist in 30 seconds.
2. **Capture what failed** — Failed approaches are the most valuable learnings. Always explain *why* something didn't work.
3. **Transferable insights** — Write patterns so they're useful beyond this one prototype. "Hover effects must be layout-neutral" helps everyone; "we used outline-offset: -1px" helps one person.
4. **Update, don't append** — This is a living document, not a changelog. Rewrite sections as the prototype evolves. Keep it current.
5. **No implementation dumps** — This isn't a code walkthrough. Reference techniques briefly; link to the source if someone wants details.

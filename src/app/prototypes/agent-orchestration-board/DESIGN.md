# Agent Orchestration Board — Product Doc

> **Status:** Early prototype · **Last updated:** 2026-02-26
> **Prototype:** [`/prototypes/agent-orchestration-board`](http://localhost:3000/prototypes/agent-orchestration-board)

---

## Problem

When multiple AI agents work in parallel, users have zero visibility into what's happening. They can't see which agents are active, blocked, or need input. The result is a black box that either completes or fails opaquely.

## Solution

A Kanban-style control board that makes multi-agent orchestration legible at a glance. Agents are cards that flow through columns — **Queued → Running → Needs Input → Completed** — with real-time progress, dependency visualization, and human-in-the-loop decision points.

---

## Board Structure

### Columns

| Column | Purpose | Visual treatment |
|---|---|---|
| **Queued** | Waiting for dependencies | Muted top border, static cards |
| **Running** | Actively executing | Accent (blue) top border, progress bar, percentage |
| **Needs Input** | Blocked on human decision | Warning (amber) top border, prompt + option buttons |
| **Completed** | Finished | Success (green) top border, dimmed to 60% opacity |

Each column shows a count badge. Cards auto-transition between columns as agents progress.

### Agent Cards

Cards show: agent icon, name, and a status indicator (progress %, checkmark, or bell). Click to expand for full description, dependency list, and elapsed time.

---

## Validated Patterns

### 1. Dependency visualization via icon swap

**What we tried:**
- ❌ Separate floating labels above/below cards — caused layout shift and jitter
- ❌ Inline pill badges ("↑ DEP", "↓ NEEDS") in the card header — still shifted flex layout when appearing/disappearing
- ❌ Absolutely positioned badges in card corner — took extra visual space, felt disconnected
- ✅ **Icon swap in-place** — on hover, the agent's icon is replaced with a directional arrow (↑ blue for dependency, ↓ amber for dependent)

**Why it works:** Same 16×16px slot, zero layout shift, instantly communicates direction. The color change (muted → blue/amber) is the primary signal; the arrow shape is secondary confirmation.

**Implementation note:** Use a wrapper element with `position: relative` around the icon. Overlay the dep arrow with `position: absolute; inset: 0`. Fade the original icon with `opacity: 0`.

### 2. Hover stability requires multiple layers

Hover-to-reveal dependency info is extremely flicker-prone. We layered three mitigations:

| Layer | Technique | Why |
|---|---|---|
| **Debounced state** | 120ms timeout before clearing hover; re-entry cancels pending clear | Prevents flicker when crossing between adjacent cards |
| **pointer-events: none** | Applied to all non-interactive card children (header, progress bar, detail panel) | Prevents child elements from firing their own mouseenter/mouseleave |
| **No layout-affecting transitions** | Use `outline` instead of `border` for highlights; dep indicators must not change card dimensions | Any size change under the cursor triggers a leave event, creating a feedback loop |

**Key learning:** If a hover effect changes the hovered element's size — even by 1px — it will cause infinite jitter. Every hover visual must be layout-neutral.

### 3. Outline > border for highlight states

Switching `border-color` on hover can cause subpixel repaints that trigger layout recalc. `outline` with `outline-offset: -1px` visually overlaps the existing border but never participates in layout.

### 4. Human-in-the-loop interrupt pattern

Agents pause in "Needs Input" with a contextual prompt and 2-3 option buttons. The card gets an amber border and bell icon.

**Open question:** Does the interrupt feel natural or disruptive at scale? With 2-3 agents paused simultaneously, can the user triage efficiently? Needs testing with more agents.

### 5. Column-based status is scannable

The 4-column layout answers "what's happening?" in < 1 second. Count badges on column headers give instant aggregate status without scanning cards.

---

## Agent Flow (Demo Scenario)

Eight agents simulate shipping an auth feature:

```
Research ──→ Planner ──→ Coder ──────→ Reviewer ──→ Deployer
                    └──→ Designer ──→ Security  ──┘
                              Coder ──→ Tester  ──┘
```

Agents with `INPUT_PROMPTS` pause at ~40% progress:
- **Research** — "Which auth strategy?" (JWT / Session / OAuth2+PKCE)
- **Designer** — "Modal or full-page redirect?"
- **Security** — "Token rotation interval?"
- **Reviewer** — "3 issues flagged. Approve?"

---

## Open Questions

1. **Scale** — Does the board hold up with 15-20 agents? Columns may overflow; consider scroll or collapsing completed cards.
2. **Cross-column dependencies** — When agents are in different columns, the icon-swap hint only works within the visible column. Need a way to indicate "this card's dependency is in the Completed column."
3. **Error states** — Not yet prototyped. Should failed agents get a 5th column, or stay in-place with an error badge?
4. **Re-run / retry** — If an agent fails or the user wants to re-do a decision, what's the interaction?
5. **Notification priority** — When multiple agents need input simultaneously, which one gets attention first? Should needs-input cards stack in priority order?

---

## Out of Scope (This Phase)

- Real LLM / agent execution
- Drag-and-drop reordering
- Persistent state or history
- Custom agent configuration
- Agent error/failure states
- Keyboard navigation

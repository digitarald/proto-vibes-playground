# Agent Orchestration Board v2 — Design Doc

> **Status:** Iterating · **Last updated:** 2026-06-22
> **Prototype:** [`/prototypes/agent-orchestration-board-v2-usertesting`](http://localhost:3000/prototypes/agent-orchestration-board-v2-usertesting/)

---

## Problem

Developers using multi-agent coding tools don't trust them for consequential work. The agents run autonomously but produce no accountability surface — you can't see what they decided, why they decided it, or intervene before damage is done. This makes agent orchestration feel like a coin flip, not a tool.

The core product question: **How much human involvement is the right amount?** Too little → users don't trust the output. Too much → you've just built a wizard with extra steps.

## Solution

A Kanban-style orchestration view where the user acts as an operator — not a passive consumer. Agents do the work, but the user controls the pace, makes key decisions at branch points, and reviews outputs before they propagate downstream. The system is designed so that **nothing consequential happens without a user action**.

Three interaction gates per agent:
1. **Start gate** — user manually kicks off each agent when they're ready (no auto-execution)
2. **Decision gate** — agent pauses mid-work at genuine tradeoff points where the user's judgment matters
3. **Review gate** — agent output must be acknowledged before dependents can proceed

---

## Product Principles

| Principle | What it means in practice |
|---|---|
| **User is the operator** | Nothing runs without explicit user action. No auto-start, no auto-approve. |
| **Decisions have consequences** | Every prompt presents a genuine tradeoff with real stakes — no filler questions. |
| **Agents can fail** | Tests fail, agents produce conflicts, security finds real issues. The UI handles failure as a first-class state. |
| **Time and cost are visible** | Token usage, elapsed time, and budget thresholds are always surfaced. Users know what they're spending. |
| **Progress is legible** | Glance at the board = know exactly what's running, blocked, or waiting for you. |

---

## Interaction Model

### Flow for each agent

```
Ready → [user clicks Run] → Running → [hits decision point] → Needs Input
  → [user picks option] → Running → ... → Reviewing
  → [user clicks Approve] → Completed → [unlocks dependents]
```

### User actions required (per full run)

| Action type | Count | Purpose |
|---|---|---|
| Start agents | 8 | User controls execution pace |
| Make decisions | 11 | Tradeoff choices with real consequences |
| Review + approve | 8 | Gate before work propagates |
| Handle failures | 2-3 | Resolve test failures, conflicts, security issues |
| Dismiss warnings | 1 | Budget/cost acknowledgment |
| **Total clicks** | **~32** | Enough for a 5-10 minute user testing session |

### Decision design

Every decision prompt includes:
- **The question** — one sentence, specific
- **Context** — why this matters, citing real data (numbers, past incidents, stakeholder opinions)
- **3 options** — each with a concrete consequence description. No "recommended" badge — the user must actually think.

Bad example: "Choose an approach" → [Good / Better / Best]
Good example: "3 of 12 tests failing. Affects ~8% of transactions." → [Fix (15 min delay) / Ship with gaps (risk) / Reduce scope (cut features)]

---

## Failure Scenarios (What Goes Wrong)

These are intentional — they test how users handle problems, not just happy paths.

| Scenario | When it fires | What user must do |
|---|---|---|
| **Test failures** | Testing Agent finds 3 failing edge cases | Choose: retry, ship with gaps, or cut scope |
| **Hardcoded secret** | Security Agent finds a committed API key | Choose: block all, flag + continue, or inline fix |
| **Agent conflict** | Deploy detects Schema vs Backend naming mismatch | Resolve column naming: payment_status vs status |
| **Friday deploy** | Final step — it's Friday 4 PM | Choose: deploy now (risk), Monday (delay), or 2 AM (skeleton crew) |
| **Budget warning** | Token usage crosses 8k threshold | Dismiss or increase limit |

---

## Layout

### Board (main area)

4-column Kanban: Queued → Running → Needs Input → Completed. Cards in "Queued" include agents in both `queued` (deps not met) and `ready` (deps met, awaiting user start) states. Cards in "Completed" include both `reviewing` (awaiting approval) and `completed` (approved).

### Phase bar

Horizontal progress indicator above the board: Discovery → Planning → Implementation → Verification → Deployment. Shows which macro-phase is active.

### Detail panel (right)

Opens when any card is clicked. Shows:
- Agent description + model + token count
- Dependencies (clickable, navigate between agents)
- Decision prompts with full context (for needs-input agents)
- "Start Agent" button (for ready agents)
- Output summary + file changes + "Approve & Continue" button (for reviewing agents)
- Full activity log (timestamped entries)
- Decision history (what the user chose earlier)

---

## Validated Patterns

### 1. Manual kickoff builds trust

Users who manually start each agent report higher confidence in the output vs. auto-execution. The act of clicking "Run" creates a sense of control even though the agent runs autonomously after that.

### 2. Review gates prevent silent propagation

When Agent A's output feeds into Agent B, requiring the user to approve A's output before B starts prevents the "garbage in, garbage out" cascade. Users catch issues earlier.

### 3. Decisions without recommendations force engagement

Removing "recommended" badges from options means users actually read the tradeoffs. In testing, users with recommended badges clicked the highlighted option 90% of the time without reading alternatives.

### 4. Real failures build trust more than clean runs

Showing tests that fail, agents that conflict, and security that catches issues makes the system feel more credible than a clean run where everything succeeds perfectly.

### 5. Cost visibility changes behavior

Users who see token counts in real-time make different scope decisions. The budget warning banner creates a moment where users weigh "is this worth continuing?" — which is the real product question.

---

## Open Questions

1. **Does the review gate feel like busywork for simple agents?** Research Agent produces a summary — is approving it actually adding value, or just a speed bump? Should some agents auto-approve?

2. **How do users handle 3+ simultaneous "Needs Input" states?** When Backend, Schema, and Frontend all pause at once, is the triage clear or overwhelming?

3. **Should decision consequences be shown after the fact?** "You chose X, which means Y happened." Would a decision-recap improve learning or just add noise?

4. **Is the detail panel the right surface for decisions?** Inline card prompts (v1 pattern) are more visible but less rich. Panel prompts have more room for context but require an extra click to reach.

5. **What's the right granularity of human involvement?** 32 clicks for 8 agents might be too many for a real workflow. Is there a "trust level" slider where experienced users can auto-approve certain categories?

## Out of Scope

- Multi-user collaboration (only one operator at a time)
- Agent configuration or customization
- Undo/revert of decisions after they're made
- Real LLM integration (all outputs are mocked)
- Mobile or responsive layout (desktop panel width assumed)

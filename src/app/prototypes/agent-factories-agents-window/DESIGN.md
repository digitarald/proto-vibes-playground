# Agent Factories in the Agents Window — Design Doc

> **Status:** Iterating · **Last updated:** 2026-09-11

---

## Problem

Agent Factories make multi-agent work durable, bounded, observable, and resumable, but those runtime qualities need a product surface that developers can understand without learning a new workflow-builder application. The design question is how a factory run and its child sessions fit into the Agents window's existing workspace-grouped session list, active chat, Changes and Files panels, review flow, and Agent Host lifecycle.

## Solution

The prototype keeps the Agents window as the stable shell and tests three placements for factory state: a parent row in the Sessions list, a run graph inside the active session, and a recurring-loop view inside a scheduled session. In every variation, child workers remain ordinary sessions with their own chat, workspace or worktree, Changes, Files, and terminal state. The factory adds coordination, durable progress, limits, gates, and recovery rather than replacing those surfaces.

---

## Structure

| Variation | Primary surface | Design probe | Scenario |
|---|---|---|---|
| A · Sessions | Expandable parent in the workspace group | Can hierarchy communicate ownership and parallel work at a glance? | Large SDK migration |
| B · Run graph | Active session details between chat header and input | Can operators diagnose a blocked run and resume the right node quickly? | PR repair loop |
| C · Recurring | Cycle history and discovered work in an Automation-owned session | Can recurring observation stay distinct from bounded implementation runs? | Issue triage-to-fix |

All three preserve the standard VS Code shell:

- Workspace-grouped sessions remain the global navigation.
- The selected session owns Chat, Changes, Files, Tasks, terminal, and browser state.
- Child sessions can open side by side for comparison or verification.
- Agent Host is named as the owner for runs that continue without a connected client.
- Limits, approvals, external waits, failures, resumability, and completed states are represented explicitly.

## Validated Patterns

### 1. Factories are parents, not special agents

- ✅ Factory rows and run headers use a hierarchy icon and stable run identity.
- ✅ Workers use ordinary session rows and open into existing session surfaces.
- ❌ A standalone orchestration board was rejected because it duplicates session navigation, review, and file inspection.

**Why it works:** Users already understand that a session owns a workspace and conversation. The parent-child relationship adds coordination without inventing a second execution object.

### 2. Gates and external waits need different language

- ✅ Human gates say who must act and expose an approval action.
- ✅ External waits name the event the Agent Host is observing.
- ❌ A generic "paused" state was rejected because it hides whether the user can unblock the run.

**Why it works:** The operator can answer "what happens next?" without opening logs.

### 3. Resume explains what is preserved

- ✅ Resume actions state that completed journaled steps are skipped.
- ✅ Attempts remain visible in the graph and cycle history.
- ❌ Retry language was rejected because it implies restarting the whole workflow.

**Why it works:** Durability becomes a concrete user benefit rather than an implementation claim.

### 4. Verification is a role, not a success badge

- ✅ The verifier is an independent child session with deterministic checks.
- ✅ Completion criteria and product approval remain separate nodes.
- ❌ The implementing worker does not certify its own output.

**Why it works:** Passing tests, independent review, and human judgment remain legible as different claims.

### 5. Demo actions must advance the run model

- ✅ Conflict resolution, warm resume, approval, schedule pause, immediate cycles, and historical inspection now produce persistent state changes.
- ✅ Selecting a migration worker changes its conversation summary, Changes list, and side-by-side child session.
- ❌ Toast-only actions were discarded after dogfooding because they made recovery and approval look successful while leaving the run blocked.

**Why it works:** A reviewer can now follow each probe through a visible before-and-after state instead of evaluating static mock data.

### 6. Dense desktop layout should still narrow gracefully

- ✅ The full three-panel Agents layout remains available at desktop widths.
- ✅ The secondary session and Changes panel progressively collapse at narrower widths.
- ❌ A fixed 980px minimum width was discarded because it clipped the graph and recurring controls in small browser windows.

**Why it works:** The prototype stays faithful to the desktop Agents window while remaining reviewable in split editor and browser layouts.

## Scenario / Demo Flow

### Large migration

1. Expand the factory under `github/copilot-sdk`.
2. Select completed, running, blocked, failed, and queued worker sessions.
3. Resolve the cross-shard ownership conflict.
4. Select the failed web shard and resume it with its warm journal.
5. Compare the migration parent with the verifier side by side.

### PR repair loop

1. Select graph nodes to inspect their owner and state.
2. Open the failed verifier node and resume only that node.
3. Approve the product gate before the external CI wait.
4. Review the active session's files and changes without leaving the run.

### Issue triage-to-fix

1. Scan the next trigger and recent cycle outcomes.
2. Select a prior completed or limit-reached cycle.
3. Inspect discovered issues and their bounded implementation sessions.
4. Approve high-impact work or wait for external reporter input.
5. Start an immediate observation cycle without changing the schedule.

## Recommendation

Use **A as the default navigation model** because it makes ownership and child sessions obvious wherever users already manage parallel work. Add **a restrained form of B as the selected factory's detail view** for diagnosis, limits, gates, and resume. Use **C only for factories with a recurring trigger**, reached from Automations and represented as an Agent Host-owned session in the same workspace group.

The combined model is progressive: list for awareness, run detail for intervention, cycle history only when recurrence exists.

## Open Questions

1. Should child sessions collapse into a summarized count after completion, with transcripts lazily rehydrated on open?
2. Should approving a higher resource limit happen inline in the run detail or through the existing approval flow?
3. How should a factory spanning several repositories appear when the Sessions list is grouped by workspace?
4. Does opening a child session make it independently active, or should the parent factory remain the active context for Changes and Files?
5. Which run events warrant a global notification versus an input-needed state in the Sessions list?

## Out of Scope

- Visual factory authoring or editing orchestration code.
- Organization-wide policy and billing administration.
- Factory nesting.
- Exactly-once guarantees for external side effects.
- Real runtime or GitHub integration; all states are representative prototype data.

# Agent Factory MVP Lifecycle — Design Doc

> **Status:** Early prototype · **Last updated:** 2026-09-14

---

## Problem

The prior authoring prototype exposes the full maintenance system—source, metrics, evals, models, traces, and three editing approaches—but asks reviewers to understand too many concepts before they experience the basic value. We need the smallest credible workflow that shows how a developer creates one factory and then benefits from it during ordinary work.

## Solution

Use one source-controlled `Keep PR green` factory across four progressive states: define its goal and limits, replay it against one representative event, publish the reviewed version, and supervise a real daily run in the Agents window. The factory assistant helps only where the runtime contract is easy to get wrong. Each action advances the same durable artifact, and daily use remains grounded in ordinary sessions, worktrees, Changes, and human approvals.

---

## Structure

| Stage | User question | MVP answer |
|---|---|---|
| Define | What should happen, and what remains under my control? | Trigger, goal, four-step workflow, one approval rule, and three limits |
| Test | Will this workflow behave safely on a real event? | One redacted replay fixture with trace, completion checks, time, agents, and credits |
| Publish | What am I enabling? | Immutable summary of trigger, capabilities, gate, limits, and validation |
| Use | When does this need my attention? | Agent Host runs unattended; the factory surfaces only a product decision and final review |

## Scenario

`Keep PR green` reacts when PR #1842 changes:

```text
Observe CI/review -> repair in isolated session -> verify independently
                  -> ask only for product behavior -> wait for required CI
```

The author adds a durable key after the assistant identifies repeated verification risk, replays a captured Windows CI failure, publishes v1 to the workspace, and watches a daily run complete.

## Validated Patterns

### 1. One artifact should connect authoring and usage

- ✅ The same name, goal, limits, workflow, and source file persist through all four stages.
- ❌ Separate builder and monitoring concepts were removed from the MVP.

**Why it works:** A reviewer understands that authoring creates the durable object later seen in Agents.

### 2. The assistant should protect contracts, not invent the workflow

- ✅ The author states the goal and boundaries; the assistant finds a missing durable key and proposes a narrow diff.
- ❌ Open-ended “generate a factory” magic is avoided.

**Why it works:** Agent help is valuable and reviewable without obscuring who chose the behavior.

### 3. One representative replay is enough to teach the loop

- ✅ The fixture includes a failing check, review feedback, cost, completion rules, and journal restoration.
- ❌ Eval-set management and comparative model dashboards stay in the advanced authoring prototype.

**Why it works:** Testing demonstrates safety and cost before publish without turning onboarding into evaluation engineering.

### 4. Daily use should be quieter than authoring

- ✅ Agent Host owns progress until a declared human gate matches.
- ✅ The user sees a normal repair session, explicit product decision, external CI wait, and reviewable diff.
- ❌ Operators do not manage graph nodes or orchestration internals during the happy path.

**Why it works:** The factory earns attention instead of continuously demanding it.

## Demo Flow

1. Apply the assistant's safe durability improvement.
2. Replay the PR fixture and inspect quality, cost, time, and peak agents.
3. Publish v1 after reviewing its capabilities and limits.
4. Open today's run, advance repair and verification, make the product decision, and simulate required CI passing.
5. Review the resulting two-file change or open the ordinary repair session.

## Recommendation

Use this lifecycle as the first-run and lightweight factory experience. Keep source editing, multi-case evals, model comparisons, regression metrics, maintenance diagnostics, and structured editing in the advanced authoring surface reached from the factory source or history.

## Open Questions

1. Should first publish require more than one replay fixture for factories with write or network capabilities?
2. Does “Publish” best describe registering a workspace-local source file with Agent Host?
3. Should the daily run open on the parent factory or directly on the child session requesting approval?
4. When should the simple experience promote an author into the advanced eval and maintenance workflow?

## Out of Scope

- Multiple authoring approaches.
- Model benchmarking and prompt experiments.
- Multi-case regression suites and canary rollout.
- Organization policy administration.
- Factory version migration.

# Agent Factory Authoring — Design Doc

> **Status:** Iterating
> **Last updated:** 2026-09-11

---

## Problem

Agent Factories are living orchestration software: their prompts, role contracts, models, tools, limits, evals, and failure behavior change as repositories and policies evolve. Authors need to understand and improve them without losing the source-controlled, reviewable, reversible qualities of code. The runtime prototype showed that operators specifically need to distinguish factory orchestration from ordinary child sessions, human gates from external waits, retries from warm resume, and implementation from independent verification.

## Solution

The prototype keeps one `Repair PR` factory, one evidence set, and one VS Code shell while comparing three source-backed authoring approaches: a schema-aware code editor, an agent co-author that explains and drafts durable diffs, and a structured outline with properties that project directly onto source. Every approach feeds the same improvement loop: evidence, hypothesis, source change, eval comparison, and bounded rollout.

---

## Structure

| Shared zone | Purpose |
|---|---|
| Factory Explorer | Source files, ordered orchestration, recent runs, and the child-session ownership boundary |
| Authoring editor | The only variable: code-first, conversational, or structured hybrid |
| Improvement loop | Makes the current evidence-to-rollout stage explicit |
| Evidence inspector | Contextual finding, trace, eval comparison, cost/limits, and rollout controls |
| Problems panel | Actionable maintenance diagnostics tied to source and runtime evidence |

### Comparable variants

| Variant | Primary interaction | Durable artifact | Key strength |
|---|---|---|---|
| A · Code | Edit typed factory source with inline diagnostics and quick fixes | TypeScript + fixture diff | Precision, keyboard flow, maximum transparency |
| B · Co-author | State an outcome; inspect rationale, uncertainty, boundaries, and diff | Same TypeScript + fixture diff | Diagnosis and maintenance for authors who do not recall every contract |
| C · Structure | Select ordered steps and edit validated properties | Same TypeScript + fixture diff | System comprehension without a generic no-code canvas |

## Concrete operator questions

The prior runtime prototype and captures exposed these authoring questions:

1. Which object owns the change: the factory or an ordinary child session/worktree?
2. Does recovery retry work, resume from a durable journal, wait for a person, or wait for an external event?
3. Who verifies the implementing agent, and can a role approve its own work?
4. What limits bound fan-out before an approval gate?
5. Which completed work survives a failure?
6. Is a recurring failure transient, deterministic, model-related, prompt-related, or policy-related?
7. What evidence justifies a change, and how does that change affect quality, reliability, latency, and credits?

## Scenario / Demo Flow

All variants use the published `Repair PR` factory:

```text
Observe PR -> Investigate (max 3) -> Apply fixes (max 2 worktrees)
           -> Verify (independent) -> Product approval -> Wait for CI
```

- **Roles:** Scout, Fixer, Verifier, Product owner, Agent Host
- **Limits:** 4 concurrent, 12 total agents, 20 credits, 90-minute stop
- **Persistence:** durable journal; completed platform checks restore on resume
- **Evidence:** five recent runs; `run_c91a` repeated the same Windows path verifier failure
- **Eval set:** 24 replayable cases, including two underrepresented monorepo layouts
- **Candidate:** add a deterministic Windows fixture and reduce retries from two to one

### Demo

1. Open the maintenance finding and inspect recurrence, waste, and confidence.
2. Switch among Code, Co-author, and Structure; note that each proposes the same bounded source diff.
3. Apply the diff and observe persistent changes in source state, diagnostics, status bar, and improvement loop.
4. Replay 24 eval cases and compare published versus candidate quality, reliability, latency, credits, and peak agents.
5. Publish a 10% canary with an automatic reliability rollback.
6. Inspect Limits to see why a cost-increasing recommendation would require explicit owner approval.

## Validated Patterns

### 1. Evidence belongs next to the authoring decision

- ✅ The finding, trace, eval deltas, and cost guardrails stay beside the editor.
- ❌ A separate analytics dashboard was rejected because it makes authors translate passive metrics back into source changes.

**Why it works:** The author can move from a failing trace to a hypothesis and diff without losing the decision context.

### 2. Agent changes need an inspectable contract

- ✅ Recommendations show evidence, confidence, uncertainty, preserved boundaries, projected cost, and a reviewable diff.
- ❌ One-click “optimize factory” actions were rejected because authors cannot predict scope, policy conflicts, or cost impact.

**Why it works:** The agent is useful without becoming an unaccountable source of durable orchestration changes.

### 3. Structured editing should project source, not replace it

- ✅ The outline is ordered rather than spatial, and every property links back to source.
- ❌ A freeform node canvas was rejected because layout work competes with maintaining executable orchestration.

**Why it works:** The hybrid view improves comprehension while retaining code review, merge conflict, and keyboard workflows.

### 4. Evals are a transition, not a destination

- ✅ Applying a source change advances directly to replay, comparison, and bounded rollout.
- ❌ Static quality cards were rejected because they do not explain what to change next.

**Why it works:** Metrics become evidence in a closed improvement loop rather than a monitoring endpoint.

### 5. Cost belongs at fan-out, retry, and model choices

- ✅ Diagnostics and properties show projected credits where the author changes concurrency or retries.
- ✅ Policy blocks cost-increasing recommendations from silent application.
- ❌ Billing-only views were rejected because they arrive after an expensive design has already shipped.

**Why it works:** Authors see the cost-quality tradeoff while it is still reversible.

## Recommendation

Use **A · Code as the default authoring surface**, augmented with the contextual Evidence inspector and maintenance diagnostics. Offer **B · Co-author as an action within the same editor** for diagnosis, refactors, stale model/tool repair, and bounded source proposals. Use **C · Structure as an alternate synchronized view** for orientation and validated property edits, not as a separate artifact or generic visual builder.

This composes the strongest parts instead of forcing authors to choose one permanent mode: source is canonical, the agent accelerates maintenance, and structure improves comprehension.

## Rejected Patterns

- A standalone factory-builder application separate from the VS Code workbench.
- A generic drag-and-drop graph with positional persistence.
- Agent recommendations that apply before showing evidence and diff.
- Evals and traces presented as passive dashboards.
- Cost warnings shown only at publish time.
- Toast-only success; every action in the prototype changes persistent visible state.

## Open Questions

1. Should canary rollout configuration live in factory source, repository policy, or deployment metadata?
2. How should fixture data be redacted when replaying production traces?
3. When a model alias retires, which compatibility checks are required before an automated source proposal?
4. Should uncertain recommendations branch the factory source automatically or remain an unapplied working-tree diff?
5. Which property edits are safe enough for immediate application versus mandatory owner review?
6. How should eval baselines evolve without hiding gradual quality regressions?

## Out of Scope

- Implementing an actual factory runtime, schema language server, or model benchmark service.
- Organization-wide billing and policy administration.
- Nested factories.
- Editing child-session files from the orchestration outline.

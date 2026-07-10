# Inline Agent Quality Survey — Design Doc

> **Status:** Early prototype · **Last updated:** 2026-07-10

Explores [microsoft/vscode-internalbacklog#8378](https://github.com/microsoft/vscode-internalbacklog/issues/8378).

---

## Problem

We have no first-party, in-context way for users to tell us how an agent session went. Post-hoc channels (issues, satisfaction surveys) miss the moment and don't correlate to a specific session, so a "that went badly" signal can't be tied back to what the agent actually did. We need a high-completion, low-friction prompt that produces *actionable* signal — not just a mood score — while respecting VS Code's telemetry and enterprise feedback controls.

## Solution

An inline survey that renders as the last item in the agent's output at a session boundary (agent-idle / end-of-session) — designed to look like a native part of the transcript, **not** a modal intrusion. The primary question is a single tap. A positive rating submits immediately (happy path stays one tap). Any non-positive rating progressively reveals 2–3 lightweight reason chips plus an optional one-line free-text, turning the negative path into an on-ramp for diagnostic signal rather than a dead end. Dismiss is first-class. The thanks state closes the loop by pointing at the changelog.

The prototype renders a realistic agent session (the very session that filed #8378) and uses a **floating switcher** to compare four rating-format variations *in context* — so the team can feel each one where it actually appears, instead of judging them on a spec page.

---

## Structure

The surface is a VS Code agent session window: title bar + command center, session header, scrollable transcript ending in the completed work, then the inline survey, then the composer. The survey block sits flush in the thread with a thin accent left-border to read as "agent chrome," not a card.

| Zone | Treatment |
|---|---|
| Primary question | One row: question + rating control + first-class dismiss (×) |
| Rating control | Pill buttons; selected pill tints by **tone** (green/amber/red) |
| Follow-up (revealed) | Reason chips (multi-select) + optional one-line note + Send |
| Thanks | Green-tinted confirmation with changelog link (close-the-loop) |
| Dismissed | Quiet one-liner with Undo |

**Selected-state affordance:** the chosen option gets a single subtle accent tint + accent border (VS Code's `inputOption.active*` model) — meaning comes from the label, not the color.

## Variations (switcher)

All four share the progressive follow-up; they differ only in the primary rating format — mapped to the issue's section A/B options.

1. **3-point outcome (proposed)** — "Did this do what you wanted?" · Yes / Partly / No. Outcome-framed, measures task success.
2. **Two-tap sentiment** — "How did this session go?" · Good / Fine / Bad with Codicons (thumbsup / dash / thumbsdown). Satisfaction-framed, closest to Claude Code.
3. **Descriptive chips** — "How close did this land?" · Nailed it / Mostly there / Off track. Qualitative labels make a low rating already partly diagnostic.
4. **5-point outcome** — Exactly / Mostly / Partly / Barely / Not at all. More granularity, slightly higher friction.

## Validated Patterns

1. **One-tap happy path** — a positive rating auto-submits; only non-positive ratings open the follow-up. ✅ Keeps the common case frictionless while the negative path becomes the diagnostic on-ramp.
2. **Compact, VS Code-native controls** — ✅ 4px-radius secondary buttons at 12px, quiet accent highlight for the selected state. ❌ First pass used 999px pills with saturated green/amber/red sentiment tints and emoji — read as generic AI/marketing UI, not editor-native. Lesson: match VS Code's density and restraint (small radius, one accent for selection, status colors reserved for status text — not control fills, Codicons over emoji).
3. **Inline, not modal** — ✅ accent left-border + flush placement in the thread reads as native agent output. Avoids the "survey capturing a keystroke meant for the prompt" input-ambiguity failure mode by keeping it out of the composer.
4. **First-class dismiss** — ✅ a persistent × plus a quiet "skipped / Undo" state keeps opt-out symmetric with participation (a failure mode called out in the issue's prior-art notes).

## Scenario / Demo Flow

The session that filed #8378 has just finished ("Updated ✅ — #8378 now has an Options & alternatives section"). The agent goes idle → the inline survey appears as the final output. Tapping the positive option submits instantly; tapping neutral/negative reveals reason chips (Wrong edit · Too slow · Misunderstood · Lost context · Incomplete) and an optional note. Send → thanks + changelog link.

## Open Questions

1. Exact reason-chip taxonomy — are five chips too many? Should they vary by rating (No vs. Partly)?
2. Default frequency / throttle rate for the after-turn (non-session-end) trigger.
3. Should "Partly/No" route into a deeper structured feedback channel, or always stay inline?
4. Which framing wins on completion *and* signal quality — outcome vs. sentiment vs. descriptive? Needs live A/B, not just prototyping.
5. How to surface the "respects telemetry / enterprise policy" state without adding meta-UI to the happy path.

## Out of Scope

- Real telemetry/OTel wiring, enterprise policy enforcement, and settings toggles (referenced in the issue but not modeled here).
- The after-turn throttled trigger logic — this prototype only shows the session-end placement.
- Transcript/code capture — the rating payload is intentionally lightweight (session id + last message id).

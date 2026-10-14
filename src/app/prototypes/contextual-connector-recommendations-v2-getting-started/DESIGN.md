# Copilot getting started checklist

> **Status:** Early prototype
> **Last updated:** 2026-10-13

## Problem

Someone opening Copilot may not know which setup steps help with their actual work. A list of capabilities can read like an ad. A large onboarding card also competes with the chat input.

## Solution

Put six short, task-worded entry points beneath the composer. Keep every item on one line at desktop size. Tool names and icons identify the relevant service, while the labels read like requests someone would make to an agent.

This variation keeps the original chat layout. The checklist replaces the single contextual Figma suggestion. Browser discovery is deferred so the list focuses on workspace instructions, planning, connectors, and an actionable automation.

## Styles

The demo toolbar toggles between two styles in this same variation.

| Style | Width | Row treatment |
| --- | --- | --- |
| Original | Up to 520px | Task label, tool cue, and visible action label |
| Compact, the default | Up to 300px | Task label and tool cue only. The whole row is the action. |

Switching styles preserves the draft, selected agent, and completion count. Compact also narrows status messages to match the checklist. Reset keeps the selected style.

## Items

| Task | Action |
| --- | --- |
| Document this workspace | Insert /init and focus the composer |
| Plan a bigger change | Select Plan and focus the composer |
| Implement this Figma frame | Open Connectors |
| Triage my Outlook inbox | Open Connectors |
| Turn my Notion plan into tasks | Open Connectors |
| Set up a daily check-in | Open Automations |

## Behavior

- The checklist only supplies entry points. It does not reproduce connector setup or automation authoring.
- Document this workspace inserts `/init` at the start of the draft, preserves any existing text, and focuses the composer. Repeated clicks do not duplicate the command. Nothing runs until the user sends the prompt.
- Document this workspace is complete whenever the demo workspace has `AGENTS.md`, including on first load. It does not depend on who created the file or whether they clicked the row.
- The demo starts with an existing `AGENTS.md`. The toolbar's AGENTS.md toggle simulates file presence or absence. Inserting or sending `/init` does not pretend that a file has been created.
- Plan a bigger change selects the Plan agent and focuses the input without changing the draft. It checks off after a prompt is sent in Plan, not merely when the agent is selected. Sending `/init` does not count as planning.
- The Figma, Outlook, and Notion rows share the Connectors destination. The final row targets Automations. A short status message identifies the navigation target. These destination pages are deliberately outside the prototype.
- Opening a destination does not pretend to connect a service or create an automation. No account, inbox, planning page, design, or workspace file is accessed.
- Empty circles are passive status indicators, not manual checkboxes. Completed entry points remain clickable so they can be used again.
- New Session clears the conversation but keeps onboarding progress and workspace-file presence. Reset restores the initial existing-file scenario and keeps the selected style.
- Collapse keeps the heading and count. Hide removes the checklist. Show checklist in the small demo toolbar restores it.

## Design choices

- Six rows fit in roughly 250 pixels at desktop size. No extra descriptions or setup forms appear beneath them.
- Document this workspace describes a durable result, unlike Teach Copilot, which implies the user has to train the agent. The `AGENTS.md` cue explains what makes the row complete. Plan comes second so planning precedes connector setup.
- Compact removes the separate action-label column and the excess space between task text and tool cues. Hover and keyboard focus apply to the full row.
- Empty circles are status indicators, not manual checkboxes.
- Completion uses a quiet checkmark. No confetti, rewards, streaks, or congratulatory copy.
- The chat input remains usable without completing any onboarding step.
- The service names sit inside concrete requests: implement a frame, triage an inbox, and turn a plan into tasks. Generic capability copy such as Build from a design does not say what the agent should do.
- The email task names Outlook, while its icon identifies the underlying WorkIQ MCP. The tooltip and accessible row label name WorkIQ without adding another visible label to the checklist. Task wording and connector identity are separate.
- WorkIQ and Notion use locally bundled brand assets rather than generic mail and notebook icons. The marks identify connectors, not an endorsement of this prototype.

These choices still need user feedback. They are not validated findings.

## Sources

- [Codex workflow guidance](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex.md) describes `/init` as generating `AGENTS.md` from repository context. It frames the file as persistent repository guidance.
- [WorkIQ MCP icon](https://static.powerapps.com/resource/ppcr/releases/v1.0.1821/1.0.1821.4811/workiqmcp/icon.png) is the Microsoft-hosted asset supplied for this iteration, stored as [workiq.png](./workiq.png).
- [Notion's official mark](https://www.notion.so/images/notion-logo-block-main.svg) is stored unchanged as [notion.svg](./notion.svg). Brand assets remain the property of their respective owners and are used to identify the integrations.

## Open questions

1. Should connector items disappear when someone does not use that service, or should the checklist offer a skip action?
2. Should the collapsed count describe setup progress or things tried? Plan is a useful habit rather than one-time setup.
3. Should connector rows become direct task prompts after the corresponding connector is configured?
4. Which sign-in and permissions steps will each real connector require?
5. Do six items still feel optional, or do they suggest homework?

## Out of scope

- Connectors and Automations destination pages, authentication, `/init` execution, and scheduled work.
- Live workspace-file detection. `AGENTS.md` presence is a controllable demo fixture, not a file-system scan.
- Browser onboarding, deferred to a later test.
- Account-persisted onboarding progress.
- Production recommendation targeting.

# Copilot getting started checklist

> **Status:** Early prototype
> **Last updated:** 2026-10-13

## Problem

Someone opening Copilot may not know which setup steps help with their actual work. A list of capabilities can read like an ad. A large onboarding card also competes with the chat input.

## Solution

Put seven short tasks beneath the composer. Keep every item on one line at desktop size. Use a small completion count, a thin progress line, and task-specific actions. Tool names and icons support the task instead of leading it.

This variation keeps the original chat layout. The checklist replaces the single contextual Figma suggestion. The user's three additional recommendations bring the list to seven items.

## Styles

The demo toolbar toggles between two styles in this same variation.

| Style | Width | Row treatment |
| --- | --- | --- |
| Original | Up to 520px | Task label, tool cue, and visible action label |
| Compact, the default | Up to 300px | Task label and tool cue only. The whole row is the action. |

Switching styles preserves the draft, completion count, and open setup. Compact also narrows setup details and status messages to match the checklist. Reset keeps the selected style.

## Items

| Task | Action |
| --- | --- |
| Teach Copilot this workspace | Run /init |
| Build from a Figma design | Connect |
| Catch up on email | Connect WorkIQ |
| Work from a Notion plan | Connect |
| Plan before bigger changes | Try Plan |
| Check your app in the browser | Open |
| Set up a daily check-in | Set up |

## Behavior

- Setup details open below the checklist, not in a blocking dialog.
- Connector setup and `/init` are simulated. Their completion messages say so. No account, email, planning page, design, or workspace file is accessed.
- Try Plan changes the composer mode without replacing the draft. The composer also lets the user switch back to Agent.
- Open reveals a browser pane. It accepts full localhost URLs and embeds the requested local page. Invalid or remote URLs show an error.
- Set up opens an editable automation name, prompt, repeat schedule, and time. Saving completes the item, but does not schedule real work.
- Progress counts completed actions, not clicks on empty circles. Completed rows stay readable and cannot be counted twice.
- Closing setup cancels an in-progress demo operation. Escape closes setup and returns focus to its row.
- New Session clears the conversation but keeps onboarding progress. Reset clears the whole demo.
- Collapse keeps the heading and count. Hide removes the checklist. Show checklist in the small demo toolbar restores it.

## Design choices

- Seven rows fit in roughly 280 pixels at desktop size. No per-item description appears until the user asks for details.
- Compact removes the separate action-label column and the excess space between task text and tool cues. Hover and keyboard focus apply to the full row.
- Empty circles are status indicators, not manual checkboxes.
- Completion uses a quiet checkmark. No confetti, rewards, streaks, or congratulatory copy.
- The chat input remains usable without completing any onboarding step.
- WorkIQ is named beside the email task so the connector is identifiable. Figma and Notion already appear in their task labels.

These choices still need user feedback. They are not validated findings.

## Open questions

1. Should connector items disappear when someone does not use that service, or should the checklist offer a skip action?
2. Should the collapsed count describe setup progress or things tried? Plan and browser are useful habits rather than one-time setup.
3. Should completed rows stay visible or leave the list?
4. Which sign-in and permissions steps will each real connector require?
5. Does seven items still feel optional, or does it suggest homework?

## Out of scope

- Real connector authentication, `/init` execution, and scheduled automations.
- Account-persisted onboarding progress.
- Production recommendation targeting.

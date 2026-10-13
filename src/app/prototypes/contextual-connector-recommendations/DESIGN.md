# Contextual Connector Recommendations

> **Status:** Early prototype
> **Last updated:** 2026-10-13

## Problem

A person is drafting a request about a Figma design, but Copilot does not yet have the connector that could provide design context. How can chat suggest that capability at the right moment without becoming an advertisement or interrupting composition?

## Solution

Place one optional recommendation directly beneath the composer. Tie the copy to the task rather than promoting the connector in isolation. Compare a quiet inline row with a compact benefit-led card, keeping the surrounding chat surface fixed.

## Treatments

| Treatment | Hierarchy | Trade-off to investigate |
| --- | --- | --- |
| Inline (default) | Figma mark, task-specific sentence, install link, dismiss | Lowest visual weight; may be easy to overlook |
| Card | Benefit-led heading, explanation, review action, dismiss | More room to explain the benefit; may feel promotional |

The composer remains the primary action. The recommendation uses a link or neutral button, not a second filled blue CTA.

## Interaction

- The seeded draft mentions Figma. Editing the draft to remove that context hides the recommendation after a short pause.
- Detection is an illustrative keyword match, not a production intent classifier.
- Reviewing the connector expands details beneath the recommendation, without opening a blocking dialog or moving focus away from the chat surface.
- Details receive keyboard focus; Escape closes them and returns focus to the review action.
- Installation is explicitly simulated. No service, account, or design data is accessed.
- The draft survives review, dismissal, and installation. Installation returns focus to the composer and adds Figma to the context row.
- Dismissal suppresses the recommendation for the current demo session, even if the draft changes.
- Sending without installing remains possible. The demo response does not claim to have read a Figma file.
- The floating Inline / Card controls compare the two treatments. Reset restores the initial draft and recommendation.

## Design Hypotheses

- Contextual, task-led copy should feel more useful than a generic "Recommended for you" label.
- One recommendation should feel calmer than a carousel or a list of integrations.
- An inline review step may provide enough information for consent without breaking the drafting flow.
- Reserving space beneath the composer keeps its position stable as recommendations appear or disappear.

These are hypotheses, not user-validated findings.

## Open Questions

1. Does the inline row get noticed without an enclosing card? Compare first-time discovery and repeat exposure.
2. Should a Figma URL be required, or is an explicit mention enough? Test false positives such as "Do not use Figma."
3. Is session dismissal enough, or should people be able to disable connector recommendations permanently?
4. Which publisher, permission, sign-in, and scope details does the real connector require before installation?
5. Should installation alone count as ready, or should the next state be account authorization? This prototype does not model authorization.

## Out of Scope

- Real connector installation, authentication, permissions, and Figma access.
- Production recommendation ranking or repeated-exposure policy.
- Redesigning the session sidebar or model controls.

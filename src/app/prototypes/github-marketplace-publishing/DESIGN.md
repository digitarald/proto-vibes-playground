# GitHub Marketplace publishing

> **Status:** Iterating
> **Last updated:** 2026-10-27

## Problem

Publishers need to turn a repository or hosted MCP service into a listing, understand what blocks review, and release updates without replacing a working version with a broken one. A submission form alone does not explain the relationship between source checks, approval, publication, and the version users receive.

## Solution

Start from repository discovery. Keep plugins and MCP services as separate submission paths, then bring them into a common publisher console. Every source check belongs to a revision. Publishers fix findings through source changes, reviewers approve the candidate, and the assigned publication policy controls its release. A separate live snapshot survives pending edits and failed updates.

## Structure

| Surface | Purpose |
|---|---|
| Repository | Discover a plugin manifest or import server.json |
| Plugin submission | Source, listing, disclosures, release configuration, review |
| MCP submission | Connection, tools, listing and use cases, authentication, data and tests, review |
| Publisher console | Review conversation, candidate versions, pending listing diffs, publication policy |
| Product Narrative | Explain the current product decision, with competitive research as a secondary aside |

### Submission fidelity

- Retention uses explicit choices: no retention, session only, fixed period, until deleted, or custom policy. Follow-up fields ask for days, data types and storage location, deletion, and exceptions only when relevant. Personal-data use and external transfers need descriptions when declared. Changed disclosures clear prior compliance acknowledgments.
- The final review shows the actual data declarations and retention policy, or the connector's authentication, test workspace, restrictions, and execution plan. The public support address and private review contact have distinct labels.
- Connector discovery starts with a running endpoint, not repository inspection. Protected discovery requires an explicit simulated sign-in and authorization. Public metadata can be imported without sign-in. Authorization exists only in memory and is bound to the current connection settings.
- The tool page shows descriptions, JSON input schemas, and annotations. Data-access and scope notes are labeled publisher declarations. It explicitly distinguishes importing schemas from executing tools.
- Reviewer access separates seeded workspace setup, sign-in instructions, SSO/MFA/network restrictions, and execution steps. Changing those answers clears the testing confirmation. Credentials are not stored in draft text.
- Older browser drafts remain readable. Earlier free-text retention is preserved as a custom policy requiring review; missing new fields are left unanswered. Existing published snapshots are not replaced.

The retention choices and conditional controls are marketplace design proposals. Claude's documentation confirms the topics, not these exact controls.

Use official GitHub Primer React components, Primer theme tokens, and Octicons. The GitHub light theme is scoped to this route; other prototypes keep their VS Code visual language. Buttons, fields, selectors, checkboxes, status labels, and banners use Primer rather than locally styled substitutes.

The publisher fills the available width and height below the playground navigation. Route-scoped layout rules remove the catalog container's outer padding without changing other prototypes. Content retains its own internal spacing.

The playground navigation is a compact utility strip with 12px text and icons, unboxed links, and visible keyboard focus. This route matches the strip to its light header; other prototypes keep their dark shell. Touch targets expand on coarse pointers.

Product Narrative and demo context live in a small floating toolbar. No prototype banner or fictional-source labels interrupt the publisher surface.

## Patterns carried forward

- Keep the product narrative primary. A side-by-side competitor comparison made the experience feel like a research presentation rather than a product walkthrough.
- Show source-bound checks and an explicit fix path. A check result is not valid after its source changes.
- Preserve the live snapshot. Candidate edits, review requests, and failed updates must not change the public preview.
- Separate permission from preference. Automatic publishing is allowed only by the assigned review policy, never by publisher preference alone.
- Require private-source consent for inspection. Publication still needs public source, fresh validation, and approval.
- Give Verified review a finish. Record reviewer tool testing before approval; a Verified label alone is insufficient.

These are implemented interaction decisions, not claims of customer validation.

## Scenario

Northwind publishes Support Toolkit and its Helpdesk MCP connector.

```text
Repository discovery -> validate source -> fix finding -> complete submission
  -> review -> approve -> publish
  -> detect new revision -> failing check -> repair candidate -> publish replacement
```

Try a private source, a policy hold, a multi-URL connector requiring Verified review, and reviewer-controlled publication. The scanner and reviewer controls are explicitly simulations.

## Iteration notes

- The page is self-contained in this folder. The workflow model stays local so transitions and stored-data parsing remain separate from rendering.
- Load the publisher with Next.js client-only dynamic loading. Importing Primer during hydration triggered its focus-visible polyfill before the document root hydrated. Deferred loading avoids that mismatch and keeps localStorage reads in the browser.
- Drafts are origin-local. Existing drafts from the standalone preview remain on that origin; this port does not transfer or overwrite them.
- This port uses stable Primer React 38.42 rather than the current 39 release candidate.
- The original Vite prototype and regression suite remain in `github/digitarald-brain`, under `previews/github-marketplace`, at commit `629579d`. They are the reference baseline, not a dependency.
- Competitive context derives from the Claude Directory research captured in that repository and [Claude's publishing documentation](https://claude.com/docs/directory/publish). The GitHub flow is a proposal, not current product policy.
- Rechecked on October 27: [Submit a connector](https://claude.com/docs/connectors/building/submission) explicitly says tools, prompts, and resources sync from a connected server in the developer portal. It does not say Claude Code discovers them from a repository. [Lazy authentication](https://claude.com/docs/connectors/building/lazy-authentication) allows `initialize` and `tools/list` before sign-in when the server supports public metadata. [Testing guidance](https://claude.com/docs/connectors/building/testing) distinguishes metadata discovery from `tools/call` and requires populated reviewer accounts.
- Browser walkthroughs verified plugin fix-PR recovery, draft reload, publication, a failed update preserving the live version, and a Verified connector reaching publication. The 1440px and 390px layouts had no page overflow. Another prototype retained its dark theme. TypeScript, scoped lint, and static export passed.

## Open questions

1. Do publishers understand the distinction between an approved candidate and the live revision without explanation?
2. Should Product Narrative follow the active step on mobile or open as a separate presentation view?
3. Which release-trigger and publication-policy defaults best match maintainers' existing release practices?
4. How should publishers provide secure, time-limited reviewer access and prove that reviewers can reach the right tenant?
5. What listing assets, category choices, plan/pricing information, and supported-client declarations should be required before publication?

## Out of scope

- Real GitHub permission checks, source scans, pull requests, deployments, and publication.
- Live MCP connections, credential storage, multi-endpoint configuration, and asset uploads.
- Real telemetry. Usage and health numbers are explicitly sample data.
- Multiple listings of the same type, collaboration, or cross-origin draft transfer.
- Listing icon/screenshots, multiple categories, real OAuth client registration, production account ownership checks, detailed timeout/permission-denied recovery, and real run-by-run reviewer test evidence remain lower-fidelity areas. A passing demo is not evidence that these production prerequisites are configured.

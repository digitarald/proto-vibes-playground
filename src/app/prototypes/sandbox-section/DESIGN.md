# Sandbox Section: Configuration First - Design Doc

> **Status:** Early prototype
> **Last updated:** 2026-09-01

---

## Problem

Sandbox controls currently live in Copilot CLI. VS Code users need a discoverable place to configure process isolation and verify what the resulting sandbox can access. The editor must also distinguish sandbox limits from agent approval rules.

## Solution

Add Sandbox under Permissions in Agent Customizations. One scrolling page groups General, Authentication, Filesystem, and Network controls, followed by a read-only Effective policy section. Compact setting rows match the VS Code Settings editor. Custom path rules use inline editing with add and remove actions, while the policy shows the combined result of automatic grants, session paths, user settings, and managed policy.

---

## Open Questions

1. Does placing Effective policy below configuration make it too easy to miss?
2. Should automatic filesystem grants appear alongside editable path rules?
3. How much source attribution is useful before the policy becomes noisy?

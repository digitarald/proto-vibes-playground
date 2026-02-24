# Workflow

This playground is for rapid prototyping of VS Code features and UI concepts. Prototypes explore problems and specific features — new editor layouts, sidebar interactions, command palette variations, settings UIs, notification patterns, and other workbench surfaces. Think of each prototype as a design spike: fast, visual, disposable.

## Development Principles

1. **Design First, Ship Fast** — Go straight from idea to rendered UI. No tests, no migrations, no abstractions "for later." If it looks right in the browser, it's done.
2. **Be Creatively Bold** — No bland placeholders. Use motion, color, and interaction to make prototypes feel alive. The VS Code 2026 design tokens (see `design-system` skill) are guardrails, not the ceiling.
3. **Self-Contained, Zero Ceremony** — Each prototype is one folder (`meta.json` + `page.tsx`). No shared state, no cross-prototype imports. Inline what you need.

---
name: design-system
description: "VS Code 2026 design system tokens, palette, typography, and interaction patterns. Use when building or styling any UI in the playground."
---

# Design Guidelines — VS Code 2026 Theme

This project aligns with the **VS Code 2026** design system. All UI work should follow these guidelines for consistency.

Reference: https://github.com/microsoft/vscode/tree/main/extensions/theme-2026

## Color Palette

### Primary (Dark — active theme)

| Token | Value | Usage |
|---|---|---|
| `--background` | `#121314` | Editor / page background |
| `--chrome` | `#191A1B` | Sidebar, panel, nav chrome |
| `--card` | `#202122` | Widgets, popovers, cards |
| `--hover` | `#262728` | Hover state backgrounds |
| `--foreground` | `#bfbfbf` | Primary UI text |
| `--foreground-bright` | `#ededed` | Emphasized text, headings |
| `--muted` | `#8C8C8C` | Descriptions, secondary text, icons |
| `--border` | `#2A2B2C` | Borders, dividers |
| `--accent` | `#3994BC` | Primary accent (buttons, badges, links) |
| `--accent-hover` | `#3E9BC4` | Button hover state |
| `--accent-light` | `#3994BC26` | Selection backgrounds, focus rings |
| `--link` | `#48A0C7` | Hyperlinks |
| `--error` | `#f48771` | Error states |
| `--success` | `#73c991` | Added / success states |
| `--warning` | `#e5ba7d` | Warning states |

### Reference (Light — for future light mode)

| Token | Value | Usage |
|---|---|---|
| Background | `#FFFFFF` | Editor background |
| Chrome | `#FAFAFD` | Sidebar, panel, nav chrome |
| Card/Widget | `#F0F0F3` | Surfaces above background |
| Foreground | `#202020` | Primary text |
| Muted | `#606060` | Secondary text, descriptions |
| Border | `#EEEEF1` | Subtle dividers |
| Accent | `#0069CC` | Primary blue accent |
| Accent hover | `#0063C1` | Button hover |
| Link | `#0069CC` | Hyperlinks |

## Typography

- **Sans (body):** System font stack (`system-ui, -apple-system, …`) — all UI text
- **Mono (code):** System mono stack (`ui-monospace, SFMono-Regular, …`) — code snippets, file paths
- No display/serif fonts, no branded web fonts (e.g. Geist) — the 2026 aesthetic is minimal and vendor-neutral

### Hierarchy

- **Hero headings:** `font-size: 2.25rem; font-weight: 700; letter-spacing: -0.025em; color: var(--foreground-bright)`
- **Card headings:** `font-size: 1.25rem; font-weight: 500; color: var(--foreground)`
- **Labels:** `font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent)`
- **Body:** `font-size: 0.875rem; line-height: 1.625; color: var(--muted)` or `color: var(--foreground)`
- **Code:** `font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); background: var(--card); border-radius: var(--radius-sm); padding: 0.125rem 0.375rem`

## Depth System (Stealth Shadows)

The 2026 theme uses **soft, spread shadows** for depth instead of hard borders. This is the "stealth shadow" aesthetic — subtle, ambient shadows that provide hierarchy without visible edges.

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 0 4px rgba(0,0,0,0.08)` | Inputs, subtle cards |
| `--shadow-md` | `0 0 6px rgba(0,0,0,0.08)` | Sidebar, panel |
| `--shadow-lg` | `0 0 12px rgba(0,0,0,0.14)` | Popovers, dialogs |
| `--shadow-hover` | `0 0 8px rgba(0,0,0,0.12)` | Hover elevation |

### Corner Radii

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `4px` | Tags, small elements |
| `--radius-md` | `6px` | Cards, inputs |
| `--radius-lg` | `8px` | Dialogs, command palette, dropdowns |

## Translucency & Blur

The 2026 theme uses **backdrop blur with translucent backgrounds** for floating UI:

```css
/* Dark mode backdrop blur (includes brightness reduction) */
backdrop-filter: blur(20px) saturate(180%) brightness(0.55);

/* Translucent background pattern */
background: color-mix(in srgb, var(--card) 60%, transparent);
```

Use sparingly for:
- Navigation chrome: `background: color-mix(in srgb, var(--chrome) 80%, transparent); backdrop-filter: blur(8px)`
- Popovers and floating widgets
- Command palette style overlays

## Interaction Patterns

### Hover States

```css
/* Cards */
.card:hover {
  border-color: color-mix(in srgb, var(--accent) 30%, transparent);
  box-shadow: var(--shadow-lg);
}

/* Links / nav */
.link {
  color: var(--muted);
}
.link:hover {
  color: var(--foreground);
}

/* Accent links */
.accentLink {
  color: var(--accent);
}
.accentLink:hover {
  color: var(--accent-hover);
}
```

### Focus States

```css
.input:focus {
  border-color: color-mix(in srgb, var(--accent) 50%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent);
  outline: none;
}
```

- Focus border (keyboard): `#3994BCB3` (accent at 70% opacity)

### Selection
- Background: `#3994BC26` (accent at ~15% opacity)
- Text remains at full contrast

## Token Colors (Editor Syntax)

Key syntax colors from the 2026 Dark theme:

| Scope | Color | Example |
|---|---|---|
| Comment | `#6F9B60` | `// green-tinted gray` |
| Keyword | `#4F8FDD` | `const`, `return`, `if` |
| String | `#C48081` | `"hello"` |
| Function | `#D1D6AE` | `fetchData()` |
| Type/Class | `#48C9C4` | `Promise`, `HTMLElement` |
| Variable | `#90D5FF` | `userName` |
| Constant | `#4CBDFF` | `MAX_SIZE` |
| Control flow | `#C184C6` | `for`, `while`, `try` |
| Number | `#A8CAAD` | `42`, `3.14` |
| Operator | `#C5CCD6` | `=`, `+`, `===` |

## Icons (Codicons)

This project includes the full [VS Code Codicons](https://github.com/microsoft/vscode-codicons) icon font (~600 icons). The CSS is loaded globally.

Use the shared `Codicon` React component:

```tsx
import { Codicon } from "../../components/codicon";

<Codicon name="add" />
<Codicon name="settings-gear" style={{ color: 'var(--accent)' }} />
<Codicon name="loading" spin />
```

- Default size: `16px` (inherits from the codicon font). Scale with `font-size`.
- Color: inherits `currentColor` — style via CSS module class or inline `style`.
- Spin: pass `spin` prop for loading/sync/gear animations.
- Browse all icons: https://microsoft.github.io/vscode-codicons/dist/codicon.html

Common icons for VS Code prototypes:

| Icon | Name | Usage |
|---|---|---|
| `add` | Create / new | Buttons, actions |
| `close` | Dismiss | Close buttons, modals |
| `search` | Search | Search inputs |
| `settings-gear` | Settings | Preferences, config |
| `chevron-right` | Expand | Trees, accordions |
| `chevron-down` | Collapse | Trees, accordions |
| `file` | File | File trees |
| `folder` | Folder | File trees |
| `error` | Error | Status, diagnostics |
| `warning` | Warning | Status, diagnostics |
| `info` | Info | Status, tooltips |
| `check` | Success | Confirmations |
| `loading` | Loading | Spinners (use with `spin`) |
| `terminal` | Terminal | Terminal UI |
| `source-control` | Git | SCM views |
| `extensions` | Extensions | Extension UI |
| `account` | User | Profile, auth |

## Styling Approach

This project uses **CSS Modules** with CSS custom properties — no utility-class framework.

### Pattern

Each page/component has a co-located `.module.css` file:

```tsx
// page.tsx
import styles from './page.module.css';

export default function MyPage() {
  return <div className={styles.wrapper}>...</div>;
}
```

```css
/* page.module.css */
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.wrapper:hover {
  border-color: color-mix(in srgb, var(--accent) 30%, transparent);
  box-shadow: var(--shadow-lg);
}
```

### Shared base classes

Import `base.module.css` from `src/app/` for common layout:

```tsx
import base from '../../base.module.css';
import styles from './page.module.css';

<div className={base.page}>       {/* min-height: 100vh + background */}
  <nav className={base.nav}>      {/* chrome bar with backdrop blur */}
    <div className={base.container}> {/* centered max-width container */}
```

Available base classes: `page`, `nav`, `container`, `containerWide`, `card`.

### Opacity with color-mix

For translucent colors, use `color-mix`:

```css
background: color-mix(in srgb, var(--accent) 10%, transparent); /* 10% accent */
border-color: color-mix(in srgb, var(--accent) 30%, transparent); /* 30% accent */
```

## Do / Don't

### Do
- Use CSS custom properties (`var(--accent)`) in CSS Modules
- Use `color-mix(in srgb, ...)` for opacity variants
- Prefer shadows for depth over visible borders
- Keep contrast accessible — muted text (`#8C8C8C`) on dark backgrounds meets 4.5:1
- Use translucent chrome sparingly for navigation, not for content areas
- Co-locate `.module.css` files next to their component/page

### Don't
- Use Tailwind utility classes — this project uses CSS Modules
- Use warm/stone color palettes (`stone-*`, amber, `#d97706`)
- Use decorative or serif fonts
- Add hard drop shadows — use the soft spread shadow system
- Over-use color — the palette is restrained, with accent reserved for interactive elements
- Create global CSS classes — always use CSS Modules for scoping

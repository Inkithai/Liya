# Dark & Light Mode Text Visibility Fix

## Goal

Audit the entire Liya codebase and ensure that all text elements maintain sufficient contrast in both Light and Dark modes, complying with WCAG AA standards.

## User Review Required

[!IMPORTANT]
> Verify that the project uses a **theme provider** (e.g., `next-themes`) and that Tailwind’s `darkMode` is set to `"class"`. If a different theming solution is in use, let me know so I can adjust the plan.

## Open Questions

- Do you prefer to keep the existing custom CSS variables (`--foreground`, `--color-primary`, etc.) or migrate to a design‑token system?
- Are there any UI libraries (e.g., shadcn/ui) that already provide dark‑mode aware components which we should leverage instead of custom CSS?

## Proposed Changes

---
### Theme Configuration
- Verify `tailwind.config.ts` includes `darkMode: "class"`.
- Ensure `next-themes` (or equivalent) is installed and wrapped around the app in `app/layout.tsx`.
- Add missing CSS custom properties for dark mode (e.g., `--foreground-dark`).

---
### Global Styles (`app/globals.css`)
- Replace hard‑coded colors (`#dc2626`, `rgba(255,255,255,.16)`, etc.) with theme‑aware CSS variables or Tailwind utilities.
- Update `.bg-danger` and similar utility classes to use `bg-destructive` from the design tokens.
- Ensure `color: hsl(var(--foreground))` is paired with a dark‑mode fallback `color: hsl(var(--foreground-dark))` using the `.dark` selector.

---
### Component Audits
For each UI component folder, perform the following:
1. Search for any `color:` or `background-color:` declarations that use literal values.
2. Replace them with Tailwind classes (`text-muted-foreground`, `bg-primary`, `dark:text-primary-foreground`, etc.) or CSS variables.
3. Add `dark:` variants where needed.
4. Verify states (hover, focus, disabled) have appropriate contrast colors.

Key component directories:
- `components/` (buttons, cards, alerts, badges, etc.)
- `app/` pages (including `how-it-works/page.tsx`)
- Any custom UI library under `lib/` or `store/`.

---
### Accessibility Checks
- Install `axe-core` or use VS Code extension to run WCAG contrast checks.
- Add a script `npm run lint:accessibility` that runs `npm exec -- prettier --check . && npx @storybook/addon-a11y`.
- Update any failing instances based on the audit.

---
### Tests & Verification
- Add visual regression tests (e.g., Playwright) for both themes capturing screenshots of key pages.
- Run `npm run dev` and manually toggle theme to ensure no text disappears.
- Update CI to run the accessibility lint step.

## Verification Plan

### Automated Tests
- `npm run lint:accessibility`
- Playwright script `tests/theme-contrast.spec.ts` that switches themes and asserts that each visible text element has a computed contrast ratio >= 4.5.

### Manual Verification
- Open the app in a browser, toggle between Light and Dark using the theme switcher.
- Spot‑check all pages, especially forms, tables, dialogs, and code blocks.
- Validate that placeholder, disabled, and error texts are readable.

---

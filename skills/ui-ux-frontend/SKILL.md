---
name: ui-ux-frontend
description: Static reference for UI/UX decisions — a distinctiveness philosophy plus a sourced correctness checklist (accessibility, touch targets, layout, typography, forms, navigation, animation). Consulted by context-gather when establishing ui-tokens.md/ui-rules.md, and during UI builds for any pattern not yet covered by ui-registry.md. Never a source of truth itself.
---

This is a reference, not a workflow. It has no command, no state of its own, and nothing to run. It exists so that two moments in this project's lifecycle — deciding on design tokens, and building a UI pattern for the first time — draw on real design knowledge instead of whatever the model would default to unprompted.

## What This Is Not

- Not a replacement for `ui-tokens.md`, `ui-rules.md`, or `ui-registry.md`. Those three files are the actual source of truth for this project once they're written. This skill only informs the *first* decision — it never overrides a decision that's already been made and recorded.
- Not a design system generator. It doesn't propose a whole aesthetic on its own; it narrows the space of good answers and flags known failure modes so the interview in `context-gather` (and the developer) can make an informed call.
- Not enforced automatically on every message. Consult it at the two points below, then get out of the way.

## When To Use This

1. **`context-gather` Step 6** (UI Tokens & Rules) — before proposing hex values, type pairings, or layout rules, skim Part 1 and Part 2 below. Use them to make the proposal specific and defensible instead of generic.
2. **During a build**, when about to implement a UI pattern that isn't already described in `ui-registry.md` — check the relevant checklist category in Part 2 before writing the component. If the pattern *is* already in `ui-registry.md`, match that instead — the registry always wins, it reflects what's actually been built.

If neither applies, this skill has nothing to add to the current step.

---

## Part 1 — Distinctiveness

The default output of an unguided model clusters into a small number of recognizable looks: indigo-to-violet gradients on a dark background, a centered hero with a bold claim and two pill buttons, un-customized shadcn components left at their out-of-the-box styling, generic sans-serif everywhere, and rounded-xl cards with a soft shadow on every surface regardless of purpose. None of this is wrong exactly — it's just the visual equivalent of a filler word. It signals "AI built this" before anyone reads a word of content.

Counteract that with a few deliberate choices, decided once and recorded in `ui-tokens.md` / `ui-rules.md`:

- **A named palette, not a described one.** "A modern dark theme" is not a decision. Pick a specific hue and temperature — one accent color, cold/warm/neutral, with real hex values — and derive the rest of the scale from it rather than grabbing default Tailwind grays.
- **A deliberate type pairing.** Don't default to the system sans for everything. Pick a distinct voice for headings (even a well-chosen system font, deliberately sized and weighted) paired with a body font chosen for readability at the sizes actually used.
- **One signature element.** Something the interface does that a generic template wouldn't — a distinctive way of showing state, a particular motion on a key interaction, an unusual but functional layout choice for the single most important screen. Not on every component — one is enough to make it feel authored.
- **Density and whitespace matched to the product**, not maximal air by default. A dashboard needs different density than a marketing landing page; decide which this is before setting spacing tokens.

**Known slop patterns to name and avoid explicitly when proposing tokens:**
- Purple/blue gradient hero on a SaaS landing page as the default choice, absent a reason
- Every card using the same `rounded-xl` + soft-shadow combination regardless of hierarchy
- Centered-hero-with-emoji-icon as the default landing pattern
- Glassmorphism or neumorphism applied broadly rather than as one deliberate accent
- Default, unmodified component-library styling shipped as final

None of these are permanently off-limits — if the product genuinely calls for one, use it deliberately and say why in `ui-rules.md`. The point is a decision was made, not that the default was accepted.

---

## Part 2 — Correctness Checklist

Sourced from WCAG 2.2, Apple's Human Interface Guidelines, and Material Design. Each entry is a rule, not a suggestion — these are the ones worth checking before shipping a first instance of a pattern.

### Accessibility
- Text contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text (18pt+/14pt bold+) — WCAG 2.2 AA
- Never convey state (error, success, required) by color alone — pair with an icon or text label
- Every interactive element reachable and operable by keyboard, with a visible focus state — don't remove `:focus` outlines without replacing them
- Form inputs have a real, associated `<label>` — placeholder text is not a label
- Modals and overlays trap focus while open and return it to the triggering element on close; Escape closes; backdrop click closes unless the action is destructive or must be explicitly confirmed

### Touch Targets
- Minimum 44×44pt tappable area on touch interfaces (Apple HIG) / 48×48dp (Material) — pad the hit area even if the visible icon is smaller
- At least 8px spacing between adjacent tap targets to prevent mis-taps

### Layout
- Establish a spacing scale (e.g. 4/8/12/16/24/32/48/64) and stay on it — arbitrary one-off pixel values are how drift starts
- One primary action per screen/section, visually dominant; secondary actions visually subordinate
- Content max-width on large screens for readability (long line lengths hurt reading, not help it)

### Typography
- A defined type scale (not ad-hoc sizes per component) — cap it around 5–7 sizes for most products
- Body text minimum 16px on web to avoid mobile browsers auto-zooming on input focus
- Line height ~1.4–1.6 for body text, tighter for large headings

### Forms
- Inline validation on blur, not just on submit — don't make the user guess what they did wrong after the fact
- Errors specific and actionable ("Password needs a number", not "Invalid input")
- Preserve user input on validation failure — never clear a field because one other field was wrong

### Empty, Loading & Error States
- Empty state explains *why* it's empty and gives a clear next action — "No items found" alone is a dead end, not a state
- Loading feedback matches the shape of what's loading (skeleton matching the eventual layout, inline spinner for a partial update) rather than a generic full-page blocker for everything
- Error states are distinct from empty states — "something went wrong, retry" is a different message and a different action than "there's nothing here yet"

### Navigation
- Current location always indicated (active nav state, breadcrumb, page title) — don't make the user lose track of where they are
- Destructive actions require confirmation or are undoable — never a single accidental click from data loss
- Back/cancel always available from any multi-step flow

### Animation
- Respect `prefers-reduced-motion` — provide a reduced/no-motion path, don't assume everyone wants movement
- Motion used to communicate (state change, spatial relationship), not decoration for its own sake
- Keep transitions short (~150–300ms) for UI feedback; longer only for deliberate, rare moments

---

## Boundary

Once `ui-tokens.md`, `ui-rules.md`, or `ui-registry.md` record a decision, that decision is the one to follow — even where it disagrees with a default suggested here. This skill fills the gap before those files exist, and fills in for patterns those files don't cover yet. It doesn't relitigate settled decisions.

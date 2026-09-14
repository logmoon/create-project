---
name: context-gather
description: First-session gate. Fills the project's context files (project-overview, architecture, build-plan, code-standards, library-docs, ui-tokens, ui-rules, progress-tracker) through a structured interview before any other skill is allowed to run. Detects stub/placeholder content automatically and blocks /architect until every file is real.
---

A project cannot be built correctly on context that does not exist yet. This skill exists so that gap is closed first, automatically, instead of depending on the developer to run a separate setup ritual before opening the agent.

## Pre-flight Check

Read every file under `context/`. Scan each for placeholder comments (`<!-- ... -->` with no real content around them) or the template text shipped by `create-project`. If **no** file has placeholder content, skip this skill entirely — say nothing, do not acknowledge the check, proceed as though this skill doesn't exist. Only run the interview below if at least one required file is still a stub.

## When This Runs

If any required `context/*.md` file is still a stub at session start:

- Do not proceed to `/architect`, building, or any other skill.
- Tell the developer plainly: "Context isn't filled in yet — let's do that first," then run this skill.

If all required files already have real content, skip this skill entirely and behave normally — never re-run it on subsequent sessions.

## Your Role

You are a context architect for this one phase only. Your job is to extract what's needed to produce complete, unambiguous files that an agent can build from without guessing — not to write code, explore ideas, or answer unrelated questions yet.

**Operating principles:**

- Read everything the developer has already provided (rough notes, design docs, a single sentence) before asking anything. Never ask about something already answered.
- Ask one focused question at a time. Never list several at once.
- Push back on vague answers. "A modern design" is not an answer. "Dark background, white cards, purple accent" is.
- When a decision genuinely hasn't been made, mark it `TBD — [what needs deciding]` and move on. Don't block the whole session on one unknown.
- Produce a file as soon as you're confident in it. Don't keep asking past that point.

## The Files

| File | Always? | Purpose |
|---|---|---|
| `context/project-overview.md` | Yes | What, why, who, flows, scope |
| `context/architecture.md` | Yes | Stack, structure, boundaries, invariants |
| `context/build-plan.md` | Yes | Phased, numbered features with UI + Logic sub-tasks |
| `context/code-standards.md` | Yes | Language rules, naming, error handling, patterns |
| `context/library-docs.md` | Yes | Usage patterns for every third-party library |
| `context/ui-tokens.md` | UI only | Design tokens — colors, type, spacing, components |
| `context/ui-rules.md` | UI only | Layout, component rules, do-nots |
| `context/progress-tracker.md` | Yes | Checklist generated from build-plan.md |

`context/ui-registry.md` and `memory.md` stay empty shells — `imprint` and `remember` fill those during the build, not here.

## Step 0 — Read First, Ask Later

Build a mental model: what's being built, what's decided vs. open, what's obviously missing. Then open with a brief summary and the single most important clarifying question — not five.

If nothing is ambiguous, say so and move straight to Step 1.

## Step 1 — Project Overview

Fill `project-overview.md` completely: About the Project (one tight paragraph, no buzzwords), The Problem It Solves, Pages/Screens (or views/states for non-routed apps), Core User Flow (step by step), Features In Scope (flat list — if it's not here, it won't get built), Features Out of Scope (ask: "what are three things someone might expect this to do that it won't?"), Target User (a specific person, not "developers"), Success Criteria (verifiable, not aspirational).

No `<!-- placeholder -->` left anywhere. Unknowns get `TBD — [...]`, not silence.

## Step 2 — Architecture

Fill `architecture.md`: Stack table (specific tools, not categories — "PostgreSQL via Supabase," not "a database"), Folder structure with inline comments on every top-level folder, System boundaries (what each layer owns and must never do — the single most important section for preventing drift), Data flow (named flows, step by step), Database schema if applicable, Authentication if applicable, and 6–12 **Invariants** — flat-list rules the agent must never violate, specific to this project, aimed at the drift patterns most likely here. Generic platitudes don't count.

## Step 3 — Build Plan

Fill `build-plan.md` — the file that determines what gets built, in what order, and what done means. Structure: Core Principle (how features are ordered, one paragraph), then phases of numbered features (sequential across phases, never restarting at 01), each with UI tasks, Logic tasks, and a concrete, testable Exit Criterion ("create an entry, lock the vault, unlock it, the entry is still there" — not "it works"). UI before logic wherever a feature has both. Each feature sized to one agent session. Nothing from "Out of Scope" appears here.

## Step 4 — Code Standards

Fill `code-standards.md` with rules specific to this stack, not a generic style guide: Language (type system rules — strict mode, no `any`, etc., or the equivalent for the actual language), Framework Conventions, File/Folder Naming, Component/Module Structure, Error Handling (the actual pattern, not "use try/catch"), Environment Variables, Dependencies (the approved list, matching the stack table). Keep the pre-filled Engineering Mindset rules; add project-specific ones if relevant.

## Step 5 — Library Docs

For every library named in the stack table, give project-specific usage patterns and at least one code example in `library-docs.md`. Rules should be specific ("always call `x.close()` in a `finally` block"), not generic ("handle errors").

## Step 6 — UI Tokens & Rules (UI projects only)

If the `ui-ux-frontend` skill is installed, read it before proposing anything below — its distinctiveness guidance and correctness checklist exist specifically to make this step's proposals specific and defensible instead of generic ("a modern dark theme").

`ui-tokens.md`: every color a real hex value, every size a real pixel value — no "dark," no "TBD" here, make the decision. Typography table for every text level used. Component tokens for cards, buttons, inputs.

`ui-rules.md`: Layout, Navigation, Cards, Typography Hierarchy, Buttons, Forms, Empty States, and at least 5 project-specific **Do Nots**.

If a design already exists, extract real values from it — don't invent. If not, propose specific values ("one accent color — cold, warm, or neutral? Give me a direction" → then propose hex values to accept or adjust).

## Step 7 — Progress Tracker

Mechanical: convert every feature in `build-plan.md` into a checkbox under its phase, with current status, last completed, and next up. No questions needed.

## Quality Checks Before Calling Any File Done

- **project-overview.md** — every section has real content; Features In/Out of Scope are both flat and specific; Success Criteria are verifiable.
- **architecture.md** — stack table covers every technology in use; system boundaries state what each layer must never do; at least 6 invariants, specific to this project.
- **build-plan.md** — sequential numbering; every feature has UI + Logic (or a note why one doesn't apply) and an exit criterion; nothing oversized for one session.
- **code-standards.md** — matches the actual language and framework in use, not a generic template.
- **library-docs.md** — every stack-table library has a section, each with a real example.
- **ui-tokens.md / ui-rules.md** (if UI) — every color is a hex value; Do Nots has 5+ real, specific entries.

## When This Skill Is Done

Tell the developer plainly that context is filled, list anything left as `TBD`, and hand off:

```
Context is filled in. Open decisions still marked TBD:
- [list, or "none"]

Ready to start — run /architect when you have a feature in mind.
```

From here on, this skill stays dormant unless a context file regresses to a stub (e.g. the developer deletes one, or scaffolds a new phase that needs new files).

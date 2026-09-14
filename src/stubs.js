// Stub content for files create-project writes into every scaffold.
// Filled in for real by the context-gather skill on the agent's first session
// — see skills/context-gather/SKILL.md.

export const STUBS = {
  'memory.md': `# Memory

_Written by \`/remember save\` at the end of a session. A compact form of this is auto-injected at
the start of the next one by \`.opencode/plugin/memory-hook.js\`; read in full by \`/remember restore\`.
For durable project status — what's done, what's pending — see \`context/progress-tracker.md\`.
This file only covers what that one doesn't: exactly where a resumed session should pick up._

---

## Active Feature

<!-- Auto-filled by /remember save -->

Branch: <!-- current git branch, if any -->

## Session Phase

<!-- planning / building / reviewing / closing -->

## Next Action

<!-- The exact next step to take when resuming -->

## Decisions & Problems Not Yet Elsewhere

<!-- Only what isn't already captured in a context file or spec -->

## Open Questions

<!-- Anything unresolved that needs addressing -->
`,

  'memory-log.md': `# Memory Log

_Compact history of past sessions, appended by \`/remember save\`. Not auto-injected at session
start — read this on request, or via \`/remember restore\` when the auto-restore summary isn't
enough. Capped at the last 20 entries; oldest entries drop off as new ones are added._

---

<!-- Newest entry at the top. One entry per session, a few lines each — not a transcript. -->
`,

  'progress-tracker.md': `# Progress Tracker

_Read this at the start of every session before doing anything else. Keep it current as you build — it is a live reference, not a closing checklist. Also auto-injected by the memory hook._

---

## Status

| Phase | Status |
|---|---|
| Phase 1 — Foundation | 🔲 Not started |

---

## In Progress

<!-- What is actively being built right now — update as you go -->

---

## Done

<!-- Completed features — move items here when finished -->

---

## Up Next

<!-- Next 1-3 things to build, in order -->

---

## Blocked

<!-- Anything blocked and why -->
`,

  'ui-registry.md': `# UI Registry

_Written by \`/imprint\` after building any UI component. Read this before building a new one — never duplicate a pattern that already exists here._

---

## Components

<!-- /imprint will add entries here -->
`,

  'project-overview.md': `# Project Overview

## About the Project

<!-- What is this, who is it for, what problem does it solve -->

---

## The Problem It Solves

<!-- Why does this need to exist -->

---

## Pages / Screens

<!-- List all routes or screens -->

---

## Core User Flow

<!-- Step by step: how does a user get value from this app -->

---

## Features In Scope

<!-- Explicit list of what IS being built -->

---

## Features Out of Scope

<!-- Explicit list of what is NOT being built — prevents scope creep -->

---

## Target User

<!-- Who specifically is this for -->

---

## Success Criteria

<!-- How do you know when this is done and working -->
`,

  'architecture.md': `# Architecture

## Stack

| Layer | Tool | Purpose |
|---|---|---|
| | | |

---

## Folder Structure

\`\`\`
/
\`\`\`

---

## System Boundaries

| Folder | Owns |
|---|---|
| | |

---

## Data Flow

<!-- Describe the main data flows through the system -->

---

## Invariants

Rules the AI agent must never violate:

-
`,

  'build-plan.md': `# Build Plan

## Core Principle

<!-- How features are ordered and why -->

---

## Phase 1 — Foundation

### 01 [Feature Name]

**UI:**

-

**Logic:**

-

**Exit criteria:** <!-- How do you verify this is done -->

---
`,

  'code-standards.md': `# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception.

---

## Engineering Mindset

- Think before implementing
- Read context files first — never assume
- Scope is sacred — only build what the current feature requires
- Every feature must be immediately testable
- One thing at a time

---

## Language

<!-- Type system rules, what is and isn't allowed -->

---

## Framework Conventions

<!-- Framework-specific rules -->

---

## File and Folder Naming

<!-- Conventions -->

---

## Component / Module Structure

<!-- Order of imports, types, exports -->

---

## Error Handling

<!-- How errors are caught, logged, surfaced -->

---

## Testing

<!-- Framework, how tests are run, what must have coverage — or state plainly
     that this project skips automated tests, so /test knows not to reach for
     itself unprompted -->

---

## Environment Variables

| Variable | Used In |
|---|---|
| | |

---

## Dependencies

<!-- Approved list — nothing added without updating this -->
`,

  'ui-tokens.md': `# UI Tokens

Design tokens for this project. Use these everywhere — never hardcode values or use raw framework color classes.

---

## Colors

### Accent / Brand

<!-- Primary brand color and variants -->

### Backgrounds

<!-- Page, card, input backgrounds -->

### Text

<!-- Primary, secondary, muted -->

### Status

<!-- Success, warning, error, info -->

### Borders

<!-- Border colors -->

---

## Typography

| Element | Size | Weight | Color |
|---|---|---|---|
| | | | |

---

## Spacing

<!-- Standard scale -->

---

## Component Tokens

### Cards
\`\`\`
background:
border:
border-radius:
padding:
\`\`\`

### Buttons
\`\`\`
primary background:
primary text:
secondary background:
secondary border:
\`\`\`

### Inputs
\`\`\`
background:
border:
focus ring:
\`\`\`
`,

  'ui-rules.md': `# UI Rules

Rules for building UI in this project. Must stay consistent across every component and every session.

---

## Layout

<!-- Max width, padding, grid, section gaps -->

---

## Navigation

<!-- Structure, active states -->

---

## Cards

<!-- Standard card appearance -->

---

## Typography Hierarchy

<!-- Each level: size, weight, color, usage -->

---

## Buttons

<!-- Primary and secondary rules -->

---

## Forms

<!-- Input appearance, labels, error states -->

---

## Empty States

<!-- Every emptied section must have one -->

---

## Do Nots

-
`,

  'library-docs.md': `# Library Docs

Project-specific usage patterns for every third-party library. Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

1. Check if an MCP server or built-in subagent is configured for docs lookup — use it if available
2. Read this file for project-specific patterns
3. Fall back to official documentation only if neither of the above apply

---

<!-- Add a section per library as you introduce them -->
`,
};

export function writeStub(writeFileSync, destPath, content) {
  writeFileSync(destPath, content.trim() + '\n');
}

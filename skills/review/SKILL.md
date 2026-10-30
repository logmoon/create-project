---
name: review
description: After building a feature, verify it matches what was planned, respects the system architecture and design standards, and is ready for production. Reviews the diff and reports issues clearly so the developer decides what to fix.
---

## Hard rule

Reviewing is reporting. Never fix what you find. If you want to fix something, report it and stop — the primary session waits to be asked; the reviewer never waits.

---

Building is not done when the code runs. It is done when the code is correct.

AI moves fast. Fast means things get built that work on the surface but drift from the architecture, violate the design system, or miss edge cases that matter. This skill catches those things before they compound into bigger problems.

Run this after every feature. Before you move on.

## Run With Fresh Eyes

Do not review in the same session that built the feature — the session that just wrote the code is biased toward believing it is correct, and its context is already full of its own reasoning. Dispatch this project's `reviewer` subagent (defined in `opencode.json`; it cannot edit or write, and its bash access is a read-only git allowlist). Invoke with `@reviewer`.

The reviewer already has every context file in its instructions and can read the repo. Hand it a compact brief, not a copy of the codebase:

- **Goal and plan decisions** — a short summary of what was planned, the key decisions, and acceptance criteria. Not the full plan transcript.
- **Diff range and changed files** — e.g. `git diff main...HEAD`, or `git diff` for uncommitted work. Include untracked files.
- **Risk flags and test result** — note if the change touches auth, payments, migrations, permissions, or has non-obvious control flow; include the test command/result if `/test` ran.

Do not paste context files, full source files, or the whole diff — the reviewer reads what it needs.

After a fix, judge confidence before re-reviewing. A small, local fix verified by tests or a build/typecheck, touching no architecture, data flow, or invariant, does not need a second review — report what changed and what verified it. Otherwise send only the new diff for one re-review; run a full feature review only if the fix changes architecture, data flow, or another invariant. The loop is capped at two review rounds: if the re-review still finds issues, report them and stop. No third round unless the developer explicitly asks for one.

The primary session waits for the subagent's report and relays it — it does not review its own work. The reviewer reports and returns; it never asks a question or waits for the developer.

## Scope

Review the diff, not the repository. A review that tours unrelated files costs time and finds noise. Start with `git status` and `git diff --stat`, read the full diff, then read only the changed files and the specific sections they depend on.

Stop once every changed hunk is accounted for. If the diff is empty, there is nothing to review.

## Depth

Depth is earned by the diff. A small, mechanical change gets a quick pass; go deeper where a mistake is expensive (auth, payments, migrations, permissions), where a judgment is uncertain, or where the diff is large or has non-obvious control flow. Verify uncertain claims against the code; don't report a hedge as a finding.

Do not re-run layers or manufacture issues to look thorough — a clean diff gets a clean report.

## What This Skill Does Not Do

It does not fix anything. It reports what it finds and lets the developer decide what matters and what to do about it. Fixing without understanding is how problems get buried, not solved.

---

## Step 1 — Understand What Should Have Been Built

Establish the benchmark from the brief:

- The plan's goal, decisions, and acceptance criteria
- The feature description or task
- The relevant rules in the context files — architecture boundaries, code standards, design rules

If the brief is missing the goal, the primary asks the developer before dispatching. The reviewer reports the missing context as a blocker instead of waiting for an answer.

---

## Step 2 — Review the Diff in Three Layers

Work the three layers against the diff. If a layer has nothing to check because the diff doesn't touch it, mark it PASS and move on — don't go looking for something to fill it.

### Layer 1 — Does the diff match the plan?

Compare what was built against what was planned.

Check:

- Every part of the feature description — is it all there?
- The decisions made during planning — are they reflected in the code?
- The scope — did the implementation stay within bounds or add things that were not asked for?

Flag anything that was planned but missing. Flag anything that was built but not planned.

### Layer 2 — Does the diff respect the system?

This is where AI drift most commonly happens. The feature works, but it violates rules that the project depends on.

Check:

- **Architecture boundaries** — does code in the right place own the right responsibilities? No UI logic in API routes. No DB calls in components. Whatever the project's boundaries are — are they respected?
- **Design system** — are the correct tokens, classes, and patterns used? Any hardcoded values that should be variables? Any raw color classes that should use the design system?
- **Code standards** — naming conventions, file organisation, TypeScript strictness, error handling patterns — do they match what the project established?
- **Existing patterns** — does this feature introduce a new pattern when an existing one should have been used?

### Layer 3 — Is the diff production ready?

Check:

- Error handling — what happens when things go wrong? Are errors caught and handled or does the feature silently fail?
- Edge cases — empty states, loading states, missing data — are these handled?
- Obvious bugs — anything that would clearly break for a real user?
- Tests — if `context/code-standards.md` establishes this project uses tests, were they written for this change, and do they pass? Report the gap if `/test` was skipped, without fixing it yourself.

The reviewer cannot run the app or the test suite — report only what the code shows, not speculation about runtime behaviour.

---

## Step 3 — Report What You Found

After completing all three layers, produce a clear report. Do not bury issues. Do not soften them. Report honestly so the developer can make informed decisions.

For a clean diff, one line is enough:

```
No issues found — [feature] is ready to ship.
```

For issues:

```
## Review — [Feature Name]

### Layer 1 — Plan alignment
[PASS / ISSUES FOUND]
[List any gaps between what was planned and what was built]

### Layer 2 — System integrity
[PASS / ISSUES FOUND]
[List any architecture, design, or code standard violations]

### Layer 3 — Production readiness
[PASS / ISSUES FOUND]
[List any error handling gaps, edge cases, or obvious bugs]

### Summary
[X] issues found across [Y] layers.

Resolve the above before moving to the next feature.
```

Don't expand empty layers to look thorough.

---

## Step 4 — Let the Developer Decide

This step belongs to the primary session. The reviewer returns its report immediately.

After presenting the report, stop. Do not start fixing. Do not suggest fixes unless the developer asks.

Wait for the developer to:

- Ask you to fix a specific issue
- Tell you an issue is intentional and can be ignored
- Confirm the remaining findings are acceptable and the feature is ready to move on

When they ask for fixes, fix only those and stop at the two-round cap above — the goal is an informed developer, not a clean report at any cost.

The developer owns the quality decision. You inform it.

---

## Severity Guide

Not all issues are equal. Use this to help the developer prioritise:

**Critical — fix before moving on**

- Architecture boundary violations that will break future features
- Missing error handling that causes silent failures
- Functionality that was planned but completely missing

**Important — fix soon**

- Design system drift that will cause UI inconsistency
- Code standard violations that will compound across the codebase
- Edge cases that a real user will encounter

**Minor — fix when convenient**

- Naming inconsistencies that do not affect behaviour
- Missing optimisations
- Style issues that do not affect the design system

Label each issue with its severity so the developer can triage quickly.

---

## The Standard

The question this skill answers is not "does it work?"

The question is "is it correct?"

Working and correct are not the same thing. A feature can work today and break the project tomorrow. Review exists to catch the difference.

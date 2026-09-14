---
name: test
description: Write and run tests for a change just made, or verify existing tests still pass. Reached for automatically once context/code-standards.md establishes that this project uses tests — during building, before /review, and at the end of /debug — or any time on direct request.
---

A change without a test only proves it worked once, for you, right now. This skill exists so "it
works" and "it's tested" stop being two different sentences.

This is a skill, not a gate — it doesn't need a confirmation to run. It's a normal part of doing
the work, the same way reading the relevant code before editing it is.

## When To Reach For This

- **Automatically**, once `context/code-standards.md`'s Testing section establishes this project
  uses tests — after building a feature, before `/review`.
- **Automatically**, at the end of `/debug`, when a fix is confirmed and worth locking in.
- **Any time** the developer asks directly, regardless of what code-standards.md says.

If `code-standards.md` has no Testing section, or it says this project skips automated tests, do
not run this unprompted — only on direct request. Don't invent a testing setup a project hasn't
opted into.

## Step 1 — Know What You're Testing

Read `context/code-standards.md`'s Testing section for the framework, conventions, and how tests
are run here. Use what the project already uses — don't introduce a new framework or pattern.

Identify what actually needs coverage: the behaviour just built or fixed, and the failure modes
that would matter if it broke. Not every possible input — the ones that matter.

## Step 2 — Write Tests That Would Fail Without the Change

A test that passes with or without the fix proves nothing. Before finishing, check: would this
test have failed against the old code? If unsure, verify it — reason through the change and
confirm the test actually exercises it, or check against the prior state directly if that's fast.

## Step 3 — Run Them

Run the suite, or at minimum the new/changed tests, and read the actual output. Don't assume
green. A test that doesn't compile or run isn't a passing test.

## Step 4 — Report

```
Tests: [N added/updated], [pass/fail].
[One line on what's covered, or what isn't and why.]
```

If something genuinely can't be tested this way (a visual change, an external side effect), say
so — don't fake coverage with a trivial assertion just to show a green check.

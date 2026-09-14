---
name: document
description: Draft a changelog entry, PR description, or short release note for a change, pulled from what actually happened — the plan, the diff, and /review's findings. Offered at the Close-out Gate, and usable any time mid-session the work calls for it.
---

Code that ships without a record of why is a mystery for whoever reads it next — including you,
next session. This turns a finished change into a short, honest written record.

This is a skill, not a gate — it doesn't need a confirmation to run. Use it whenever the work calls
for it, not only when offered at close-out.

## When To Reach For This

- **Offered at the Close-out Gate**, alongside `/remember save` and distill.
- **Any time mid-session** the work calls for it — a notable fix, a decision worth a changelog
  line, a feature substantial enough that a bare commit message would lose the reasoning. Use it
  without waiting to be asked.

## Step 1 — Pick the Right Shape

Infer which of these fits, or ask if it's not obvious — say which you picked either way:

- **Changelog entry** — one or two lines: what changed, why it matters to someone using the project.
- **PR description** — what changed, why, how it was tested, anything a reviewer needs to know.
- **Release note** — user-facing, no implementation detail.

## Step 2 — Write From What Actually Happened

Pull from the plan, the diff, and `/review`'s findings — not from memory of what was intended.
State what changed, not the process of building it. A changelog entry gets none of the
implementation detail a PR description gets; a release note gets neither.

## Step 3 — Hand It Off

Show the draft. This is text for the developer to use, not a file this skill writes on its own
authority. If `CHANGELOG.md` already exists, offer to append to it — otherwise just present the
draft.

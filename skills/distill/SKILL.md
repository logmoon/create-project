---
name: distill
description: At the end of a session, after /remember save, check whether anything that just happened is worth turning into a reusable skill or improving an existing one. Proposes a diff and waits for explicit approval before writing anything — never creates or edits a skill unprompted.
---

Sessions repeat things: a debugging path that took real effort to find, a workflow step that had to be explained because no skill covered it, a pattern that will obviously come up again on this project. Right now that knowledge dies with the session. This skill catches it before it's lost — without ever acting on its own.

## Hard Rule

This skill never writes a skill file by itself. It always stops at a proposal and waits for the developer to say yes. Treat this the same way `/review` treats fixes: report, don't act.

## When To Run

Offered by `/remember save` after memory is written, or run directly any time. Skip it if nothing from the session meets the bar below — most sessions don't produce a new skill, and saying so is a fine outcome.

## Step 1 — Look For Distillable Material

Ask, honestly, about this session:

- Did a debugging path take more than a couple of attempts to find, in a way that would help next time if written down?
- Did the developer have to explain a workflow step, convention, or preference that isn't covered by an existing skill or `code-standards.md`?
- Did a pattern get used more than once in this project that isn't documented anywhere?
- Would an existing skill (`architect`, `remember`, `review`, `recover`, `imprint`, `ui-ux-frontend`, `context-gather`) have done this better if it had one more instruction in it?

If none of these apply, say so and stop:

```
Nothing from this session rises to a new or updated skill. Moving on.
```

## Step 2 — Decide: New Skill or Edit an Existing One

Prefer editing an existing skill over creating a new one if the material is a refinement of something that skill already half-covers. Only propose a new skill when the behavior is genuinely a distinct, repeatable procedure — not a one-off fact that belongs in `memory.md` or a context file instead.

If it's really just project knowledge (a fact, a decision, a gotcha) — it belongs in `library-docs.md`, `architecture.md`, or `memory.md`, not a skill. Skills are procedures; context files are facts. Don't blur the two.

## Step 3 — Propose the Diff

Show the developer exactly what would change, before changing anything:

```
## Proposed skill change — [new: <name> / edit: <existing skill name>]

**Why:** [what happened this session that justifies this]

**Diff:**
[the actual SKILL.md content for a new skill, or the specific section being
added/changed for an existing one — shown in full, not summarized]

Save this? (yes / no / edit first)
```

## Step 4 — Wait

- **yes** — write the file under `.opencode/skills/<name>/SKILL.md` (new) or apply the edit (existing). Confirm: `Saved. Available next session.`
- **no** — discard the proposal. Do not save a draft anywhere.
- **edit first** — let the developer dictate changes, then re-show the diff and ask again. Do not save until an explicit yes.

## Keep Skills Honest

A new skill needs the same frontmatter discipline as the rest of this project's skills: `name` and a `description` specific enough to trigger reliably and that doesn't overlap with what an existing skill already claims. If two skills would fire on the same situation, that's a conflict — flag it in the proposal instead of silently creating one anyway.

# Skill-Writing Conventions

A skill file loads in full whenever it's triggered. Every line in it is a cost paid on every one
of those runs — so every line needs to earn that cost. This is the bar for writing one, and for
reviewing a `distill` proposal against.

## A line must change what the agent does

Cut encouragement the model already does by default: "be careful," "be thorough," "make sure to."
These read like advice, not instruction — they don't change what happens differently on the page.
If a sentence could be deleted without the agent behaving any differently, delete it.

Global disposition — sharp, fast, token discipline — lives once in `AGENTS.md`'s Working Mode
section and in subagent prompts. A skill that needs to calibrate effort states what earns depth
and what doesn't; it doesn't restate the disposition as encouragement.

## Reasoning belongs in the commit, not the skill

The *why* behind a design choice in this repo belongs in a commit message, not a paragraph in the
skill body. Skills describe what to do now, not the history of how the instructions got here.

## Don't duplicate a context file

If something is true project knowledge — a fact, a decision, a convention — it belongs in a
`context/*.md` file, not repeated in a skill. Skills are procedures; context files are facts. A
skill can *reference* a context file's section; it shouldn't restate it.

## Completion messages: headline, next, heads-up if real, pointer

When a skill reports back, lead with the headline, state the next action, mention a blocker only
if one actually exists, and point at the file with full detail rather than inlining it. Skip the
checklist-of-yeses pattern (`Semantic HTML: correct`, `Keyboard nav: correct`) — a list of things
that are fine is noise, not signal. Only report what's notable.

## Frontmatter discipline

Every skill needs `name` and a `description` specific enough to trigger reliably and that doesn't
overlap with what another skill already claims. If a new skill's description could just as easily
describe an existing one, that's a conflict to resolve, not two skills to ship.

## Check it

If this repo has a skill-lint script — check `package.json` for a `check` script — run it before
finalizing a new or edited skill. It's advisory, the same way the gates in `AGENTS.md` are for the
agent: it tells you where you're off, it doesn't fail your build for you.

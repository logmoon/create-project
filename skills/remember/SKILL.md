---
name: remember
description: Save what matters at the end of a session so the next session picks up exactly where you left off, in memory.md — plus a compact rolling log of past sessions in memory-log.md. Or restore context at the start of a new session so nothing is lost between them.
---

AI has no memory between sessions. Every new session starts blank. This skill fixes that.

Run it at the end of a session to save. Run it at the start of a new session to restore. That is all it does — but done consistently, it means nothing ever gets lost.

## Auto-Restore Note

This project's `.opencode/plugin/memory-hook.js` injects a compact restore summary at the start of
every session — `memory.md` plus just the "In Progress" and "Up Next" sections of
`context/progress-tracker.md`, not its full history — and instructs the agent to open with a
restore-checkpoint: summarise what was restored and wait for the developer to confirm before doing
anything else. That checkpoint is the same thing `/remember restore` does manually below — it now
happens automatically, every session, without the developer needing to type the command. The hook
also runs a deterministic check comparing the branch recorded in `memory.md` against the branch the
repo is actually on, and flags it if they don't match — no LLM judgment involved, just a heads-up.

`/remember restore` still exists for when the auto-restore checkpoint isn't enough — a session
ended abnormally, the summary looks incomplete, or the developer wants the full cross-checked read
including `memory-log.md` and the other context files listed in Step 2 below.

## Security Boundary

This skill must never persist secrets. If any sensitive value appears in the conversation or context, do not copy it to `memory.md` or `memory-log.md`.

Sensitive data includes (non-exhaustive):

- API keys, access tokens, refresh tokens, session tokens
- Passwords, passphrases, one-time codes, private keys, certificates
- Cookies, auth headers, connection strings, webhook secrets
- Any credential-like value or secret-looking string

If a detail is useful but sensitive, store a redacted placeholder instead (for example: `[REDACTED_API_KEY]`).
If unsure whether something is sensitive, treat it as sensitive and omit or redact it.

## How to Invoke

**To save at end of session:**

```
/remember save
```

**To restore at start of new session:**

```
/remember restore
```

If the developer just runs `/remember` without specifying — ask them which one they need.

---

## Save Mode

When the developer runs `/remember save`:

### Two files, two jobs

`memory.md` is the live continuity file — it only holds what a resumed session needs and can't get
from `context/progress-tracker.md`: the exact next step and anything not yet written down anywhere
durable. It gets **overwritten** each save; it is never a history.

`memory-log.md` is the history. A short, append-only digest — one entry per session — for when
someone actually needs to know what happened three sessions ago. It is not auto-injected, so it
costs nothing on the common path.

Do not put the same fact in both. If it's durable project status, it belongs in
`progress-tracker.md`, not either memory file.

### What goes in memory.md

Think like someone handing off to a colleague who is equally skilled but knows nothing about today. What do they need to not start cold?

**Active Feature** — what's being worked on, and the current git branch (run `git branch --show-current` if this is a git repo; write `(no git repo)` if not).

**Session Phase** — planning / building / reviewing / closing.

**Next Action** — the very next concrete step. Specific enough to start immediately.

**Decisions & Problems Not Yet Elsewhere** — only things not already captured in a context file or spec. If it's in `architecture.md` or `code-standards.md` already, leave it out here.

**Open Questions** — anything unresolved the next session needs to address.

### What goes in memory-log.md instead

The things a colleague wouldn't need to *resume* work, but that are worth not losing entirely — what got built, what broke and how it got fixed, anything genuinely surprising. Write one compact entry:

```markdown
### [date] — [feature/session name]

[2-4 lines: what was built or fixed, and the outcome. Not a transcript — the kind of thing worth remembering happened, not how it happened.]
```

Prepend it above the most recent existing entry. If the log now has more than 20 entries, drop the oldest ones until it's back to 20.

### What not to capture (either file)

- Implementation details that are visible in the code
- Decisions already documented in a context file
- Anything that can be inferred by reading the codebase
- The process of how something was built — only what was built and what was decided
- Any secrets or credential-like values (tokens, keys, passwords, cookies, auth headers, connection strings)

### Safety check before writing

Before writing either file, run a final pass over the content to ensure no sensitive value is present.

- If sensitive content is found, remove or redact it before writing.
- Keep only the minimal non-sensitive context needed to continue next session.

### Where to save

Write to `memory.md` in the project root; append to `memory-log.md` alongside it.

If `memory.md` already exists, show the developer a brief summary of what is currently saved and ask for confirmation before overwriting:

Step 1 — Read `memory.md`, provide the one-line summary, and stop to wait for developer input:

```
memory.md already exists from a previous session.
Current memory covers: [one-line summary of existing content].

Overwrite with this session's memory? (yes / no)
```

Step 2 — After the developer responds:

- If they say **yes**, write the new `memory.md` and append the `memory-log.md` entry (trimming to 20 if needed).
- If they say **no**, do not write anything and reply:

```
No changes made. memory.md is unchanged.
```

### Format

```markdown
# Memory

## Active Feature

[What's being worked on]

Branch: [current git branch, or "(no git repo)"]

## Session Phase

[planning / building / reviewing / closing]

## Next Action

[The very first thing to do in the next session — specific and actionable]

## Decisions & Problems Not Yet Elsewhere

[Only what isn't already captured in a context file]

## Open Questions

[Anything unresolved that needs addressing]
```

After writing both files, confirm to the developer:

```
Memory saved to memory.md. Logged to memory-log.md.

Next session: the auto-restore hook will surface this automatically. Run /remember restore any time you want the full picture, including history.
```

Then check whether anything from this session is worth turning into a skill — see `distill`. If a pattern repeated, a debugging path was non-obvious, or a workflow step had to be explained that isn't covered by an existing skill, say so and offer to run `/distill`. Do not run it automatically — propose it, then wait.

After distill (or if nothing to distill), read `memory.md` for the "Next Action" and close the session:

```
Session complete. Start a fresh session and say '[next action]' to continue.
```

---

## Restore Mode

When the developer runs `/remember restore` at the start of a new session:

### Step 1 — Find the memory

Look for `memory.md` in the project root. If it does not exist, tell the developer:

```
No memory.md found in this project.

Either this is the first session, or the file was not saved.
To save memory at the end of a session, run /remember save.
```

### Step 2 — Read everything available

Read `memory.md` and `memory-log.md` first, then check for these specific context files if they exist and read only those:

- `CLAUDE.md`, `.claude/context.md` — Claude Code
- `.github/copilot-instructions.md` — GitHub Copilot
- `.cursorrules`, `.cursor/rules/` — Cursor
- `.windsurfrules` — Windsurf
- `AGENTS.md` — Codex
- `.clinerules` — Cline
- `context.md` — generic fallback

Do not scan or read other files beyond this list. Build the most complete picture possible from what is available.

When restoring, never repeat or surface raw secrets from any source. If a secret appears in restored context, summarise it in redacted form only.

### Step 3 — Confirm what was restored

Do not start building. Do not assume the developer wants to continue immediately. Summarise what was restored so the developer can verify Claude understood correctly.

```
Memory restored. Here is where we are:

**Active feature:** [what's being worked on, and branch]
**Session phase:** [planning / building / reviewing / closing]
**Decisions in place:** [key decisions not yet in a context file]
**Next up:** [what the next session should start with]

Is this correct? Say yes to continue, or correct anything
that does not look right before we proceed.
```

Only after the developer confirms does the session continue.

### If memory is incomplete or unclear

If `memory.md` exists but is missing important context, say so honestly:

```
I found memory.md but some context seems missing —
[what is unclear or absent].

Should we continue with what we have, or do you want
to fill in the gaps before we start?
```

Do not guess. Do not assume. Surface the gap and let the developer decide.

---

## The Rule

Every session ends with `/remember save`.
Every session starts with `/remember restore`.

That is the whole system. Consistent use is what makes it work.
A skill used sometimes is a skill that cannot be relied on.

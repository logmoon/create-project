# AGENTS.md — py1

This file is read first by any AI coding agent. It defines the skills available in this project and how to use them.

---

## Skills

| Skill | When | Purpose |
|---|---|---|---|
| `context-gather` | First session, automatically | Fills context files before anything else can run |
| `/architect` | Before building any feature | Think through decisions before touching code |
| `/remember save` | End of every session | Compress session state into memory.md |
| `/remember restore` | Start of a session, on demand | Full restore + confirmation — the auto-restore hook covers the common case |
| `/review` | After building any feature | Dispatched to `@reviewer` — a read-only subagent that verifies correctness, not just that it works |
| `/recover` | When something breaks | Diagnose failure mode before attempting fixes |
| `/imprint` | After the user confirms a UI feature is done | Capture visual patterns to ui-registry.md |
| `distill` | Offered after `/remember save` | Proposes a new/updated skill from this session — never saves without approval |

---

## Session Protocol

**Clarify before correcting.** If the user's response suggests you misunderstood them — short or ambiguous answers like "wdym", "no", "that's not right" — do not guess what went wrong. Ask: "What part of my last response was wrong?" Identify the actual issue before changing course. This applies across all phases.

Before planning: if any `context/*.md` file is still a stub (first session), run `context-gather` first. This check is silent — do not mention it unless context is actually missing. At most once per project.

### Phase 1 — Planning

**Scope discipline.** Do not pre-plan or schedule future features beyond what the user is asking about right now. The build plan and progress tracker describe the project's scope — they are reference material, not a todo list for the current session. Only work on what the user explicitly asks for.

1. The memory hook has injected a start-of-session note at the top of this session. If it contains a restore summary, confirm it with the user before proceeding. If it says "Fresh session. Ready.", no checkpoint is needed. Either way, run `/remember restore` if you need the full cross-checked picture or if a prior session ended abnormally.
2. Run `/architect` — think through the feature before touching code. Present the plan and wait for explicit approval before proceeding
3. After the user approves the plan, if the project has a git repo, ask: "Should I create a feature branch for this? (e.g. feat/<feature-name>)" If yes, run `git checkout -b feat/<feature-name>` before building

Do not write any code until the user has explicitly approved the plan.

### Phase 2 — Building

1. Build the feature
2. Run `/review` — dispatch `@reviewer` (read-only by config, can't edit/write/bash) with the plan, the relevant context files, and the diff. Do not review your own work in the same session that built it. Report findings and stop — never fix what you find
3. Wait for the user to test and confirm. The user may report issues or request fixes — make only what they ask for and re-run `/review` as needed. Repeat until the user explicitly says they are satisfied
4. When the user confirms they are satisfied, prompt them: "Ready to close out the session? I'll commit the work, run /imprint, /remember save, and propose distill if anything's worth keeping." Wait for their confirmation before proceeding
5. If the project has a git repo, stage and commit the work: `git add -A && git commit -m "feat: <description>"`. If you created a feature branch for this work, switch back to the main branch, merge, and delete the feature branch: `git checkout main && git merge <branch-name> && git branch -d <branch-name>`
6. Run `/imprint` to capture UI patterns to ui-registry.md
7. Update `context/progress-tracker.md` — reference it throughout the session as a live tracker, not a closing afterthought. Read it at the start of the build and keep it current as you go
8. Run `/remember save`
9. Consider `distill` — if anything from this session is worth turning into a skill, propose it. Never save without explicit approval
10. Tell the user the session is complete and prompt them to start a new session. Read the "Next Action" from `memory.md` and suggest what to say: "Session complete. Start a fresh session and say '[next action]' to continue."

### Definition of Done

A feature is only done when:
- `/review` has run via a fresh subagent, all issues are resolved, and the **user has explicitly confirmed they are satisfied**
- `/remember save` has run
- `context/progress-tracker.md` reflects current state

After building, run `/review` and **stop** — report findings, never fix. Wait for the user to test and direct you. Do not close out until the user explicitly confirms they are satisfied. When they do, prompt before running close-out steps.

---

## Context Files

| File | Purpose |
|---|---|
| `context/project-overview.md` | What this is, who it's for, core user flows |
| `context/architecture.md` | Stack, folder structure, system boundaries, invariants |
| `context/build-plan.md` | Phased feature list — numbered, ordered, with sub-tasks |
| `context/progress-tracker.md` | Live checklist — what's done, in progress, next |
| `context/code-standards.md` | Naming, structure, error handling, patterns |
| `context/library-docs.md` | Project-specific usage patterns for every third-party library. Context7 + @scout are configured — fetch live docs automatically before using any library. |
| `context/ui-tokens.md` | Design tokens — all colors, spacing, typography. Never hardcode values. |
| `context/ui-rules.md` | Layout, component patterns, do-nots |
| `context/ui-registry.md` | Living record of built components — read before building any new one |

---

## Library Docs — Context7 + Scout

This project has Context7 configured as an MCP server, alongside OpenCode's built-in `@scout` subagent. They do different things — use both, in this order:

1. **Context7 first** — fast, indexed, version-specific documentation. Resolve the library, then fetch docs:
   `mcp__context7__resolve-library-id({ libraryName: "..." })` then `mcp__context7__get-library-docs({ context7CompatibleLibraryId: "...", topic: "..." })`
2. **`@scout` when Context7 doesn't have it, or the question is about actual behavior** Context7's index won't cover — `@scout` clones the dependency and reads the real source.

Do this automatically before writing code against any third-party library you haven't used yet in this project — do not wait to be asked.

---

## Order of Authority

```
memory.md + progress-tracker → architecture.md invariants → code-standards.md → library-docs.md → general knowledge
```

Never rely on general training knowledge for library APIs — they change.

---

## Invariants

_See `context/architecture.md` — Invariants section._

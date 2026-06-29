# create-project

Scaffolds an OpenCode-first project with structured agent context, automatic memory, and a vendored set of skills — so a coding agent produces consistent, high-quality work across an entire project instead of forgetting everything between sessions.

This is not a project generator in the usual sense. It doesn't pick a framework or write boilerplate code. It sets up the *operating system* an AI agent works inside of: what it knows, what it's allowed to assume, how it remembers, and what it has to check before calling something done.

## Install

```bash
npm install
npm link        # or: npm install -g .
```

## Use

```bash
create-project my-app
cd my-app && opencode
```

You'll be asked three questions (UI? Context7? git?). After that, just start talking to the agent — there's no separate setup step.

## What gets created

```
my-app/
  AGENTS.md                  ← read by the agent first, every session
  opencode.json               ← config: instructions, permissions, the reviewer subagent
  memory.md                   ← last session's state (empty until first /remember save)
  context/
    project-overview.md       ← what this is, who it's for, scope
    architecture.md           ← stack, structure, invariants
    build-plan.md             ← numbered, ordered features
    progress-tracker.md       ← live checklist
    code-standards.md         ← naming, error handling, conventions
    library-docs.md           ← per-library usage patterns
    ui-tokens.md / ui-rules.md / ui-registry.md   (UI projects only)
  .opencode/
    plugin/memory-hook.js     ← auto-restore at session start
    skills/                   ← context-gather, architect, remember, review, recover, imprint, distill
```

Every `context/*.md` file starts as a stub. Nothing gets built on stub content — see Phase 0 below.

## The workflow, end to end

### Phase 0 — Context Gate (once per project)

The first time you open the project, every `context/*.md` file is still a placeholder. The agent notices this itself and runs an interview — one question at a time, pushing back on vague answers — until every file has real, specific content (or an explicit `TBD` where a decision genuinely hasn't been made yet). Nothing else happens until this is done.

### Every session after that

1. **You open `opencode`.** The memory hook has already injected the last session's `memory.md` + `progress-tracker.md` before your message even lands. The agent's first reply summarizes what was restored and asks you to confirm before doing anything else — that's the checkpoint, it happens automatically every time.
2. **You say what to build next**, or just confirm the plan already in `progress-tracker.md`.
3. **`/architect`** — the agent thinks the feature through, presents a plan, and waits for your explicit approval. No code gets written before this.
4. **The agent builds it.**
5. **`/review`** — automatically dispatched to `@reviewer`, a separate subagent with a clean context window and no permission to edit, write, or run commands. It can only report issues, never fix them. This is deliberate: the session that just wrote the code is the worst judge of whether it's correct.
6. **You test it.** This is the one step that can't be automated — you actually try the thing.
7. **If you're satisfied**, the agent automatically: captures UI patterns to `ui-registry.md` (if relevant), updates `progress-tracker.md`, and runs `/remember save` (asking to confirm before overwriting if memory already exists).
8. **`distill`** — the agent checks whether anything from the session (a hard-won debugging path, a recurring pattern) is worth turning into a new or improved skill. It proposes a diff; nothing is ever saved without you explicitly approving it.
9. **Close the session.** Next time you open it, go back to step 1.

### What's manual vs. automatic

Across a full feature cycle, you make exactly three calls: approve the `/architect` plan, confirm the build actually works, and approve/decline any `distill` proposal. Everything else — restore checkpoint, review dispatch, imprint, tracker updates, memory save — the agent runs on its own, because it's written into `AGENTS.md` as required protocol, not left to memory or good intentions.

## The skills

| Skill | Runs | Job |
|---|---|---|
| `context-gather` | First session, automatically | Fills context files before anything else can run |
| `/architect` | Before building a feature | Plan before code, get explicit approval |
| `/remember save` / `restore` | End / start of session | Compress and restore session state |
| `/review` | After every feature | Dispatched to `@reviewer` — reports, never fixes |
| `/recover` | When something breaks | Diagnose the failure type before attempting a fix |
| `/imprint` | After confirmed UI work | Capture visual patterns so future components match |
| `distill` | After `/remember save` | Propose a new/improved skill, gated on approval |

Skills live in `skills/` in this repo and get copied (not live-cloned) into every scaffolded project's `.opencode/skills/`. They're a deliberate fork of [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills), edited to match this workflow — edit them here, not upstream, and re-diff manually if you ever want to pull something new from there.

## Options

- **UI** — adds `ui-tokens.md`, `ui-rules.md`, `ui-registry.md`, and the `/imprint` skill.
- **Context7** — adds the Context7 MCP server for fast, indexed library docs. Complements OpenCode's built-in `@scout` subagent (which reads live upstream source) rather than replacing it — the agent's told to try Context7 first, fall back to `@scout`.
- **git** — `git init` + initial commit.

## Why this exists

The common failure mode with AI coding agents isn't that they write bad code in any single turn — it's drift across a project: forgotten decisions, inconsistent UI, re-litigated architecture, context that has to be re-explained every session. This tool's job is to make the *boring infrastructure* (memory, context, review discipline) automatic, so the agent can focus on the actual work and you don't have to be the one holding all the state in your head between sessions.

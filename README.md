# create-project

Scaffolds an OpenCode-first project with structured agent context, automatic memory, and a vendored set of skills — so a coding agent produces consistent, high-quality work across every session instead of forgetting everything between them.

It doesn't pick a framework or write boilerplate code. It sets up the *operating system* an AI agent works inside of: what it knows, what it's allowed to assume, how it remembers, and what it has to check before calling something done.

## Shoutout

Huge shoutout to [JS Mastery](https://jsmastery.com/), this project is a more refined and focused take on the system he lays out in [How Senior Engineers Actually Build with AI in 2026](https://www.youtube.com/watch?v=9dKA2hq4vf0&t=78s) (but basically the same idea and philosophy). The skills in this repo are forked from his [JS Mastery Skills](https://github.com/JavaScript-Mastery-Pro/skills), edited and updated to match this specific workflow.

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
    progress-tracker.md       ← live checklist — keep it current as you build
    code-standards.md         ← naming, error handling, conventions
    library-docs.md           ← per-library usage patterns
    ui-tokens.md / ui-rules.md / ui-registry.md   (UI projects only)
  .opencode/
    plugin/memory-hook.js     ← auto-restore at session start
    skills/                   ← context-gather, architect, remember, review, recover, imprint, ui-ux-frontend, distill
```

Every `context/*.md` file starts as a stub. Nothing gets built on stub content — see Phase 0 below.

## The workflow, end to end

### Phase 0 — Context Gate (once per project)

The first time you open the project, every `context/*.md` file is still a placeholder. The agent notices this itself and runs an interview — one question at a time, pushing back on vague answers — until every file has real, specific content (or an explicit `TBD` where a decision genuinely hasn't been made yet). Nothing else happens until this is done.

### Every session after that

1. **Auto-restore.** The memory hook injects the last session's `memory.md` + `progress-tracker.md` before your message lands. The agent's first reply summarises what was restored and asks you to confirm before doing anything else.

2. **You say what to build.** The agent works on exactly what you ask for — it doesn't pre-plan features from the build plan or treat the progress tracker as a todo list.

3. **`/architect`.** The agent thinks the feature through, presents a plan with key decisions, and waits for your explicit approval. No code gets written before this.

4. **Feature branch (opt-in).** If the project has a git repo, the agent asks whether you want a feature branch (e.g. `feat/tenant-onboarding`). Say yes or no — either way, building starts after your answer.

5. **Build.** The agent builds the feature. For any UI pattern not already in `ui-registry.md`, it checks `ui-ux-frontend` first (UI projects only) instead of improvising.

6. **`/review`.** Automatically dispatched to `@reviewer` — a fresh subagent with a clean context window and no permission to edit, write, or run commands. It can only report issues, never fix them. It reports findings and **stops**. The session that wrote the code is the worst judge of whether it's correct, so it never reviews its own work.

7. **You test.** You try the feature. Report issues, request fixes, re-run `/review` as needed. The agent fixes only what you ask for. Repeat until you're satisfied.

8. **Close-out prompt.** When you say "good" / "done" / "I'm satisfied", the agent asks: *"Ready to close out? I'll commit the work, run /imprint, /remember save, and propose distill."* You confirm before anything happens.

9. **Close-out.** The agent runs in order: git commit (with merge if on a feature branch), `/imprint` (if UI was built), updates `progress-tracker.md`, runs `/remember save` (asking before overwriting if memory exists), and proposes `distill` if anything from the session is worth turning into a skill.

10. **Next session.** The agent tells you the session is complete and suggests what to say when you start a fresh one: *"Session complete. Start a fresh session and say '…' to continue."*

### What's manual vs. automatic

Across a full feature cycle, you make four calls: approve the `/architect` plan, confirm the build works, confirm the close-out prompt, and approve or decline any `distill` proposal. Everything else — restore checkpoint, feature branch question, review dispatch, git commit, imprint, tracker updates, memory save — the agent runs on its own because it's written into `AGENTS.md` as required protocol, not left to memory or good intentions.

## The skills

| Skill | Runs | Job |
|---|---|---|
| `context-gather` | First session, automatically | Fills context files before anything else can run |
| `/architect` | Before building a feature | Plan before code, get explicit approval |
| `/remember save` / `restore` | End / start of session | Compress and restore session state |
| `/review` | After every feature | Dispatched to `@reviewer` — reports, never fixes |
| `/recover` | When something breaks | Diagnose the failure type before attempting a fix |
| `/imprint` | After confirmed UI work (UI projects only) | Capture visual patterns so future components match |
| `ui-ux-frontend` | context-gather Step 6, and before new UI patterns (UI projects only) | Reference-only: distinctiveness guidance + sourced correctness checklist |
| `distill` | After `/remember save` | Propose a new or improved skill, gated on approval |

Skills live in `skills/` in this repo and get copied into every scaffolded project's `.opencode/skills/`. Most are a fork of [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills), edited to match this workflow — edit them here, not upstream. `ui-ux-frontend` is original to this repo: a trimmed, dependency-free reference (no CLI, no database, no persistence of its own) drawing on WCAG/HIG/Material Design guidance and general UI/UX distinctiveness principles — deliberately kept out of the business of owning state, since `ui-tokens.md` / `ui-rules.md` / `ui-registry.md` already do that job.

## Scaffold options

- **UI** — adds `ui-tokens.md`, `ui-rules.md`, `ui-registry.md`, and the `imprint` and `ui-ux-frontend` skills.
- **Context7** — adds the Context7 MCP server for fast, indexed library docs. Complements OpenCode's built-in `@scout` subagent (which reads live upstream source) rather than replacing it — the agent's told to try Context7 first, fall back to `@scout`.
- **git** — `git init` + initial commit.

---

## Why this exists

The common failure mode with AI coding agents isn't that they write bad code in any single turn — it's drift across a project: forgotten decisions, inconsistent UI, re-litigated architecture, context that has to be re-explained every session. This tool's job is to make the *boring infrastructure* (memory, context, review discipline, git, session protocol) automatic, so the agent can focus on the actual work and you don't have to be the one holding all the state in your head between sessions.

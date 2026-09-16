# AGENTS.md

## Project

create-project is a CLI that scaffolds an OpenCode-first project — context files, automatic
session memory, skill templates, and a generated `AGENTS.md` / `opencode.json`. It doesn't pick a
framework or write app code; it sets up the operating system an agent works inside of.

What ships to scaffolded projects lives in `src/generators/` (AGENTS.md, opencode.json, memory
plugin), `skills/` (skill templates, copied into every project), `plugin/memory-hook.js`, and
`src/stubs.js`. `bin/create-project.js` is the entry point.

## Setup and commands

```
Install:          npm install
Run:              node bin/create-project.js <project-name>
Scaffold test:    node bin/create-project.js /tmp/opencode/scaffold-test
Lint (skills):    npm run check
Test:             none — no test suite in this repo
```

## Conventions

- Skill files follow `docs/conventions.md` — run `npm run check` (advisory) after editing.
- `skills/` and `src/generators/` are the product: editing a skill here changes every future
  scaffold. `docs/conventions.md` is copied into scaffolded projects as `.opencode/conventions.md`.
- This repo has no `.opencode/` of its own — the workflow those files describe is for scaffolded
  projects, not for working on this tool.

## Working discipline

Be thorough, smart and sharp. Work fast, don't get lost in thought, and keep token usage low
without degrading quality - quality comes first, so spending more is fine when it actually buys a
better answer; doing it by default is not. Search before reading, never re-read what's already in
context, scope diffs with `git diff --stat` before opening them, and stop when the ask is done.

// Skills always installed — the foundation. context-gather and distill are
// not user-toggleable; they're load-bearing for the rest of the workflow.
export const CORE_SKILLS = ['context-gather', 'architect', 'remember', 'review', 'recover', 'distill'];
// Optional, conditional on project shape.
export const OPTIONAL_SKILLS = ['imprint'];

export function generateAgentsMd(projectName, hasUI, selectedSkills, useContext7) {
  const has = (s) => selectedSkills.includes(s);

  const skillRows = [
    '| `context-gather` | First session, automatically | Fills context files before anything else can run |',
    has('architect') ? '| `/architect` | Before building any feature | Think through decisions before touching code |' : null,
    has('remember')  ? '| `/remember save` | End of every session | Compress session state into memory.md |\n| `/remember restore` | Start of a session, on demand | Full restore + confirmation — the auto-restore hook covers the common case |' : null,
    has('review')    ? '| `/review` | After building any feature | Dispatched to `@reviewer` — a read-only subagent that verifies correctness, not just that it works |' : null,
    has('recover')   ? '| `/recover` | When something breaks | Diagnose failure mode before attempting fixes |' : null,
    has('imprint')   ? '| `/imprint` | After the user confirms a UI feature is done | Capture visual patterns to ui-registry.md |' : null,
    has('distill')   ? '| `distill` | Offered after `/remember save` | Proposes a new/updated skill from this session — never saves without approval |' : null,
  ].filter(Boolean).join('\n');

  const context7Section = useContext7 ? `\n## Library Docs — Context7 + Scout\n\nThis project has Context7 configured as an MCP server, alongside OpenCode's built-in \`@scout\` subagent. They do different things — use both, in this order:\n\n1. **Context7 first** — fast, indexed, version-specific documentation. Resolve the library, then fetch docs:\n   \`mcp__context7__resolve-library-id({ libraryName: "..." })\` then \`mcp__context7__get-library-docs({ context7CompatibleLibraryId: "...", topic: "..." })\`\n2. **\`@scout\` when Context7 doesn't have it, or the question is about actual behavior** Context7's index won't cover — \`@scout\` clones the dependency and reads the real source.\n\nDo this automatically before writing code against any third-party library you haven't used yet in this project — do not wait to be asked.\n\n---\n` : `\n## Library Docs — Scout\n\nUse OpenCode's built-in \`@scout\` subagent to fetch live dependency documentation and inspect upstream source before using any third-party library. Do this automatically when about to write code against a library you haven't used yet in this project.\n\n---\n`;

  const libraryDocsRow = `| \`context/library-docs.md\` | Project-specific usage patterns for every third-party library. ${useContext7 ? 'Context7 + @scout are configured — fetch live docs automatically before using any library.' : '@scout is available — fetch live docs automatically before using any library.'} |`;

  const uiFiles = hasUI ? `| \`context/ui-tokens.md\` | Design tokens — all colors, spacing, typography. Never hardcode values. |
| \`context/ui-rules.md\` | Layout, component patterns, do-nots |
| \`context/ui-registry.md\` | Living record of built components — read before building any new one |` : '';

  // ── Planning phase ──────────────────────────────────────────────────────────
  const planningSteps = [];
  let planNum = 1;
  planningSteps.push(`${planNum++}. The memory hook has injected a start-of-session note at the top of this session. If it contains a restore summary, confirm it with the user before proceeding. If it says "Fresh session. Ready.", no checkpoint is needed. Either way, run \`/remember restore\` if you need the full cross-checked picture or if a prior session ended abnormally.`);
  if (has('architect')) {
    planningSteps.push(`${planNum++}. Run \`/architect\` — think through the feature before touching code. Present the plan and wait for explicit approval before proceeding`);
  } else {
    planningSteps.push(`${planNum++}. Think through the feature. Present the approach and wait for explicit approval before proceeding`);
  }
  planningSteps.push(`${planNum++}. After the user approves the plan, if the project has a git repo, ask: "Should I create a feature branch for this? (e.g. feat/<feature-name>)" If yes, run \`git checkout -b feat/<feature-name>\` before building.`);

  // ── Building phase ───────────────────────────────────────────────────────────
  const buildingSteps = [];
  let buildNum = 1;

  buildingSteps.push(`${buildNum++}. Build the feature`);
  if (has('review')) {
    buildingSteps.push(`${buildNum++}. Run \`/review\` — dispatch \`@reviewer\` (read-only by config, can't edit/write/bash) with the plan, the relevant context files, and the diff. Do not review your own work in the same session that built it. Report findings and stop — never fix what you find.`);
    buildingSteps.push(`${buildNum++}. Wait for the user to test and confirm. The user may report issues or request fixes — make only what they ask for and re-run \`/review\` as needed. Repeat until the user explicitly says they are satisfied.`);
  }
  // Close-out prompt — agent asks before proceeding
  buildingSteps.push(`${buildNum++}. When the user confirms they are satisfied, prompt them: "Ready to close out the session? I'll commit the work, run${hasUI && has('imprint') ? ' /imprint,' : ''} /remember save, and propose distill if anything's worth keeping." Wait for their confirmation before proceeding.`);
  buildingSteps.push(`${buildNum++}. If the project has a git repo, stage and commit the work: \`git add -A && git commit -m "feat: <description>"\`. If you created a feature branch for this work, switch back to the main branch, merge, and delete the feature branch: \`git checkout main && git merge <branch-name> && git branch -d <branch-name>\`.`);
  if (hasUI && has('imprint')) {
    buildingSteps.push(`${buildNum++}. Run \`/imprint\` to capture UI patterns to ui-registry.md`);
  }
  buildingSteps.push(`${buildNum++}. Update \`context/progress-tracker.md\` — reference it throughout the session as a live tracker, not a closing afterthought. Read it at the start of the build and keep it current as you go.`);
  if (has('remember')) {
    buildingSteps.push(`${buildNum++}. Run \`/remember save\``);
  }
  if (has('distill')) {
    buildingSteps.push(`${buildNum++}. Consider \`distill\` — if anything from this session is worth turning into a skill, propose it. Never save without explicit approval`);
  }
  // End-of-session prompt
  buildingSteps.push(`${buildNum++}. Tell the user the session is complete and prompt them to start a new session. Read the "Next Action" from \`memory.md\` and suggest what to say: "Session complete. Start a fresh session and say '[next action]' to continue."`);

  const protocolSection = `## Session Protocol

**Clarify before correcting.** If the user's response suggests you misunderstood them — short or ambiguous answers like "wdym", "no", "that's not right" — do not guess what went wrong. Ask: "What part of my last response was wrong?" Identify the actual issue before changing course. This applies across all phases.

Before planning: if any \`context/*.md\` file is still a stub (first session), run \`context-gather\` first. This check is silent — do not mention it unless context is actually missing. At most once per project.

### Phase 1 — Planning

**Scope discipline.** Do not pre-plan or schedule future features beyond what the user is asking about right now. The build plan and progress tracker describe the project's scope — they are reference material, not a todo list for the current session. Only work on what the user explicitly asks for.

${planningSteps.join('\n')}

Do not write any code until the user has explicitly approved the plan.

### Phase 2 — Building

${buildingSteps.join('\n')}
${has('review') || has('remember') ? `
### Definition of Done

A feature is only done when:
${has('review') ? '- `/review` has run via a fresh subagent, all issues are resolved, and the **user has explicitly confirmed they are satisfied**' : ''}
${has('remember') ? '- `/remember save` has run' : ''}
- \`context/progress-tracker.md\` reflects current state

After building, run \`/review\` and **stop** — report findings, never fix. Wait for the user to test and direct you. Do not close out until the user explicitly confirms they are satisfied. When they do, prompt before running close-out steps.` : ''}`;

  return `# AGENTS.md — ${projectName}

This file is read first by any AI coding agent. It defines the skills available in this project and how to use them.

---

## Skills

| Skill | When | Purpose |
|---|---|---|
${skillRows}

---

${protocolSection}

---

## Context Files

| File | Purpose |
|---|---|
| \`context/project-overview.md\` | What this is, who it's for, core user flows |
| \`context/architecture.md\` | Stack, folder structure, system boundaries, invariants |
| \`context/build-plan.md\` | Phased feature list — numbered, ordered, with sub-tasks |
| \`context/progress-tracker.md\` | Live checklist — what's done, in progress, next |
| \`context/code-standards.md\` | Naming, structure, error handling, patterns |
${libraryDocsRow}
${uiFiles}

---
${context7Section}
## Order of Authority

\`\`\`
memory.md + progress-tracker → architecture.md invariants → code-standards.md → library-docs.md → general knowledge
\`\`\`

Never rely on general training knowledge for library APIs — they change.

---

## Invariants

_See \`context/architecture.md\` — Invariants section._
`;
}

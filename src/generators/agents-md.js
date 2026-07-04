// Skills always installed — the foundation. context-gather and distill are
// not user-toggleable; they're load-bearing for the rest of the workflow.
export const CORE_SKILLS = ['context-gather', 'architect', 'remember', 'review', 'recover', 'distill'];
// Optional, conditional on project shape.
export const OPTIONAL_SKILLS = ['imprint', 'ui-ux-frontend'];

export function generateAgentsMd(projectName, hasUI, selectedSkills, useContext7) {
  const has = (s) => selectedSkills.includes(s);

  const skillRows = [
    '| `context-gather` | First session, automatically | Fills context files before anything else can run |',
    has('architect') ? '| `/architect` | Before building any feature | Think through decisions before touching code |' : null,
    has('remember')  ? '| `/remember save` | End of every session | Compress session state into memory.md |\n| `/remember restore` | Start of a session, on demand | Full restore + confirmation — the auto-restore hook covers the common case |' : null,
    has('review')    ? '| `/review` | After building any feature | Dispatched to `@reviewer` — a read-only subagent that verifies correctness, not just that it works |' : null,
    has('recover')   ? '| `/recover` | When something breaks | Diagnose failure mode before attempting fixes |' : null,
    has('imprint')   ? '| `/imprint` | After the user confirms a UI feature is done | Capture visual patterns to ui-registry.md |' : null,
    has('ui-ux-frontend') ? '| `ui-ux-frontend` | During context-gather Step 6, and before building any UI pattern not yet in ui-registry.md | Reference-only: distinctiveness guidance + sourced correctness checklist. Never overrides ui-tokens.md/ui-rules.md/ui-registry.md |' : null,
    has('distill')   ? '| `distill` | Offered after `/remember save` | Proposes a new/updated skill from this session — never saves without approval |' : null,
  ].filter(Boolean).join('\n');

  const context7Section = useContext7 ? `\n## Library Docs — Context7 + Scout\n\nThis project has Context7 configured as an MCP server, alongside OpenCode's built-in \`@scout\` subagent. They do different things — use both, in this order:\n\n1. **Context7 first** — fast, indexed, version-specific documentation. Resolve the library, then fetch docs:\n   \`mcp__context7__resolve-library-id({ libraryName: "..." })\` then \`mcp__context7__get-library-docs({ context7CompatibleLibraryId: "...", topic: "..." })\`\n2. **\`@scout\` when Context7 doesn't have it, or the question is about actual behavior** Context7's index won't cover — \`@scout\` clones the dependency and reads the real source.\n\nDo this automatically before writing code against any third-party library you haven't used yet in this project — do not wait to be asked.\n\n---\n` : `\n## Library Docs — Scout\n\nUse OpenCode's built-in \`@scout\` subagent to fetch live dependency documentation and inspect upstream source before using any third-party library. Do this automatically when about to write code against a library you haven't used yet in this project.\n\n---\n`;

  const libraryDocsRow = `| \`context/library-docs.md\` | Project-specific usage patterns for every third-party library. ${useContext7 ? 'Context7 + @scout are configured — fetch live docs automatically before using any library.' : '@scout is available — fetch live docs automatically before using any library.'} |`;

  const uiFiles = hasUI ? `| \`context/ui-tokens.md\` | Design tokens — all colors, spacing, typography. Never hardcode values. |
| \`context/ui-rules.md\` | Layout, component patterns, do-nots |
| \`context/ui-registry.md\` | Living record of built components — read before building any new one |` : '';

  // ── Session Gates ────────────────────────────────────────────────────────────
  // One definition of "gate" used once here, then referenced by name in the
  // Phase 1/2 steps below instead of being re-explained at each occurrence.
  const gateRows = [
    has('architect') ? '| **Architect Gate** | Before any code is written for a feature | The developer has explicitly approved the plan produced by `/architect`\'s own Step 5 format — not any other implementation summary the agent writes itself |' : null,
    has('review')    ? '| **Review Gate** | After a feature is built, before it\'s considered done | `/review` has been dispatched to `@reviewer`, findings relayed, and the developer has said the feature is satisfactory |' : null,
    '| **Close-out Gate** | After the developer confirms satisfaction | The developer has explicitly confirmed the close-out prompt — commit, imprint, tracker update, `/remember save`, distill proposal all happen only after this |',
    '| **Session-Scope Gate** | Whenever a new feature is requested | The current feature has passed the Close-out Gate, or the developer has explicitly said to override the one-feature-per-session rule |',
  ].filter(Boolean).join('\n');

  const sessionGatesSection = `## Session Gates

A gate is a point in this protocol where work must stop until the developer gives an explicit
answer to the specific question the agent asked — not any affirmative reply to a nearby question.
A gate is not advisory. If it hasn't been passed, nothing on the other side of it happens, no
matter how confident the plan seems or how simple the feature looks.

**Passing a gate requires two things:**
1. The agent asks a single-purpose question that can only resolve one way — never bundled with a
   feature-selection question, a status update, or anything else.
2. The developer's reply directly answers that question. "Yep" to "should I begin there?"
   confirms the *feature*, not the plan — the agent still has to ask the gate question separately.

**If asked to skip ahead of a gate** — e.g. told to start a new feature before the current one has
closed out — state which gate hasn't been passed and ask whether to close out first or override
this once. Never comply silently.

**A gate cannot be passed in advance.** Approval-sounding language given before the gate's artifact
exists — "go for it," "sounds good, do it" before an architect plan or review report has actually
been produced — doesn't count, no matter how enthusiastic. Produce the artifact first, then ask.

| Gate | Opens | Passes when |
|---|---|---|
${gateRows}

None of these are satisfied by: an affirmative reply to a different question, a passing build, or
a plan-shaped answer produced outside the named skill's own procedure.`;

  // ── Planning phase ──────────────────────────────────────────────────────────
  const planningSteps = [];
  let planNum = 1;
  planningSteps.push(`${planNum++}. The memory hook has injected a start-of-session note at the top of this session. If it contains a restore summary, confirm it with the user before proceeding. If it says "Fresh session. Ready.", no checkpoint is needed. Either way, run \`/remember restore\` if you need the full cross-checked picture or if a prior session ended abnormally.`);
  if (has('architect')) {
    planningSteps.push(`${planNum++}. **Architect Gate** — run \`/architect\`, in full, even when the feature looks trivial and no real decisions surface. The skill still runs through its own steps and still ends in "Blueprint ready" + its formatted plan — never substitute an ad hoc numbered list for that format.`);
  } else {
    planningSteps.push(`${planNum++}. Think through the feature. Present the approach and wait for explicit approval before proceeding`);
  }
  planningSteps.push(`${planNum++}. After the user approves the plan, if the project has a git repo, ask: "Should I create a feature branch for this? (e.g. feat/<feature-name>)" If yes, run \`git checkout -b feat/<feature-name>\` before building.`);

  // ── Building phase ───────────────────────────────────────────────────────────
  const buildingSteps = [];
  let buildNum = 1;

  buildingSteps.push(`${buildNum++}. Build the feature${hasUI && has('ui-ux-frontend') ? '. For any UI pattern not already described in ui-registry.md, consult the ui-ux-frontend skill first — otherwise match what ui-registry.md already records' : ''}`);
  if (has('review')) {
    buildingSteps.push(`${buildNum++}. **Review Gate** — dispatch \`@reviewer\` (read-only by config, can't edit/write/bash) with the plan, the relevant context files, and the diff. Do not review your own work in the same session that built it. Report findings and stop — never fix what you find. This gate does not pass on a clean build; it passes only once the developer says the feature is satisfactory.`);
    buildingSteps.push(`${buildNum++}. Wait for the user to test and confirm. The user may report issues or request fixes — make only what they ask for and re-run \`/review\` as needed. Repeat until the user explicitly says they are satisfied.`);
  }
  // Close-out prompt — agent asks before proceeding
  buildingSteps.push(`${buildNum++}. **Close-out Gate** — when the user confirms they are satisfied, prompt them: "Ready to close out the session? I'll commit the work, run${hasUI && has('imprint') ? ' /imprint,' : ''} /remember save, and propose distill if anything's worth keeping." Wait for their confirmation before proceeding.`);
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

**Session-Scope Gate.** One feature per session. If a new feature is requested before the current one has passed the Close-out Gate, say so and ask whether to close out first or override.

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

${sessionGatesSection}

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

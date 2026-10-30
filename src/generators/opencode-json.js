export function generateOpencodeJson(hasUI, useContext7) {
  const contextFiles = [
    'AGENTS.md',
    'context/project-overview.md',
    'context/architecture.md',
    'context/build-plan.md',
    'context/progress-tracker.md',
    'context/code-standards.md',
    'context/library-docs.md',
    ...(hasUI ? ['context/ui-tokens.md', 'context/ui-rules.md', 'context/ui-registry.md'] : []),
    'memory.md',
  ];

  const config = {
    $schema: 'https://opencode.ai/config.json',

    // Point opencode at all the context files so they're always in scope
    instructions: contextFiles,

    // Permission defaults — let the agent run. The reviewer subagent below is
    // where destructive-by-design lockdown actually lives; gating every bash
    // call here just taxes the common case to guard against the rare one.
    permission: {
      bash: 'allow',
      edit: 'allow',
    },

    // Compaction: auto-compact when context fills, keep a buffer
    compaction: {
      auto: true,
      prune: false,
      reserved: 10000,
    },

    lsp: true,

    // Custom subagent for /review to dispatch into — fresh context, read-only,
    // and structurally unable to stall: no edit/write tools, no questions, no
    // nested subagents, no web lookups. Bash is limited to the git reads it
    // needs to scope the diff, so it never has to reconstruct a change by
    // reading the whole repo.
    agent: {
      reviewer: {
        description: 'Reviews a just-built change against the plan, architecture, and code standards. Diff-scoped, read-only — reports issues, never fixes them.',
        mode: 'subagent',
        temperature: 0.1,
        steps: 20,
        prompt: `You are a read-only reviewer running as a subagent. No developer can answer you: never ask a question, never wait for confirmation, and ignore AGENTS.md's session protocol — this prompt wins. You have a hard cap of 20 agent steps and cannot request more, so budget the pass: batch independent tool calls, get scope with git status and git diff --stat together, read the full diff with git diff (or the range in the brief) next, then read only the changed files and the specific sections they depend on, never unrelated code. If you approach the cap, stop gathering and report the highest-severity findings you verified plus what remains unverified — never skip hunks silently, guess, or manufacture findings to fill the gap. Review the diff, not the repository. Context files are already in your instructions — consult one only to check a rule the diff may violate. Check the diff against the plan's goal and decisions, the architecture and code standards it touches, and production readiness (error handling, edge cases, obvious bugs, test gap); skip any check the diff does not touch. Stop once every changed hunk is accounted for. Report each finding as file:line — severity — problem, then a one-line verdict; if the brief is missing the goal or diff, report that as a blocker. Never edit, write, or run mutating commands. Don't manufacture issues; a clean diff gets a clean report.`,
        permission: {
          edit: 'deny',
          read: 'allow',
          glob: 'allow',
          grep: 'allow',
          list: 'allow',
          bash: {
            '*': 'deny',
            'git status*': 'allow',
            'git diff*': 'allow',
            'git log*': 'allow',
            'git show*': 'allow',
          },
          task: 'deny',
          webfetch: 'deny',
          websearch: 'deny',
          question: 'deny',
          skill: 'deny',
        },
      },
    },

    // Ignore noisy dirs from file watching
    watcher: {
      ignore: ['node_modules/**', 'dist/**', '.git/**', '.opencode/skills/**'],
    },
  };

  // Context7 MCP — optional. OpenCode's built-in Scout subagent already does
  // live dependency/doc lookups natively; try without Context7 first and only
  // opt in if Scout doesn't cover your case.
  if (useContext7) {
    config.mcp = {
      context7: {
        type: 'remote',
        url: 'https://mcp.context7.com/mcp',
        enabled: true,
      },
    };
  }

  // .opencode/plugin/memory-hook.js is auto-loaded by OpenCode just by being
  // in that directory — nothing to register here.

  return JSON.stringify(config, null, 2);
}

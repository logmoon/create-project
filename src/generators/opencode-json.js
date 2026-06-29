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

    // Sensible permission defaults — ask before destructive ops, allow reads freely
    permission: {
      bash: 'ask',
      edit: 'allow',
    },

    // Compaction: auto-compact when context fills, keep a buffer
    compaction: {
      auto: true,
      prune: false,
      reserved: 10000,
    },

    lsp: true,

    // Custom subagent for /review to dispatch into — fresh context, can read
    // and reason but cannot edit/write/run commands. Forces "report, don't
    // fix" structurally instead of relying on the skill instructions alone.
    agent: {
      reviewer: {
        description: 'Reviews a just-built feature against the plan, architecture, and code standards. Read-only — reports issues, never fixes them.',
        mode: 'subagent',
        temperature: 0.1,
        permission: {
          edit: 'deny',
          bash: 'deny',
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

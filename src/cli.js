import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';

import { pc, log, step, done, warn, fail, divider, readStdinLines, ask, askYesNo, exec } from './io.js';
import { STUBS, writeStub } from './stubs.js';
import { generateAgentsMd, CORE_SKILLS, OPTIONAL_SKILLS } from './generators/agents-md.js';
import { generateOpencodeJson } from './generators/opencode-json.js';
import { installMemoryPlugin } from './generators/memory-plugin.js';
import { installSkills, ALL_SKILLS } from './skills.js';

export async function run() {
  const lines = await readStdinLines();
  const rl = lines === null
    ? createInterface({ input: process.stdin, output: process.stdout })
    : null;
  const close = () => rl && rl.close();

  console.log('');
  divider();
  log(pc.bold('  create-project'));
  log(pc.dim('  Scaffold a project with agent context, memory, and skills — for OpenCode'));
  divider();

  // ── 1. Project name ─────────────────────────────────────────────────────────
  const rawArg = process.argv[2];
  let projectName = rawArg || await ask(lines, rl, '\nProject name', 'my-app');
  projectName = projectName.replace(/\s+/g, '-').toLowerCase();

  const projectDir = resolve(process.cwd(), projectName);
  if (existsSync(projectDir)) {
    fail(`Directory "${projectName}" already exists.`);
    close();
    process.exit(1);
  }

  // ── 2. Quick questions ──────────────────────────────────────────────────────
  console.log('');
  divider();
  log(pc.bold('\n  A few quick questions\n'));

  const hasUI       = await askYesNo(lines, rl, 'Does this project have a UI?', true);
  const useContext7 = await askYesNo(lines, rl, 'Configure Context7 for live library docs? (OpenCode\'s @scout subagent may already cover this — try without first)', false);
  const initGit     = await askYesNo(lines, rl, 'Initialise a git repo?', true);

  // ── 3. Which skills ─────────────────────────────────────────────────────────
  let selectedSkills = [...CORE_SKILLS, ...OPTIONAL_SKILLS];
  if (!hasUI) {
    selectedSkills = selectedSkills.filter(s => s !== 'imprint');
  }

  // ── 4. Scaffold ─────────────────────────────────────────────────────────────
  console.log('');
  divider();
  step(`Creating ${pc.bold(projectName)}/`);

  mkdirSync(projectDir);
  mkdirSync(join(projectDir, 'context'));

  writeStub(writeFileSync, join(projectDir, 'memory.md'), STUBS['memory.md']);
  writeStub(writeFileSync, join(projectDir, 'context', 'progress-tracker.md'), STUBS['progress-tracker.md']);
  done('memory.md');
  done('context/progress-tracker.md');

  if (hasUI) {
    writeStub(writeFileSync, join(projectDir, 'context', 'ui-registry.md'), STUBS['ui-registry.md']);
    done('context/ui-registry.md');
  }

  writeFileSync(join(projectDir, 'AGENTS.md'), generateAgentsMd(projectName, hasUI, selectedSkills, useContext7));
  done('AGENTS.md');

  writeFileSync(join(projectDir, 'opencode.json'), generateOpencodeJson(hasUI, useContext7));
  done('opencode.json');

  // ── 5. Memory hook plugin ───────────────────────────────────────────────────
  installMemoryPlugin(projectDir);
  done('.opencode/plugin/memory-hook.js (auto-restore at session start)');

  // ── 6. Context stubs ─────────────────────────────────────────────────────────
  const contentFiles = [
    'project-overview.md', 'architecture.md', 'build-plan.md',
    'code-standards.md', 'library-docs.md',
    ...(hasUI ? ['ui-tokens.md', 'ui-rules.md'] : []),
  ];
  for (const file of contentFiles) {
    writeStub(writeFileSync, join(projectDir, 'context', file), STUBS[file]);
    done(`context/${file}`);
  }

  // ── 7. Skills (vendored copy, no network) ──────────────────────────────────
  installSkills(projectDir, selectedSkills);

  // ── 8. Git ──────────────────────────────────────────────────────────────────
  if (initGit) {
    step('Initialising git...');
    const gitOk = exec('git init && git add . && git commit -m "chore: project scaffold"', projectDir, true);
    if (gitOk) done('git init + initial commit');
    else warn('git init failed — do it manually');
  }

  // ── 9. Done ─────────────────────────────────────────────────────────────────
  console.log('');
  divider();
  log(`\n${pc.green(pc.bold('  Done.'))} ${projectName}/ is ready.\n`);

  log(pc.bold('  Next step:\n'));
  log(`  ${pc.cyan('→')} cd ${projectName} && opencode`);
  log(`  ${pc.dim('  context-gather runs automatically. Then just say what to build.')}`);
  console.log('');
  divider();

  close();
}

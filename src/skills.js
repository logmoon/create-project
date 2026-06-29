import { existsSync, mkdirSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { step, done, warn } from './io.js';
import { CORE_SKILLS, OPTIONAL_SKILLS } from './generators/agents-md.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_SOURCE_DIR = join(__dirname, '..', 'skills'); // vendored fork — see /skills in this repo

export const ALL_SKILLS = [...CORE_SKILLS, ...OPTIONAL_SKILLS];

// Vendored, not live-cloned: every skill in /skills is a deliberate fork we
// edited to match this project's workflow (auto-restore hook, fresh-subagent
// review, distill). Pulling live from JavaScript-Mastery-Pro/skills again
// would silently overwrite those edits the moment upstream changes.
export function installSkills(projectDir, selectedSkills) {
  step('Installing skills (vendored copy)...');

  const skillsDir = join(projectDir, '.opencode', 'skills');
  mkdirSync(skillsDir, { recursive: true });

  let installed = 0;
  for (const skill of selectedSkills) {
    const src = join(SKILLS_SOURCE_DIR, skill);
    const dest = join(skillsDir, skill);
    if (existsSync(src)) {
      cpSync(src, dest, { recursive: true });
      done(`  ${skill}`);
      installed++;
    } else {
      warn(`  ${skill} — not found in vendored skills/, skipped`);
    }
  }

  if (installed > 0) done(`${installed} skill(s) copied to .opencode/skills/`);
}

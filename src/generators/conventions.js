import { mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONVENTIONS_SOURCE = join(__dirname, '..', '..', 'docs', 'conventions.md');

// distill reads this at runtime to check its own proposals against — see
// skills/distill/SKILL.md. Lives under .opencode/ rather than a root-level
// docs/ since it's agent tooling, not project documentation, and a root
// docs/ folder is exactly the kind of thing a real project already has.
export function installConventions(projectDir) {
  const dest = join(projectDir, '.opencode');
  mkdirSync(dest, { recursive: true });
  copyFileSync(CONVENTIONS_SOURCE, join(dest, 'conventions.md'));
}

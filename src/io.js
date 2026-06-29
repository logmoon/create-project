import { spawnSync } from 'node:child_process';

let pc;
try {
  pc = (await import('picocolors')).default;
} catch {
  pc = {
    green: (s) => s, bold: (s) => s, cyan: (s) => s,
    yellow: (s) => s, red: (s) => s, gray: (s) => s, dim: (s) => s,
  };
}
export { pc };

export function log(msg)  { console.log(msg); }
export function step(msg) { console.log(`\n${pc.cyan('→')} ${msg}`); }
export function done(msg) { console.log(`  ${pc.green('✓')} ${msg}`); }
export function warn(msg) { console.log(`  ${pc.yellow('!')} ${msg}`); }
export function fail(msg) { console.log(`  ${pc.red('✗')} ${msg}`); }
export function divider()  { console.log(pc.gray('─'.repeat(60))); }

// Read all stdin lines upfront, then consume them one by one.
// Works reliably in both interactive TTY and piped/test mode.
export async function readStdinLines() {
  if (process.stdin.isTTY) return null; // interactive mode — read on demand
  const lines = [];
  for await (const chunk of process.stdin) {
    for (const line of chunk.toString().split('\n')) lines.push(line.trimEnd());
  }
  return lines;
}

export function ask(lines, rl, question, fallback = '') {
  if (lines !== null) {
    const ans = lines.shift() ?? '';
    const hint = fallback ? ` (${fallback})` : '';
    process.stdout.write(`${question}${hint}: ${ans}\n`);
    return Promise.resolve(ans.trim() || fallback);
  }
  return new Promise((resolve) => {
    const hint = fallback ? pc.dim(` (${fallback})`) : '';
    rl.question(`${question}${hint}: `, (ans) => resolve(ans.trim() || fallback));
  });
}

export function askYesNo(lines, rl, question, defaultYes = true) {
  const hint = defaultYes ? 'Y/n' : 'y/N';
  if (lines !== null) {
    const ans = (lines.shift() ?? '').trim().toLowerCase();
    const display = ans || (defaultYes ? 'y' : 'n');
    process.stdout.write(`${question} [${hint}]: ${display}\n`);
    if (!ans) return Promise.resolve(defaultYes);
    return Promise.resolve(ans === 'y' || ans === 'yes');
  }
  return new Promise((resolve) => {
    rl.question(`${question} ${pc.dim(`[${hint}]`)}: `, (ans) => {
      const a = ans.trim().toLowerCase();
      resolve(!a ? defaultYes : a === 'y' || a === 'yes');
    });
  });
}

export function exec(cmd, cwd, silent = false) {
  const result = spawnSync(cmd, { shell: true, cwd, stdio: silent ? 'pipe' : 'inherit' });
  return result.status === 0;
}

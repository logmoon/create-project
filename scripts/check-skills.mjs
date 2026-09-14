#!/usr/bin/env node
// Advisory lint for skills/*/SKILL.md — see docs/conventions.md for why these
// checks exist. This never fails the build; it just tells you where a skill
// might be paying tokens it doesn't need to, the same spirit as the gates in
// AGENTS.md being checkpoints, not walls. Run: npm run check

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, '..', 'skills');

// Warn past this, don't fail — a budget to notice, not a wall to hit.
const LINE_BUDGET = 350;

// Phrases that read as advice rather than instruction — they rarely change
// what the agent does differently, so they're usually just cost.
const FILLER_PHRASES = [
  'be careful',
  'be thorough',
  'make sure to',
  "it's important to note",
  'it is important to note',
  'in order to',
];

function checkFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { ok: false, reason: 'missing --- frontmatter block' };
  const body = match[1];
  if (!/^name:\s*\S+/m.test(body)) return { ok: false, reason: 'missing `name` field' };
  if (!/^description:\s*\S+/m.test(body)) return { ok: false, reason: 'missing `description` field' };
  return { ok: true };
}

function findFillerPhrases(text) {
  const lower = text.toLowerCase();
  return FILLER_PHRASES.filter((phrase) => lower.includes(phrase));
}

function main() {
  const skillDirs = readdirSync(SKILLS_DIR).filter((name) =>
    statSync(join(SKILLS_DIR, name)).isDirectory()
  );

  let hasError = false;
  const notices = [];

  for (const skill of skillDirs) {
    const path = join(SKILLS_DIR, skill, 'SKILL.md');
    let text;
    try {
      text = readFileSync(path, 'utf-8');
    } catch {
      notices.push({ level: 'error', skill, message: 'SKILL.md not found' });
      hasError = true;
      continue;
    }

    const frontmatter = checkFrontmatter(text);
    if (!frontmatter.ok) {
      notices.push({ level: 'error', skill, message: frontmatter.reason });
      hasError = true;
    }

    const lineCount = text.split('\n').length;
    if (lineCount > LINE_BUDGET) {
      notices.push({
        level: 'warn',
        skill,
        message: `${lineCount} lines — over the ${LINE_BUDGET}-line budget, worth a trim pass`,
      });
    }

    const filler = findFillerPhrases(text);
    if (filler.length) {
      notices.push({
        level: 'warn',
        skill,
        message: `filler phrase(s) found: ${filler.map((p) => `"${p}"`).join(', ')}`,
      });
    }
  }

  if (notices.length === 0) {
    console.log(`✓ ${skillDirs.length} skill(s) checked, nothing to flag.`);
    return;
  }

  for (const { level, skill, message } of notices) {
    const marker = level === 'error' ? '✗' : '!';
    console.log(`  ${marker} ${skill}: ${message}`);
  }
  console.log(`\n${notices.length} notice(s) across ${skillDirs.length} skill(s).`);

  // Only frontmatter problems fail the run — everything else is advisory.
  if (hasError) process.exit(1);
}

main();

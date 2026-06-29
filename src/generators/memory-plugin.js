import { mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_SOURCE = join(__dirname, '..', '..', 'plugin', 'memory-hook.js');

export function installMemoryPlugin(projectDir) {
  const pluginDir = join(projectDir, '.opencode', 'plugin');
  mkdirSync(pluginDir, { recursive: true });
  copyFileSync(PLUGIN_SOURCE, join(pluginDir, 'memory-hook.js'));
}

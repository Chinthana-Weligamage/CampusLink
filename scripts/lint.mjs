import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const excluded = new Set(['.git', 'node_modules']);
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (excluded.has(entry)) {
      continue;
    }

    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.endsWith('.js') || entry.endsWith('.mjs')) {
      files.push(fullPath);
    }
  }
}

walk(root);

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`Syntax check passed for ${files.length} files.`);

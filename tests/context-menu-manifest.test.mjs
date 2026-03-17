import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

test('manifest requests contextMenus permission for selection actions', () => {
  const source = readFileSync(join(repoRoot, 'src/manifest.ts'), 'utf8');

  assert.match(source, /permissions:\s*\[[^\]]*'contextMenus'/, 'Expected contextMenus permission in manifest');
});

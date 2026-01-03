import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const readSource = (relativePath) =>
  readFileSync(join(repoRoot, relativePath), 'utf8');

test('content root is shrunk to avoid blocking page clicks', () => {
  const source = readSource('src/content/index.tsx');
  assert.match(source, /container\.style\.width\s*=\s*['"]0['"]/,
    'Expected content root width to be set to 0');
  assert.match(source, /container\.style\.height\s*=\s*['"]0['"]/,
    'Expected content root height to be set to 0');
  assert.match(source, /container\.style\.minHeight\s*=\s*['"]0['"]/,
    'Expected content root minHeight to be set to 0');
  assert.match(source, /container\.style\.maxHeight\s*=\s*['"]none['"]/,
    'Expected content root maxHeight to be set to none');
  assert.match(source, /container\.style\.overflow\s*=\s*['"]visible['"]/,
    'Expected content root overflow to be visible');
});

test('content script injects popup fonts into shadow root', () => {
  const source = readSource('src/content/index.tsx');
  assert.match(source, /fonts\.googleapis\.com\/css2\?family=Plus\+Jakarta\+Sans/, 'Expected Plus Jakarta Sans font link');
  assert.match(source, /family=JetBrains\+Mono/, 'Expected JetBrains Mono font link');
});

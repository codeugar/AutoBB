import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const readSource = (relativePath) =>
  readFileSync(join(repoRoot, relativePath), 'utf8');

test('App owns the global scroll container', () => {
  const app = readSource('src/popup/App.tsx');
  assert.match(app, /custom-scrollbar/, 'App.tsx should include custom-scrollbar');
  assert.match(app, /overflow-y-auto/, 'App.tsx should enable vertical scrolling');
  assert.match(app, /onScroll=\{handleScroll\}/, 'App.tsx should handle scroll state');
});

test('ProfileList uses global scrolling', () => {
  const list = readSource('src/popup/components/ProfileList.tsx');
  assert.doesNotMatch(list, /custom-scrollbar/, 'ProfileList.tsx should not include custom-scrollbar');
  assert.doesNotMatch(list, /overflow-y-auto/, 'ProfileList.tsx should not include overflow-y-auto');
});

test('ProfileEditor uses global scrolling', () => {
  const editor = readSource('src/popup/components/ProfileEditor.tsx');
  assert.doesNotMatch(editor, /custom-scrollbar/, 'ProfileEditor.tsx should not include custom-scrollbar');
  assert.doesNotMatch(editor, /overflow-y-auto/, 'ProfileEditor.tsx should not include overflow-y-auto');
});

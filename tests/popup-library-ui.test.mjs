import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const readSource = (relativePath) =>
  readFileSync(join(repoRoot, relativePath), 'utf8');

test('App renders list view tools without inner container shell', () => {
  const app = readSource('src/popup/App.tsx');
  assert.match(app, /currentView === 'list'[\s\S]*<BatchGoogleSearch \/>[\s\S]*<ProfileList/, 'Expected list view to render BatchGoogleSearch and ProfileList directly');
  assert.doesNotMatch(app, /<div[^>]*glass-card[\s\S]*<ProfileEditor/, 'Expected editor view without an extra heavy shell');
});

test('App owns global scrollbar and scroll state', () => {
  const app = readSource('src/popup/App.tsx');
  assert.match(app, /custom-scrollbar/, 'Expected custom-scrollbar class in App');
  assert.match(app, /is-scrolling/, 'Expected scroll state class in App');
  assert.match(app, /onScroll=\{handleScroll\}/, 'Expected onScroll handler in App');
});

test('Profile list is compact and not a scroll container', () => {
  const list = readSource('src/popup/components/ProfileList.tsx');
  assert.doesNotMatch(list, /custom-scrollbar/, 'Did not expect custom-scrollbar in ProfileList');
  assert.doesNotMatch(list, /onScroll=\{handleScroll\}/, 'Did not expect onScroll handler in ProfileList');
  assert.doesNotMatch(list, /overflow-y-auto/, 'Did not expect overflow-y-auto in ProfileList');
  assert.match(list, /terminal-label/, 'Expected terminal section label');
  assert.match(list, /terminal-panel/, 'Expected a hard-edged terminal list container');
});

test('Profile list rows use soft separators without heavy shells', () => {
  const list = readSource('src/popup/components/ProfileList.tsx');
  const cardMatch = list.match(/className="group[\s\S]*?"\s*style=\{\{ animationDelay/);
  assert.ok(cardMatch, 'Expected list item className near animationDelay');
  const cardClass = cardMatch[0];
  assert.match(cardClass, /border-dashed border-\[var\(--ink-ghost\)\]/, 'Expected terminal dashed separators on list rows');
  assert.doesNotMatch(cardClass, /border\s+border-black/, 'Expected no light-theme borders on list items');
});

test('Profile editor relies on global scrollbar', () => {
  const editor = readSource('src/popup/components/ProfileEditor.tsx');
  assert.doesNotMatch(editor, /custom-scrollbar/, 'Did not expect custom-scrollbar in ProfileEditor');
  assert.doesNotMatch(editor, /overflow-y-auto/, 'Did not expect overflow-y-auto in ProfileEditor');
});

test('Custom scrollbar uses terminal rail styling', () => {
  const css = readSource('src/index.css');
  assert.match(css, /\.custom-scrollbar\s*\{[\s\S]*scrollbar-color:\s*var\(--ink-faint\)\s+transparent;/, 'Expected terminal scrollbar by default');
  assert.match(css, /\.custom-scrollbar:hover/, 'Expected hover scrollbar styles');
  assert.match(css, /\.custom-scrollbar\.is-scrolling/, 'Expected scroll-state scrollbar styles');
  assert.match(css, /custom-scrollbar::-webkit-scrollbar-thumb\s*\{[\s\S]*background:\s*var\(--ink-faint\);/, 'Expected visible terminal scrollbar thumb by default');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const readSource = (relativePath) =>
  readFileSync(join(repoRoot, relativePath), 'utf8');

test('App renders list view without inner container shell', () => {
  const app = readSource('src/popup/App.tsx');
  const pattern = /currentView === 'list'[\s\S]*\?\s*\([\s\S]*<ProfileList[\s\S]*?\)\s*:\s*\([\s\S]*<div[^>]*glass-card[\s\S]*<ProfileEditor/;
  assert.match(app, pattern, 'Expected list view to render ProfileList directly and only wrap editor view');
});

test('App owns global scrollbar and scroll state', () => {
  const app = readSource('src/popup/App.tsx');
  assert.match(app, /custom-scrollbar/, 'Expected custom-scrollbar class in App');
  assert.match(app, /is-scrolling/, 'Expected scroll state class in App');
  assert.match(app, /onScroll=\{handleScroll\}/, 'Expected onScroll handler in App');
});

test('Profile list is full-bleed and not a scroll container', () => {
  const list = readSource('src/popup/components/ProfileList.tsx');
  assert.doesNotMatch(list, /custom-scrollbar/, 'Did not expect custom-scrollbar in ProfileList');
  assert.doesNotMatch(list, /onScroll=\{handleScroll\}/, 'Did not expect onScroll handler in ProfileList');
  assert.doesNotMatch(list, /overflow-y-auto/, 'Did not expect overflow-y-auto in ProfileList');
  assert.match(list, /\bpx-0\b/, 'Expected full-bleed list container with px-0');
});

test('Profile list cards use soft separators without heavy shells', () => {
  const list = readSource('src/popup/components/ProfileList.tsx');
  const cardMatch = list.match(/className="group[\s\S]*?"\s*style=\{\{ animationDelay/);
  assert.ok(cardMatch, 'Expected list item className near animationDelay');
  const cardClass = cardMatch[0];
  assert.match(cardClass, /after:bg-gradient-to-r/, 'Expected soft separator gradient on list items');
  assert.doesNotMatch(cardClass, /bg-zinc-950\/60/, 'Expected no heavy card background on list items');
  assert.doesNotMatch(cardClass, /border\s+border-white\/5/, 'Expected no heavy borders on list items');
});

test('Profile editor relies on global scrollbar', () => {
  const editor = readSource('src/popup/components/ProfileEditor.tsx');
  assert.doesNotMatch(editor, /custom-scrollbar/, 'Did not expect custom-scrollbar in ProfileEditor');
  assert.doesNotMatch(editor, /overflow-y-auto/, 'Did not expect overflow-y-auto in ProfileEditor');
});

test('Custom scrollbar hides until hover or scroll', () => {
  const css = readSource('src/index.css');
  assert.match(css, /\.custom-scrollbar\s*\{[\s\S]*scrollbar-color:\s*transparent\s+transparent;/, 'Expected transparent scrollbar by default');
  assert.match(css, /\.custom-scrollbar:hover/, 'Expected hover scrollbar styles');
  assert.match(css, /\.custom-scrollbar\.is-scrolling/, 'Expected scroll-state scrollbar styles');
  assert.match(css, /custom-scrollbar::-webkit-scrollbar-thumb\s*\{[\s\S]*background:\s*transparent;/, 'Expected transparent scrollbar thumb by default');
});

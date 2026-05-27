import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const readSource = (relativePath) =>
  readFileSync(join(repoRoot, relativePath), 'utf8');

const assertNoForbiddenColors = (source, label) => {
  const forbidden = ['violet', 'fuchsia', 'indigo', 'purple'];
  for (const token of forbidden) {
    assert.ok(!source.includes(token), `${label}: should not include ${token}`);
  }
};

test('Terminal relay theme variables and classes exist', () => {
  const css = readSource('src/index.css');
  assert.match(css, /:root,\s*:host\s*\{[\s\S]*--background-gradient:/, 'Expected theme tokens on :host for shadow DOM');
  assert.match(css, /--bg:\s*#0A0D0C;/, 'Expected terminal background token');
  assert.match(css, /--phosphor:\s*#88E09C;/, 'Expected phosphor accent token');
  assert.match(css, /--amber:\s*#F0A830;/, 'Expected amber warning token');
  assert.match(css, /--accent-gradient:\s*linear-gradient\(90deg, #4A8A5A 0%, #88E09C 100%\);/, 'Expected phosphor accent gradient token');
  assert.match(css, /\.terminal-frame\s*\{[\s\S]*font-family:\s*var\(--font-mono\)/, 'Expected terminal frame shell');
  assert.match(css, /\.terminal-display\s*\{[\s\S]*font-family:\s*var\(--font-display\)/, 'Expected display font class');
  assert.match(css, /\.glass-panel\s*\{[\s\S]*background:\s*var\(--glass-panel-bg\)/, 'Expected glass-panel background');
  assert.match(css, /\.glass-panel\s*\{[\s\S]*border-radius:\s*0/, 'Expected hard-edged terminal panel radius');
  assert.match(css, /\.glass-card\s*\{[\s\S]*background:\s*var\(--glass-card-bg\)/, 'Expected glass-card background');
  assert.match(css, /\.glass-card\s*\{[\s\S]*border-radius:\s*0/, 'Expected hard-edged terminal card radius');
  assert.match(css, /\.accent-gradient\s*\{[\s\S]*var\(--accent-gradient\)/, 'Expected accent gradient');
});

test('Popup uses terminal relay classes', () => {
  const app = readSource('src/popup/App.tsx');
  assert.match(app, /terminal-frame/, 'Expected terminal frame class in App');
  assert.match(app, /terminal-display/, 'Expected terminal display title in App');
  assert.match(app, /terminal-button/, 'Expected terminal buttons in App');
});

test('Overlay uses overlay panel and accent classes', () => {
  const overlay = readSource('src/content/Overlay.tsx');
  assert.match(overlay, /overlay-panel/, 'Expected overlay-panel class in Overlay');
  assert.match(overlay, /accent-gradient/, 'Expected accent-gradient class in Overlay');
});

test('Overlay header uses accent gradient', () => {
  const overlay = readSource('src/content/Overlay.tsx');
  assert.match(overlay, /className="[^"]*overlay-header[^"]*accent-gradient[^"]*"/, 'Expected overlay header to use accent-gradient');
});

test('Overlay panel styles include popup gradient layer', () => {
  const css = readSource('src/index.css');
  assert.match(css, /\.overlay-panel\s*\{[\s\S]*background:\s*var\(--background-gradient\)/, 'Expected overlay panel gradient background');
});

test('Shadow host applies popup font and text color', () => {
  const css = readSource('src/index.css');
  assert.match(css, /:host\s*\{[\s\S]*font-family:\s*var\(--font-sans\)/, 'Expected font family on :host');
  assert.match(css, /:host\s*\{[\s\S]*color:\s*var\(--text-primary\)/, 'Expected text color on :host');
});

test('Forbidden purple tokens are absent', () => {
  assertNoForbiddenColors(readSource('src/index.css'), 'index.css');
  assertNoForbiddenColors(readSource('src/popup/App.tsx'), 'App.tsx');
  assertNoForbiddenColors(readSource('src/popup/components/ProfileList.tsx'), 'ProfileList.tsx');
  assertNoForbiddenColors(readSource('src/popup/components/ProfileEditor.tsx'), 'ProfileEditor.tsx');
  assertNoForbiddenColors(readSource('src/content/Overlay.tsx'), 'Overlay.tsx');
});

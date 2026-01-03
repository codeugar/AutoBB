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
  const forbidden = ['violet', 'fuchsia', 'indigo', 'purple', 'blue'];
  for (const token of forbidden) {
    assert.ok(!source.includes(token), `${label}: should not include ${token}`);
  }
};

test('Glassmorphism theme variables and classes exist', () => {
  const css = readSource('src/index.css');
  assert.match(css, /:root,\s*:host\s*\{[\s\S]*--background-gradient:/, 'Expected theme tokens on :host for shadow DOM');
  assert.match(css, /--background-gradient:\s*linear-gradient\(120deg, #d4fc79 0%, #96e6a1 100%\);/, 'Expected green background gradient');
  assert.match(css, /--glass-panel-bg:\s*rgba\(255,\s*255,\s*255,\s*0\.65\);/, 'Expected glass-panel background token');
  assert.match(css, /--glass-card-bg:\s*rgba\(255,\s*255,\s*255,\s*0\.4\);/, 'Expected glass-card background token');
  assert.match(css, /--accent-gradient:\s*linear-gradient\(to right, #059669, #10B981\);/, 'Expected accent gradient token');
  assert.match(css, /\.glass-panel\s*\{[\s\S]*background:\s*var\(--glass-panel-bg\)/, 'Expected glass-panel background');
  assert.match(css, /\.glass-panel[\s\S]*backdrop-filter:\s*blur\(20px\)/, 'Expected glass-panel blur');
  assert.match(css, /\.glass-card\s*\{[\s\S]*background:\s*var\(--glass-card-bg\)/, 'Expected glass-card background');
  assert.match(css, /\.glass-card[\s\S]*backdrop-filter:\s*blur\(16px\)/, 'Expected glass-card blur');
  assert.match(css, /\.accent-gradient\s*\{[\s\S]*var\(--accent-gradient\)/, 'Expected accent gradient');
});

test('Popup uses glass and accent classes', () => {
  const app = readSource('src/popup/App.tsx');
  assert.match(app, /glass-panel/, 'Expected glass-panel class in App');
  assert.match(app, /accent-gradient/, 'Expected accent-gradient class in App');
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

test('Forbidden blue/purple tokens are absent', () => {
  assertNoForbiddenColors(readSource('src/index.css'), 'index.css');
  assertNoForbiddenColors(readSource('src/popup/App.tsx'), 'App.tsx');
  assertNoForbiddenColors(readSource('src/popup/components/ProfileList.tsx'), 'ProfileList.tsx');
  assertNoForbiddenColors(readSource('src/popup/components/ProfileEditor.tsx'), 'ProfileEditor.tsx');
  assertNoForbiddenColors(readSource('src/content/Overlay.tsx'), 'Overlay.tsx');
});

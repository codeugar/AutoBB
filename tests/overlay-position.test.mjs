import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampPosition,
  defaultPosition,
  snapPositionToEdge,
} from '../.tmp-test/overlayPosition.js';

test('clampPosition keeps in-bounds positions unchanged', () => {
  const viewport = { width: 800, height: 600 };
  const element = { width: 40, height: 40 };
  const padding = 10;

  const result = clampPosition({ x: 120, y: 200 }, viewport, element, padding);

  assert.deepEqual(result, { x: 120, y: 200 });
});

test('clampPosition clamps to padding for negative coordinates', () => {
  const viewport = { width: 800, height: 600 };
  const element = { width: 40, height: 40 };
  const padding = 10;

  const result = clampPosition({ x: -50, y: -20 }, viewport, element, padding);

  assert.deepEqual(result, { x: 10, y: 10 });
});

test('clampPosition clamps to max bounds when overflowing viewport', () => {
  const viewport = { width: 800, height: 600 };
  const element = { width: 40, height: 40 };
  const padding = 10;
  const maxX = 800 - 40 - 10;
  const maxY = 600 - 40 - 10;

  const result = clampPosition({ x: 2000, y: 2000 }, viewport, element, padding);

  assert.deepEqual(result, { x: maxX, y: maxY });
});

test('snapPositionToEdge snaps to left when closer to left edge', () => {
  const viewport = { width: 800, height: 600 };
  const element = { width: 40, height: 40 };
  const padding = 12;

  const result = snapPositionToEdge({ x: 80, y: 120 }, viewport, element, padding);

  assert.equal(result.x, 12);
});

test('snapPositionToEdge snaps to right when closer to right edge', () => {
  const viewport = { width: 800, height: 600 };
  const element = { width: 40, height: 40 };
  const padding = 12;
  const maxX = 800 - 40 - 12;

  const result = snapPositionToEdge({ x: 700, y: 120 }, viewport, element, padding);

  assert.equal(result.x, maxX);
});

test('snapPositionToEdge clamps y while snapping', () => {
  const viewport = { width: 800, height: 600 };
  const element = { width: 40, height: 40 };
  const padding = 12;

  const result = snapPositionToEdge({ x: 700, y: -100 }, viewport, element, padding);

  assert.equal(result.y, 12);
});

test('defaultPosition places element at bottom-right with padding', () => {
  const viewport = { width: 800, height: 600 };
  const element = { width: 40, height: 40 };
  const padding = 12;

  const result = defaultPosition(viewport, element, padding);

  assert.deepEqual(result, { x: 800 - 40 - 12, y: 600 - 40 - 12 });
});

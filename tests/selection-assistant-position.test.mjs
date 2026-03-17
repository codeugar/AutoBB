import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTooltipPosition,
  findAnchorRect,
} from '../.tmp-test/selectionAssistantPosition.js';

test('findAnchorRect falls back to the first visible client rect when the bounding rect is empty', () => {
  const emptyRect = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
  const visibleRect = { left: 180, top: 120, right: 260, bottom: 144, width: 80, height: 24 };

  const result = findAnchorRect(emptyRect, [emptyRect, visibleRect]);

  assert.deepEqual(result, visibleRect);
});

test('computeTooltipPosition uses the mouse position when no visible selection rect exists', () => {
  const result = computeTooltipPosition({
    rect: null,
    fallbackPoint: { x: 420, y: 260 },
    viewport: { width: 1440, height: 900 },
  });

  assert.deepEqual(result, { left: 406, top: 268 });
});

test('computeTooltipPosition clamps invalid coordinates away from the viewport edge', () => {
  const result = computeTooltipPosition({
    rect: { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 },
    fallbackPoint: { x: 0, y: 0 },
    viewport: { width: 100, height: 100 },
  });

  assert.deepEqual(result, { left: 8, top: 8 });
});

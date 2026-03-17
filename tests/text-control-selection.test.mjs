import test from 'node:test';
import assert from 'node:assert/strict';
import { getTextControlSelection } from '../.tmp-test/textControlSelection.js';

test('getTextControlSelection returns selected text and measured rect for supported text inputs', () => {
  const measuredRect = { left: 160, top: 88, right: 284, bottom: 112, width: 124, height: 24 };

  const result = getTextControlSelection(
    {
      tagName: 'INPUT',
      type: 'search',
      value: 'march madness bracket maker',
      selectionStart: 6,
      selectionEnd: 13,
    },
    () => measuredRect,
  );

  assert.deepEqual(result, {
    text: 'madness',
    start: 6,
    end: 13,
    rect: measuredRect,
  });
});

test('getTextControlSelection ignores unsupported input types', () => {
  const result = getTextControlSelection({
    tagName: 'INPUT',
    type: 'checkbox',
    value: 'checked',
    selectionStart: 0,
    selectionEnd: 7,
  });

  assert.equal(result, null);
});

test('getTextControlSelection ignores collapsed selections', () => {
  const result = getTextControlSelection({
    tagName: 'TEXTAREA',
    value: 'two words',
    selectionStart: 3,
    selectionEnd: 3,
  });

  assert.equal(result, null);
});

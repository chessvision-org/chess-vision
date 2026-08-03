import assert from 'node:assert/strict';
import { test } from 'node:test';

import { intrinsicPxOf } from './pieceUtils';

test('intrinsicPxOf converts px/mm/pt dimensions to pixels', () => {
  assert.equal(intrinsicPxOf('<svg width="512" height="512"/>'), 512);
  assert.equal(
    intrinsicPxOf('<svg width="50mm" height="50mm" viewBox="0 0 50 50"/>'),
    189
  );
  assert.equal(
    intrinsicPxOf('<svg width="700pt" height="700pt" viewBox="0 0 933 933"/>'),
    933
  );
  assert.equal(intrinsicPxOf('<svg viewBox="0 0 45 45"/>'), 0);
});

test('intrinsicPxOf ignores child element width/height attributes', () => {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="45" height="45">' +
    '<rect width="9999" height="9999" fill="none"/></svg>';
  assert.equal(intrinsicPxOf(svg), 45);
});

test('intrinsicPxOf returns 0 when no svg tag is present', () => {
  assert.equal(intrinsicPxOf('not an svg string'), 0);
});

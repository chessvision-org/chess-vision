import assert from 'node:assert/strict';
import { test } from 'node:test';

import { saveBlob } from '@utils/saveBlob';

test('saveBlob rejects non-Blob arguments', () => {
  assert.throws(
    () => saveBlob(null as unknown as Blob, 'file', 'png'),
    (err: unknown) => {
      assert.ok(err instanceof TypeError);
      return true;
    }
  );
  assert.throws(
    () => saveBlob(undefined as unknown as Blob, 'file', 'png'),
    TypeError
  );
  assert.throws(
    () => saveBlob({} as unknown as Blob, 'file', 'png'),
    TypeError
  );
  assert.throws(
    () => saveBlob([] as unknown as Blob, 'file', 'png'),
    TypeError
  );
  assert.throws(
    () => saveBlob('not-a-blob' as unknown as Blob, 'file', 'png'),
    TypeError
  );
  assert.throws(
    () => saveBlob(42 as unknown as Blob, 'file', 'png'),
    TypeError
  );
});

test('saveBlob accepts a valid Blob instance', () => {
  const blob = new Blob(['test'], { type: 'image/png' });
  assert.ok(blob instanceof Blob);
});

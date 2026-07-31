import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  cancelExport,
  checkCancellation,
  getExportInfo,
  pauseExport,
  resetExportState,
  resumeExport,
  validateExportConfig,
  waitWhilePaused
} from '@utils/exportState';
import { getMaxCanvasSize } from '@utils/imageOptimizer';
import type { ExportConfig } from '@utils/canvasExporter';

const VALID_CONFIG: ExportConfig = {
  boardSize: 10,
  showCoords: true,
  exportQuality: 1,
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  lightSquare: '#F0D9B5',
  darkSquare: '#B58863',
  pieceImages: { wK: {} as HTMLImageElement },
  flipped: false
};

test('validateExportConfig accepts a valid config', () => {
  assert.doesNotThrow(() => validateExportConfig(VALID_CONFIG));
});

test('validateExportConfig rejects a null config', () => {
  assert.throws(
    () => validateExportConfig(null as unknown as ExportConfig),
    /Config is null or undefined/
  );
});

test('validateExportConfig rejects boardSize below 1', () => {
  assert.throws(
    () => validateExportConfig({ ...VALID_CONFIG, boardSize: 0 }),
    /Invalid boardSize: 0cm/
  );
  assert.throws(
    () => validateExportConfig({ ...VALID_CONFIG, boardSize: -5 }),
    /Invalid boardSize/
  );
});

test('validateExportConfig rejects a missing FEN', () => {
  assert.throws(
    () => validateExportConfig({ ...VALID_CONFIG, fen: '' }),
    /FEN is missing/
  );
});

test('validateExportConfig rejects an oversized FEN', () => {
  assert.throws(
    () =>
      validateExportConfig({
        ...VALID_CONFIG,
        fen: 'KQ6/8/8/8/8/8/8/8 w - - 0 1 '.repeat(20)
      }),
    /exceeds maximum length/
  );
});

test('validateExportConfig rejects invalid square colors', () => {
  assert.throws(
    () => validateExportConfig({ ...VALID_CONFIG, lightSquare: 'red' }),
    /lightSquare is not a valid hex color/
  );
  assert.throws(
    () => validateExportConfig({ ...VALID_CONFIG, darkSquare: '#12F' }),
    /darkSquare is not a valid hex color/
  );
});

test('validateExportConfig rejects empty pieceImages', () => {
  assert.throws(
    () => validateExportConfig({ ...VALID_CONFIG, pieceImages: {} }),
    /pieceImages is empty/
  );
});

test('getExportInfo picks print mode for 1x and 2x quality', () => {
  assert.equal(
    getExportInfo({ ...VALID_CONFIG, exportQuality: 1 }).mode,
    'print'
  );
  assert.equal(
    getExportInfo({ ...VALID_CONFIG, exportQuality: 2 }).mode,
    'print'
  );
});

test('getExportInfo picks social mode for 3x quality', () => {
  const info = getExportInfo({ ...VALID_CONFIG, exportQuality: 3 });
  assert.equal(info.mode, 'social');
  assert.equal(info.forceCoordinateBorder, true);
});

test('getExportInfo reports effective DPI scaling with quality', () => {
  assert.equal(
    getExportInfo({ ...VALID_CONFIG, exportQuality: 1 }).effectiveDPI,
    300
  );
  assert.equal(
    getExportInfo({ ...VALID_CONFIG, exportQuality: 2 }).effectiveDPI,
    600
  );
});

test('getExportInfo canvas grows with board size', () => {
  const small = getExportInfo({ ...VALID_CONFIG, boardSize: 5 });
  const large = getExportInfo({ ...VALID_CONFIG, boardSize: 20 });
  assert.ok(large.canvasWidth > small.canvasWidth);
  assert.ok(large.canvasHeight > small.canvasHeight);
});

test('getExportInfo hides coordinates when showCoords is false', () => {
  const withCoords = getExportInfo({ ...VALID_CONFIG, showCoords: true });
  const withoutCoords = getExportInfo({ ...VALID_CONFIG, showCoords: false });
  assert.ok(withoutCoords.canvasWidth < withCoords.canvasWidth);
});

test('getExportInfo estimates positive file sizes', () => {
  const info = getExportInfo(VALID_CONFIG);
  assert.ok(info.fileSizeEstimates.pngBytes > 0);
  assert.ok(info.fileSizeEstimates.jpegBytes > 0);
  assert.ok(info.memoryEstimateMB > 0);
});

test('checkCancellation throws after cancelExport', () => {
  resetExportState();
  cancelExport();
  assert.throws(() => checkCancellation(), /Export cancelled/);
  resetExportState();
  assert.doesNotThrow(() => checkCancellation());
});

test('waitWhilePaused blocks while paused and resolves after resume', async () => {
  resetExportState();
  pauseExport();
  let resumed = false;
  const waiter = waitWhilePaused().then(() => {
    resumed = true;
  });
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(resumed, false);
  resumeExport();
  await waiter;
  assert.equal(resumed, true);
  resetExportState();
});

test('validateExportConfig rejects NaN boardSize', () => {
  assert.throws(
    () => validateExportConfig({ ...VALID_CONFIG, boardSize: NaN }),
    /Invalid boardSize: NaN/
  );
});

test('validateExportConfig rejects Infinity boardSize', () => {
  assert.throws(
    () => validateExportConfig({ ...VALID_CONFIG, boardSize: Infinity }),
    /Invalid boardSize/
  );
});

test('validateExportConfig rejects pieceImages that are objects but not records', () => {
  assert.throws(
    () =>
      validateExportConfig({
        ...VALID_CONFIG,
        pieceImages: null as unknown as ExportConfig['pieceImages']
      }),
    /pieceImages is null or undefined/
  );
  assert.throws(
    () =>
      validateExportConfig({
        ...VALID_CONFIG,
        pieceImages: 'hello' as unknown as ExportConfig['pieceImages']
      }),
    /pieceImages is not an object/
  );
  assert.throws(
    () =>
      validateExportConfig({
        ...VALID_CONFIG,
        pieceImages: 42 as unknown as ExportConfig['pieceImages']
      }),
    /pieceImages is not an object/
  );
});

test('validateExportConfig rejects missing square colors', () => {
  assert.throws(
    () =>
      validateExportConfig({
        ...VALID_CONFIG,
        lightSquare: undefined as unknown as string
      }),
    /Square colors are missing/
  );
  assert.throws(
    () =>
      validateExportConfig({
        ...VALID_CONFIG,
        darkSquare: '' as unknown as string
      }),
    /Square colors are missing/
  );
});

test('validateExportConfig rejects FEN that is only whitespace', () => {
  assert.throws(
    () => validateExportConfig({ ...VALID_CONFIG, fen: '   ' }),
    /FEN is missing/
  );
});

test('getExportInfo clamps oversized boards to max canvas', () => {
  const huge = getExportInfo({
    ...VALID_CONFIG,
    boardSize: 200,
    exportQuality: 4
  });
  const max = getMaxCanvasSize();
  assert.ok(huge.canvasWidth <= max + 4, `${huge.canvasWidth} <= ${max}+4`);
  assert.ok(huge.canvasHeight <= max + 4);
  assert.ok(huge.willBeReduced);
  assert.ok(huge.actualQuality < 1);
});

test('getExportInfo produces physical size within reasonable bounds', () => {
  for (const sizeCm of [3, 10, 25]) {
    const info = getExportInfo({ ...VALID_CONFIG, boardSize: sizeCm });
    assert.ok(info.physicalSizeCm > 0);
    assert.ok(info.physicalWidthCm > 0);
    assert.ok(info.physicalHeightCm > 0);
    assert.ok(info.effectiveDPI > 0);
  }
});

test('getExportInfo render engine is deterministically canvas-main-thread in Node', () => {
  assert.equal(getExportInfo(VALID_CONFIG).renderEngine, 'canvas-main-thread');
});

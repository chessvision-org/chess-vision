import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  calculateRenderSurfaceSize,
  estimateFileSizes,
  formatFileSize,
  getExportMode,
  getMaxCanvasSize,
  shouldForceCoordinateBorder
} from '@utils/imageOptimizer';

test('formatFileSize scales unit with magnitude', () => {
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2 KB');
  assert.equal(formatFileSize(5 * 1024 * 1024), '5.0 MB');
});

test('estimateFileSizes stays positive and grows with resolution', () => {
  const small = estimateFileSizes(1000, 1000);
  const large = estimateFileSizes(4000, 4000);

  assert.ok(small.pngBytes > 0);
  assert.ok(small.jpegBytes > 0);
  assert.ok(large.pngBytes > small.pngBytes);
  assert.ok(large.jpegBytes > small.jpegBytes);
});

test('estimateFileSizes bytes-per-pixel falls as the image grows', () => {
  const small = estimateFileSizes(1000, 1000);
  const large = estimateFileSizes(4000, 4000);

  const smallBpp = small.pngBytes / (1000 * 1000);
  const largeBpp = large.pngBytes / (4000 * 4000);

  assert.ok(largeBpp < smallBpp);
});

test('getExportMode maps presets and falls back to print', () => {
  assert.equal(getExportMode(1), 'print');
  assert.equal(getExportMode(2), 'print');
  assert.equal(getExportMode(3), 'social');
  assert.equal(getExportMode(4), 'social');
  assert.equal(getExportMode(5), 'print');
  assert.equal(getExportMode(0), 'print');
});

test('shouldForceCoordinateBorder only for social+ presets', () => {
  assert.equal(shouldForceCoordinateBorder(1), false);
  assert.equal(shouldForceCoordinateBorder(2), false);
  assert.equal(shouldForceCoordinateBorder(3), true);
  assert.equal(shouldForceCoordinateBorder(4), true);
});

test('getMaxCanvasSize is finite and positive', () => {
  const max = getMaxCanvasSize();
  assert.ok(Number.isInteger(max));
  assert.ok(max >= 8192);
});

test('calculateRenderSurfaceSize canvas covers board plus coordinate border', () => {
  const s = calculateRenderSurfaceSize(10, true, 1);
  assert.equal(s.canvasWidth, s.borderSize + s.boardPixels);
  assert.equal(s.canvasHeight, s.borderSize + s.boardPixels);
  assert.equal(s.physicalBoardSizeCm, 10);
});

test('calculateRenderSurfaceSize without coords has no border', () => {
  const s = calculateRenderSurfaceSize(10, false, 1);
  assert.equal(s.borderSize, 0);
  assert.equal(s.canvasWidth, s.boardPixels);
});

test('calculateRenderSurfaceSize physical size stays near the requested cm', () => {
  for (const sizeCm of [5, 10, 20]) {
    const s = calculateRenderSurfaceSize(sizeCm, true, 1);
    assert.ok(
      Math.abs(s.physicalWidthCm - sizeCm) < 1,
      `width ${s.physicalWidthCm}cm deviates from ${sizeCm}cm`
    );
  }
});

test('calculateRenderSurfaceSize scales down oversized boards', () => {
  const huge = calculateRenderSurfaceSize(200, true, 4);
  assert.ok(huge.scaleFactor < 1);
  assert.ok(huge.canvasWidth <= getMaxCanvasSize());
});

test('calculateRenderSurfaceSize adds a thin frame when requested', () => {
  const plain = calculateRenderSurfaceSize(10, true, 1);
  const framed = calculateRenderSurfaceSize(10, true, 1, true);
  assert.equal(framed.shouldShowFrame, true);
  assert.ok(framed.frameThickness > 0);
  assert.ok(framed.canvasWidth > plain.canvasWidth);
});

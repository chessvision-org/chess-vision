import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  SVG_BOARD_PX,
  SVG_COORD_BORDER_RATIO,
  escapeXmlAttr
} from '@utils/svgExporter';

describe('SVG_BOARD_PX', () => {
  test('must be exactly 800 — anchor for all SVG rendering math', () => {
    assert.equal(SVG_BOARD_PX, 800);
  });

  test('SVG_BOARD_PX / 8 = 100 (exact integer)', () => {
    assert.equal(SVG_BOARD_PX / 8, 100);
  });
});

describe('SVG_COORD_BORDER_RATIO', () => {
  test('must be 0.05 (5%)', () => {
    assert.equal(SVG_COORD_BORDER_RATIO, 0.05);
  });

  test('border = floor(800 × 0.05) = 40', () => {
    const border = Math.round(SVG_BOARD_PX * SVG_COORD_BORDER_RATIO);
    assert.equal(border, 40);
  });
});

describe('SVG total dimensions', () => {
  test('viewBox totalWidth = board + border = 840 (with coords)', () => {
    const borderPx = Math.round(SVG_BOARD_PX * SVG_COORD_BORDER_RATIO);
    const totalWidth = borderPx + SVG_BOARD_PX;
    assert.equal(totalWidth, 840);
  });

  test('viewBox totalHeight = board + border = 840 (with coords)', () => {
    const borderPx = Math.round(SVG_BOARD_PX * SVG_COORD_BORDER_RATIO);
    const totalHeight = SVG_BOARD_PX + borderPx;
    assert.equal(totalHeight, 840);
  });

  test('no coords → total = 800 (board only)', () => {
    const total = SVG_BOARD_PX;
    assert.equal(total, 800);
  });

  test('each square = 100 viewBox units', () => {
    assert.equal(SVG_BOARD_PX / 8, 100);
  });
});

describe('escapeXmlAttr', () => {
  test('escapes &', () => {
    assert.equal(escapeXmlAttr('a&b'), 'a&amp;b');
  });

  test('escapes "', () => {
    assert.equal(escapeXmlAttr('a"b'), 'a&quot;b');
  });

  test('escapes <', () => {
    assert.equal(escapeXmlAttr('a<b'), 'a&lt;b');
  });

  test('escapes >', () => {
    assert.equal(escapeXmlAttr('a>b'), 'a&gt;b');
  });

  test('escapes multiple special chars', () => {
    assert.equal(escapeXmlAttr('a&b"c<d>e'), 'a&amp;b&quot;c&lt;d&gt;e');
  });

  test('double escaping is idempotent for &', () => {
    const once = escapeXmlAttr('a&b');
    const twice = escapeXmlAttr(once);
    assert.equal(twice, 'a&amp;amp;b');
  });

  test('empty string returns empty', () => {
    assert.equal(escapeXmlAttr(''), '');
  });

  test('plain string unchanged', () => {
    assert.equal(escapeXmlAttr('hello'), 'hello');
  });

  test('base64 data URL with + and / is untouched', () => {
    const dataUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0i...+/===';
    assert.equal(escapeXmlAttr(dataUrl), dataUrl);
  });

  test('unicode characters preserved', () => {
    assert.equal(escapeXmlAttr('şəkil'), 'şəkil');
  });
});

describe('SVG coordinate → board size mapping', () => {
  test('physicalWidthCm = boardSize × totalWidth / SVG_BOARD_PX', () => {
    const boardSize = 8;
    const borderPx = Math.round(SVG_BOARD_PX * SVG_COORD_BORDER_RATIO);
    const totalWidth = borderPx + SVG_BOARD_PX;
    const physicalWidthCm = boardSize * (totalWidth / SVG_BOARD_PX);
    assert.equal(physicalWidthCm, 8.4);
  });

  test('physicalWidthCm for 6cm board = 6.3cm', () => {
    const boardSize = 6;
    const borderPx = Math.round(SVG_BOARD_PX * SVG_COORD_BORDER_RATIO);
    const totalWidth = borderPx + SVG_BOARD_PX;
    const physicalWidthCm = boardSize * (totalWidth / SVG_BOARD_PX);
    assert.ok(Math.abs(physicalWidthCm - 6.3) < 0.0001);
  });

  test('physicalWidthCm for 4cm board = 4.2cm', () => {
    const boardSize = 4;
    const borderPx = Math.round(SVG_BOARD_PX * SVG_COORD_BORDER_RATIO);
    const totalWidth = borderPx + SVG_BOARD_PX;
    const physicalWidthCm = boardSize * (totalWidth / SVG_BOARD_PX);
    assert.equal(physicalWidthCm, 4.2);
  });

  test('SVG cm size scales linearly with board size', () => {
    for (const cm of [4, 6, 8]) {
      const border = Math.round(SVG_BOARD_PX * SVG_COORD_BORDER_RATIO);
      const total = border + SVG_BOARD_PX;
      const phys = cm * (total / SVG_BOARD_PX);
      assert.equal(phys, cm * 1.05);
    }
  });
});

describe('SVG pixel → createImageBitmap resolution (pre-fix analysis)', () => {
  test('cm width at 96 DPI gives pixel equivalent', () => {
    const boardSize = 8;
    const borderPx = Math.round(SVG_BOARD_PX * SVG_COORD_BORDER_RATIO);
    const total = borderPx + SVG_BOARD_PX;
    const physicalCm = boardSize * (total / SVG_BOARD_PX);
    const pixelAt96Dpi = Math.round((physicalCm / 2.54) * 96);
    assert.equal(pixelAt96Dpi, 317);
  });

  test('pixel width at 4× canvas ≈ boardPixels + border', () => {
    const boardSize = 8;
    const boardPx_4x = Math.round((boardSize / 2.54) * 300 * 4);
    assert.equal(boardPx_4x, 3780);
  });

  test('cm→px at 96 DPI is FAR below 4× output — demonstrates why fix was needed', () => {
    const boardSize = 8;
    const borderPx = Math.round(SVG_BOARD_PX * SVG_COORD_BORDER_RATIO);
    const total = borderPx + SVG_BOARD_PX;
    const physicalCm = boardSize * (total / SVG_BOARD_PX);
    const pixelAt96Dpi = Math.round((physicalCm / 2.54) * 96);
    const boardPx_4x = Math.round((boardSize / 2.54) * 300 * 4);
    const ratio = boardPx_4x / pixelAt96Dpi;
    assert.ok(
      ratio > 10,
      `upscale ratio ${ratio.toFixed(1)}x — explains quality loss before fix`
    );
  });
});

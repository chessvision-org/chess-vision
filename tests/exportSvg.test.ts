import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildBoardSvg,
  calcCanvasWidth,
  intrinsicPxOf,
  resizePieceSvg,
} from "../app/views/helpers/exportSvg.ts";

const PIECE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="512" height="512">' +
  '<rect width="45" height="45" fill="#fff"/></svg>';

test("calcCanvasWidth scales with board size and quality", () => {
  const base = calcCanvasWidth(8, true, 1, false);
  const double = calcCanvasWidth(8, true, 2, false);

  assert.ok(base > 0);
  assert.ok(double > base);
  assert.equal(calcCanvasWidth(8, true, 1, false), calcCanvasWidth(8, true, 1, false));
});

test("calcCanvasWidth matches the on-screen 8cm/600 DPI surface", () => {
  // (8 / 2.54) * 600 = 1890 px board + 5% coordinate border
  assert.equal(calcCanvasWidth(8, true, 2, false), 1985);
});

test("intrinsicPxOf converts px/mm/pt dimensions to pixels", () => {
  assert.equal(intrinsicPxOf('<svg width="512" height="512"/>'), 512);
  assert.equal(intrinsicPxOf('<svg width="50mm" height="50mm" viewBox="0 0 50 50"/>'), 189);
  assert.equal(intrinsicPxOf('<svg width="700pt" height="700pt" viewBox="0 0 933 933"/>'), 933);
  assert.equal(intrinsicPxOf('<svg viewBox="0 0 45 45"/>'), 0);
});

test("resizePieceSvg overrides root width/height attributes", () => {
  const resized = resizePieceSvg(PIECE_SVG, 1200);
  const match = /<svg([^>]*?)>/.exec(resized);

  assert.ok(match, "root svg tag preserved");
  assert.match(match[1], /\swidth="1200"/);
  assert.match(match[1], /\sheight="1200"/);
});

test("resizePieceSvg adds width/height when absent", () => {
  const resized = resizePieceSvg(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"></svg>',
    800,
  );
  const match = /<svg([^>]*?)>/.exec(resized);

  assert.ok(match, "root svg tag preserved");
  assert.match(match[1], /\swidth="800"/);
  assert.match(match[1], /\sheight="800"/);
});

test("buildBoardSvg never shrinks piece intrinsic below source size", () => {
  const svg = buildBoardSvg({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    pieceStyle: "cburnett",
    showCoords: true,
    boardSize: 8,
    exportQuality: 1,
    lightSquare: "#f0d9b5",
    darkSquare: "#b58863",
  });

  const match = /<image href="data:image\/svg\+xml;base64,([^"]+)"/.exec(svg);
  assert.ok(match, "embedded piece data URL found");

  const pieceSvg = Buffer.from(match[1], "base64").toString("utf8");
  // cburnett source is 512px; a low-res export must not shrink it
  assert.match(pieceSvg, /\swidth="512"/);
  assert.match(pieceSvg, /\sheight="512"/);
});

test("buildBoardSvg embeds pieces without breaking the document", () => {
  const svg = buildBoardSvg({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    pieceStyle: "cburnett",
    showCoords: true,
    boardSize: 8,
    exportQuality: 4,
    lightSquare: "#f0d9b5",
    darkSquare: "#b58863",
  });

  assert.match(svg, /^<svg/);
  assert.match(svg, /<image href="data:image\/svg\+xml;base64,/);
  assert.match(svg, /<\/svg>$/);
});

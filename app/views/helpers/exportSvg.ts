import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import {
  getDisplayCoordinates,
  isLightSquare,
  parseFEN,
  sanitizeInput,
} from "@chessviewer-org/chess-viewer";

import { PUBLIC_DIR } from "../../config";

// Constants
const SVG_BOARD_PX = 800;
const SVG_COORD_BORDER_RATIO = 0.05;

const PIECE_KEYS = [
  "wK",
  "wQ",
  "wR",
  "wB",
  "wN",
  "wP",
  "bK",
  "bQ",
  "bR",
  "bB",
  "bN",
  "bP",
] as const;

const MAX_PIECE_STYLE_LENGTH = 40;
const MIN_PIECE_INTRINSIC_PX = 64;
const MAX_PIECE_INTRINSIC_PX = 2048;

interface PieceStyleCache {
  [style: string]: { [key: string]: string };
}

const pieceDataUrlCache: PieceStyleCache = {};

export function calcCanvasWidth(
  boardSize: number,
  showCoords: boolean,
  exportQuality: number,
  showThinFrame: boolean,
): number {
  const safeQ = Number.isFinite(exportQuality) && exportQuality > 0 ? exportQuality : 1;
  const rawBoard = Math.round((boardSize / 2.54) * 300 * safeQ);
  const borderSize = showCoords ? Math.round(Math.max(18, Math.min(800, rawBoard * 0.05))) : 0;
  const frame = showThinFrame ? Math.max(2, Math.round(rawBoard * 0.003)) : 0;
  const framePad = showThinFrame ? frame * 2 : 0;
  return Math.round(borderSize + rawBoard + framePad);
}

export function intrinsicPxOf(svgText: string): number {
  let maxPx = 0;
  const re = /\b(?:width|height)\s*=\s*"([0-9.]+)\s*(px|mm|cm|pt)?"/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(svgText))) {
    const value = parseFloat(match[1] ?? "");
    if (!Number.isFinite(value)) continue;
    const unit = (match[2] ?? "px").toLowerCase();
    let px = value;
    if (unit === "mm") px = (value / 25.4) * 96;
    else if (unit === "cm") px = (value / 2.54) * 96;
    else if (unit === "pt") px = (value / 72) * 96;
    maxPx = Math.max(maxPx, px);
  }
  return Math.round(maxPx);
}

export function resizePieceSvg(svgText: string, targetPx: number): string {
  const size = String(Math.round(targetPx));
  const resized = svgText.replace(/<svg([^>]*?)>/i, (_match, attrs: string) => {
    let next = attrs;
    next = next.replace(/\s+width\s*=\s*"[^"]*"/i, ` width="${size}"`);
    next = next.replace(/\s+height\s*=\s*"[^"]*"/i, ` height="${size}"`);
    if (!/\swidth\s*=/.test(next)) next += ` width="${size}"`;
    if (!/\sheight\s*=/.test(next)) next += ` height="${size}"`;
    return `<svg${next}>`;
  });
  return resized === svgText ? svgText : resized;
}

export interface BoardSvgConfig {
  fen: string;
  lightSquare: string;
  darkSquare: string;
  pieceStyle?: string;
  showCoords?: boolean;
  showCoordinateBorder?: boolean;
  showThinFrame?: boolean;
  flipped?: boolean;
  boardSize?: number;
  exportQuality?: number;
}

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getPieceKey(fenPiece: string): string | null {
  if (!fenPiece) return null;
  const isWhite = fenPiece === fenPiece.toUpperCase();
  return (isWhite ? "w" : "b") + fenPiece.toUpperCase();
}

function readPieceDataUrl(style: string, key: string, targetSize: number): string {
  if (!/^[a-z0-9]+$/.test(style) || style.length > MAX_PIECE_STYLE_LENGTH) {
    return "";
  }
  if (!/^[wb][KQRBNP]$/.test(key)) return "";

  const cacheKey = `${key}|${targetSize}`;
  const cache = (pieceDataUrlCache[style] ??= {});
  if (cache[cacheKey]) return cache[cacheKey];

  const filePath = join(PUBLIC_DIR, "piece", style, `${key}.svg`);
  try {
    if (!existsSync(filePath)) {
      cache[cacheKey] = "";
      return "";
    }
    const svgText = readFileSync(filePath, "utf8");
    const intrinsic = intrinsicPxOf(svgText);
    const target = Math.min(
      MAX_PIECE_INTRINSIC_PX,
      Math.max(MIN_PIECE_INTRINSIC_PX, intrinsic, targetSize),
    );
    const resized = target > intrinsic ? resizePieceSvg(svgText, target) : svgText;
    const base64 = Buffer.from(resized, "utf8").toString("base64");
    const dataUrl = `data:image/svg+xml;base64,${base64}`;
    cache[cacheKey] = dataUrl;
    return dataUrl;
  } catch {
    cache[cacheKey] = "";
    return "";
  }
}

function isChessBoard(board: unknown): boolean {
  return (
    Array.isArray(board) &&
    board.length === 8 &&
    (board as unknown[]).every((row) => Array.isArray(row) && row.length === 8)
  );
}

export function shouldForceCoordinateBorder(quality: number): boolean {
  return quality === 3 || quality === 4;
}

export function buildBoardSvg(config: BoardSvgConfig): string {
  const {
    fen,
    lightSquare,
    darkSquare,
    pieceStyle = "cburnett",
    showCoords = false,
    showCoordinateBorder = false,
    showThinFrame = false,
    flipped = false,
    boardSize = 8,
    exportQuality = 1,
  } = config;

  const boardPx = SVG_BOARD_PX;
  const squarePx = boardPx / 8;
  const withCoords = !!showCoords;

  const borderPx = withCoords
    ? Math.round(Math.max(18, Math.min(800, boardPx * SVG_COORD_BORDER_RATIO)))
    : 0;

  const withBorder =
    withCoords && (showCoordinateBorder || shouldForceCoordinateBorder(exportQuality));
  const withFrame = !!showThinFrame;
  const framePx = withFrame ? Math.max(2, Math.round(boardPx * 0.003)) * 2 : 0;

  const totalWidth = borderPx + boardPx + framePx;
  const totalHeight = boardPx + borderPx + framePx;
  const boardX = borderPx + (withFrame ? framePx / 2 : 0);
  const boardY = withFrame ? framePx / 2 : 0;

  const parsedBoard = parseFEN(fen);
  if (!isChessBoard(parsedBoard)) {
    throw new Error("Invalid FEN: unable to parse board");
  }
  const board = parsedBoard;

  const canvasWidth = calcCanvasWidth(boardSize, showCoords, exportQuality, showThinFrame);
  const pieceOutputPx = Math.min(
    MAX_PIECE_INTRINSIC_PX,
    Math.max(MIN_PIECE_INTRINSIC_PX, Math.ceil((squarePx / totalWidth) * canvasWidth)),
  );

  const pieceDataURLs: Record<string, string> = {};
  PIECE_KEYS.forEach((key) => {
    pieceDataURLs[key] = readPieceDataUrl(pieceStyle, key, pieceOutputPx);
  });

  const fontSize = Math.round(Math.max(10, Math.min(480, borderPx * 0.72)));
  const fontFamily =
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
  const coordTextColor = "#000000";
  const parts: string[] = [];

  const physicalWidthCm = boardSize * (totalWidth / boardPx);
  const physicalHeightCm = boardSize * (totalHeight / boardPx);

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
      `viewBox="0 0 ${totalWidth} ${totalHeight}" ` +
      `width="${physicalWidthCm.toFixed(2)}cm" height="${physicalHeightCm.toFixed(2)}cm" ` +
      `role="img" aria-label="Chess Board Position">` +
      `<title>Chess Board Position</title>`,
  );

  if (withBorder) {
    parts.push(
      `<rect x="${boardX - borderPx + (withFrame ? framePx / 2 : 0)}" y="${boardY}" ` +
        `width="${borderPx}" height="${boardPx}" fill="#ffffff"/>`,
      `<rect x="${boardX - borderPx + (withFrame ? framePx / 2 : 0)}" y="${boardY + boardPx}" ` +
        `width="${boardPx + borderPx}" height="${borderPx}" fill="#ffffff"/>`,
    );
  }

  if (withFrame) {
    const f = framePx / 2;
    parts.push(
      `<rect x="0" y="0" width="${totalWidth}" height="${f}" fill="#333333"/>`,
      `<rect x="0" y="${totalHeight - f}" width="${totalWidth}" height="${f}" fill="#333333"/>`,
      `<rect x="0" y="0" width="${f}" height="${totalHeight}" fill="#333333"/>`,
      `<rect x="${totalWidth - f}" y="0" width="${f}" height="${totalHeight}" fill="#333333"/>`,
    );
  }

  const borderStroke = Math.max(1, Math.round(boardPx * 0.002));
  const bHalf = borderStroke / 2;
  parts.push(
    `<rect x="${boardX - bHalf}" y="${boardY - bHalf}" ` +
      `width="${boardPx + borderStroke}" height="${boardPx + borderStroke}" ` +
      `fill="none" stroke="#000000" stroke-width="${borderStroke}"/>`,
  );

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const [visRow, visCol] = getDisplayCoordinates(row, col, flipped);
      const color = isLightSquare(row, col) ? lightSquare : darkSquare;
      const x = boardX + visCol * squarePx;
      const y = boardY + visRow * squarePx;
      parts.push(
        `<rect x="${x}" y="${y}" width="${squarePx}" height="${squarePx}" ` +
          `fill="${sanitizeInput(color)}"/>`,
      );
    }
  }

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const key = getPieceKey(board[row]?.[col] ?? "");
      const dataURL = key ? pieceDataURLs[key] : null;
      if (!dataURL) continue;

      const [visRow, visCol] = getDisplayCoordinates(row, col, flipped);
      const x = boardX + visCol * squarePx;
      const y = boardY + visRow * squarePx;
      parts.push(
        `<image href="${escapeXmlAttr(dataURL)}" x="${x}" y="${y}" ` +
          `width="${squarePx}" height="${squarePx}" ` +
          `image-rendering="optimizeQuality"/>`,
      );
    }
  }

  if (withCoords) {
    const files = flipped
      ? ["h", "g", "f", "e", "d", "c", "b", "a"]
      : ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = flipped
      ? ["1", "2", "3", "4", "5", "6", "7", "8"]
      : ["8", "7", "6", "5", "4", "3", "2", "1"];

    const textAttrs =
      `font-family="${sanitizeInput(fontFamily)}" font-size="${fontSize}" ` +
      `font-weight="600" fill="${sanitizeInput(coordTextColor)}" text-anchor="middle"`;

    for (let col = 0; col < 8; col++) {
      const x = boardX + col * squarePx + squarePx / 2;
      const y = boardY + boardPx + borderPx * 0.55 + fontSize * 0.35;
      parts.push(`<text x="${x}" y="${y}" ${textAttrs}>${sanitizeInput(files[col])}</text>`);
    }

    for (let row = 0; row < 8; row++) {
      const frameOffset = withFrame ? framePx / 2 : 0;
      const x = frameOffset + borderPx * 0.5;
      const y = boardY + row * squarePx + squarePx / 2 + fontSize * 0.35;
      parts.push(`<text x="${x}" y="${y}" ${textAttrs}>${sanitizeInput(ranks[row])}</text>`);
    }
  }
  parts.push("</svg>");
  return parts.join("\n");
}

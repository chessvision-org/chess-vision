import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  getDisplayCoordinates,
  isLightSquare,
  parseFEN,
  sanitizeInput
} from '@chessviewer-org/chess-viewer';

import { PUBLIC_DIR } from '../../paths';

// Constants
const SVG_BOARD_PX = 800;
const SVG_COORD_BORDER_RATIO = 0.05;

const PIECE_KEYS = [
  'wK',
  'wQ',
  'wR',
  'wB',
  'wN',
  'wP',
  'bK',
  'bQ',
  'bR',
  'bB',
  'bN',
  'bP'
] as const;

const MAX_PIECE_STYLE_LENGTH = 40;

interface PieceStyleCache {
  [style: string]: { [key: string]: string };
}

const pieceDataUrlCache: PieceStyleCache = {};

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
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getPieceKey(fenPiece: string): string | null {
  if (!fenPiece) return null;
  const isWhite = fenPiece === fenPiece.toUpperCase();
  return (isWhite ? 'w' : 'b') + fenPiece.toUpperCase();
}

function readPieceDataUrl(style: string, key: string): string {
  if (!/^[a-z0-9]+$/.test(style) || style.length > MAX_PIECE_STYLE_LENGTH) {
    return '';
  }
  if (!/^[wb][KQRBNP]$/.test(key)) return '';

  const cache = (pieceDataUrlCache[style] ??= {});
  if (cache[key]) return cache[key];

  const filePath = join(PUBLIC_DIR, 'piece', style, `${key}.svg`);
  try {
    if (!existsSync(filePath)) {
      cache[key] = '';
      return '';
    }
    const svg = readFileSync(filePath);
    const base64 = svg.toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64}`;
    cache[key] = dataUrl;
    return dataUrl;
  } catch {
    cache[key] = '';
    return '';
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
    pieceStyle = 'cburnett',
    showCoords = false,
    showCoordinateBorder = false,
    showThinFrame = false,
    flipped = false,
    boardSize = 8,
    exportQuality = 1
  } = config;

  const boardPx = SVG_BOARD_PX;
  const squarePx = boardPx / 8;
  const withCoords = !!showCoords;

  const borderPx = withCoords
    ? Math.round(Math.max(18, Math.min(800, boardPx * SVG_COORD_BORDER_RATIO)))
    : 0;

  const withBorder =
    withCoords &&
    (showCoordinateBorder || shouldForceCoordinateBorder(exportQuality));
  const withFrame = !!showThinFrame;
  const framePx = withFrame ? Math.max(2, Math.round(boardPx * 0.003)) * 2 : 0;

  const totalWidth = borderPx + boardPx + framePx;
  const totalHeight = boardPx + borderPx + framePx;
  const boardX = borderPx + (withFrame ? framePx / 2 : 0);
  const boardY = withFrame ? framePx / 2 : 0;

  const parsedBoard = parseFEN(fen);
  if (!isChessBoard(parsedBoard)) {
    throw new Error('Invalid FEN: unable to parse board');
  }
  const board = parsedBoard;

  const pieceDataURLs: Record<string, string> = {};
  PIECE_KEYS.forEach((key) => {
    pieceDataURLs[key] = readPieceDataUrl(pieceStyle, key);
  });

  const fontSize = Math.round(Math.max(10, Math.min(480, borderPx * 0.72)));
  const fontFamily =
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
  const coordTextColor = '#000000';
  const parts: string[] = [];

  const physicalWidthCm = boardSize * (totalWidth / boardPx);
  const physicalHeightCm = boardSize * (totalHeight / boardPx);

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
      `viewBox="0 0 ${totalWidth} ${totalHeight}" ` +
      `width="${physicalWidthCm.toFixed(2)}cm" height="${physicalHeightCm.toFixed(2)}cm" ` +
      `role="img" aria-label="Chess Board Position">` +
      `<title>Chess Board Position</title>`
  );

  if (withBorder) {
    parts.push(
      `<rect x="${boardX - borderPx + (withFrame ? framePx / 2 : 0)}" y="${boardY}" ` +
        `width="${borderPx}" height="${boardPx}" fill="#ffffff"/>`,
      `<rect x="${boardX - borderPx + (withFrame ? framePx / 2 : 0)}" y="${boardY + boardPx}" ` +
        `width="${boardPx + borderPx}" height="${borderPx}" fill="#ffffff"/>`
    );
  }

  if (withFrame) {
    const f = framePx / 2;
    parts.push(
      `<rect x="0" y="0" width="${totalWidth}" height="${f}" fill="#333333"/>`,
      `<rect x="0" y="${totalHeight - f}" width="${totalWidth}" height="${f}" fill="#333333"/>`,
      `<rect x="0" y="0" width="${f}" height="${totalHeight}" fill="#333333"/>`,
      `<rect x="${totalWidth - f}" y="0" width="${f}" height="${totalHeight}" fill="#333333"/>`
    );
  }

  const borderStroke = Math.max(1, Math.round(boardPx * 0.002));
  const bHalf = borderStroke / 2;
  parts.push(
    `<rect x="${boardX - bHalf}" y="${boardY - bHalf}" ` +
      `width="${boardPx + borderStroke}" height="${boardPx + borderStroke}" ` +
      `fill="none" stroke="#000000" stroke-width="${borderStroke}"/>`
  );

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const [visRow, visCol] = getDisplayCoordinates(row, col, flipped);
      const color = isLightSquare(row, col) ? lightSquare : darkSquare;
      const x = boardX + visCol * squarePx;
      const y = boardY + visRow * squarePx;
      parts.push(
        `<rect x="${x}" y="${y}" width="${squarePx}" height="${squarePx}" ` +
          `fill="${sanitizeInput(color)}"/>`
      );
    }
  }

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const key = getPieceKey(board[row]?.[col] ?? '');
      const dataURL = key ? pieceDataURLs[key] : null;
      if (!dataURL) continue;

      const [visRow, visCol] = getDisplayCoordinates(row, col, flipped);
      const x = boardX + visCol * squarePx;
      const y = boardY + visRow * squarePx;
      parts.push(
        `<image href="${escapeXmlAttr(dataURL)}" x="${x}" y="${y}" ` +
          `width="${squarePx}" height="${squarePx}" ` +
          `image-rendering="optimizeQuality"/>`
      );
    }
  }

  if (withCoords) {
    const files = flipped
      ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
      : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = flipped
      ? ['1', '2', '3', '4', '5', '6', '7', '8']
      : ['8', '7', '6', '5', '4', '3', '2', '1'];

    const textAttrs =
      `font-family="${sanitizeInput(fontFamily)}" font-size="${fontSize}" ` +
      `font-weight="600" fill="${sanitizeInput(coordTextColor)}" text-anchor="middle"`;

    for (let col = 0; col < 8; col++) {
      const x = boardX + col * squarePx + squarePx / 2;
      const y = boardY + boardPx + borderPx * 0.55 + fontSize * 0.35;
      parts.push(
        `<text x="${x}" y="${y}" ${textAttrs}>${sanitizeInput(files[col])}</text>`
      );
    }

    for (let row = 0; row < 8; row++) {
      const frameOffset = withFrame ? framePx / 2 : 0;
      const x = frameOffset + borderPx * 0.5;
      const y = boardY + row * squarePx + squarePx / 2 + fontSize * 0.35;
      parts.push(
        `<text x="${x}" y="${y}" ${textAttrs}>${sanitizeInput(ranks[row])}</text>`
      );
    }
  }
  parts.push('</svg>');
  return parts.join('\n');
}

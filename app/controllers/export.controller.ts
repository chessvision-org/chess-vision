import type { Request, Response } from 'express';

import { isValidHexColor } from '@chessviewer-org/chess-viewer';

import { renderPage } from '../views/render';
import { ExportPage } from '../views/templates/export';
import { buildBoardSvg } from '../views/helpers/exportSvg';
import {
  EXPORT_BREADCRUMB_SCHEMA,
  EXPORT_HOWTO_SCHEMA,
  SOFTWARE_APP_SCHEMA
} from '../views/helpers/seo';

type ExportTab = 'board-style' | 'export-settings';

function parseTab(value: unknown): ExportTab {
  return value === 'export-settings' ? 'export-settings' : 'board-style';
}

function queryFlag(value: unknown): boolean {
  return value === '1' || value === 'true';
}

function clampInt(
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  const n = typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), min), max);
}

export function index(req: Request, res: Response): void {
  const tab = parseTab(req.query.tab);
  const fen = typeof req.query.fen === 'string' ? req.query.fen : undefined;

  res.send(
    renderPage({
      path: '/export',
      schemas: [
        SOFTWARE_APP_SCHEMA,
        EXPORT_HOWTO_SCHEMA,
        EXPORT_BREADCRUMB_SCHEMA
      ],
      children: ExportPage({ tab, fen })
    })
  );
}

export function svg(req: Request, res: Response): void {
  const fen = typeof req.query.fen === 'string' ? req.query.fen : '';
  const pieceStyle =
    typeof req.query.style === 'string'
      ? req.query.style.slice(0, 40)
      : 'cburnett';
  const lightRaw =
    typeof req.query.light === 'string' ? req.query.light : '#f0d9b5';
  const darkRaw =
    typeof req.query.dark === 'string' ? req.query.dark : '#b58863';

  const lightSquare = isValidHexColor(lightRaw) ? lightRaw : '#f0d9b5';
  const darkSquare = isValidHexColor(darkRaw) ? darkRaw : '#b58863';

  if (!fen) {
    res.status(400).send('FEN is required');
    return;
  }

  try {
    const svg = buildBoardSvg({
      fen,
      lightSquare,
      darkSquare,
      pieceStyle,
      showCoords: queryFlag(req.query.coords),
      showCoordinateBorder: queryFlag(req.query.border),
      showThinFrame: queryFlag(req.query.frame),
      flipped: queryFlag(req.query.flipped),
      boardSize: clampInt(req.query.size, 8, 4, 40),
      exportQuality: clampInt(req.query.quality, 2, 1, 4)
    });
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(svg);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Invalid FEN';
    res.status(400).send(message);
  }
}

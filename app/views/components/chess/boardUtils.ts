export const STARTING_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';

export const MAX_FEN_LENGTH = 80;

export interface PalettePiece {
  key: string;
  color: 'w' | 'b';
  name: string;
}

export const PALETTE_PIECES: PalettePiece[] = [
  { key: 'wK', color: 'w', name: 'White King' },
  { key: 'wQ', color: 'w', name: 'White Queen' },
  { key: 'wR', color: 'w', name: 'White Rook' },
  { key: 'wB', color: 'w', name: 'White Bishop' },
  { key: 'wN', color: 'w', name: 'White Knight' },
  { key: 'wP', color: 'w', name: 'White Pawn' },
  { key: 'bK', color: 'b', name: 'Black King' },
  { key: 'bQ', color: 'b', name: 'Black Queen' },
  { key: 'bR', color: 'b', name: 'Black Rook' },
  { key: 'bB', color: 'b', name: 'Black Bishop' },
  { key: 'bN', color: 'b', name: 'Black Knight' },
  { key: 'bP', color: 'b', name: 'Black Pawn' }
];

const PIECE_NAMES: Record<string, string> = {
  K: 'King',
  Q: 'Queen',
  R: 'Rook',
  B: 'Bishop',
  N: 'Knight',
  P: 'Pawn'
};

export const FILES = 'abcdefgh';

export function boardField(fen: string): string {
  return fen.trim().split(/\s+/)[0] ?? '';
}

export function isValidPlacement(placement: string): boolean {
  if (!placement) return false;
  if (!/^[rnbqkpRNBQKP1-8/]+$/.test(placement)) return false;
  const ranks = placement.split('/');
  if (ranks.length !== 8) return false;
  return ranks.every((rank) => {
    if (!rank) return false;
    let squares = 0;
    for (const ch of rank) {
      squares += ch >= '1' && ch <= '8' ? Number(ch) : 1;
    }
    return squares === 8;
  });
}

export function isValidFen(fen: string): boolean {
  if (!fen || fen.length > MAX_FEN_LENGTH) return false;
  return isValidPlacement(boardField(fen));
}

export function parsePlacement(placement: string): string[][] {
  const ranks = placement.split('/');
  const board: string[][] = [];
  for (let ri = 0; ri < 8; ri++) {
    const row: string[] = [];
    for (const ch of ranks[ri] ?? '') {
      if (ch >= '1' && ch <= '8') {
        for (let k = 0; k < Number(ch); k++) row.push('');
      } else {
        row.push(ch);
      }
    }
    while (row.length < 8) row.push('');
    board.push(row.slice(0, 8));
  }
  return board;
}

export function boardToPlacement(board: string[][]): string {
  return board
    .map((row) => {
      let out = '';
      let empty = 0;
      for (const cell of row) {
        if (!cell) {
          empty++;
        } else {
          if (empty > 0) {
            out += String(empty);
            empty = 0;
          }
          out += cell;
        }
      }
      if (empty > 0) out += String(empty);
      return out;
    })
    .join('/');
}

export function pieceKey(cell: string): string {
  if (!cell) return '';
  const white = cell === cell.toUpperCase();
  return (white ? 'w' : 'b') + cell.toUpperCase();
}

export function pieceChar(key: string): string {
  if (!key || key.length !== 2) return '';
  const char = key[1] ?? '';
  return key[0] === 'w' ? char.toUpperCase() : char.toLowerCase();
}

export function pieceName(key: string): string {
  if (!key || key.length !== 2) return 'Piece';
  const color = key[0] === 'w' ? 'White' : 'Black';
  const type = PIECE_NAMES[(key[1] ?? '').toUpperCase()] ?? 'Piece';
  return `${color} ${type}`;
}

export function pieceSrc(key: string, style: string): string {
  return key ? `/piece/${style}/${key}.svg` : '';
}

export function squareIsLight(row: number, col: number): boolean {
  return (row + col) % 2 === 0;
}

export function squareLabel(row: number, col: number): string {
  return FILES[col] + String(8 - row);
}

export function defaultMetadata(fen: string): string {
  const rest = fen.trim().split(/\s+/).slice(1).join(' ');
  return rest || 'w - - 0 1';
}

// ===== Database search URL builders =====

export type DatabaseProvider = 'lichess' | 'chessdb' | 'pdb' | 'yacpdb';

const PDB_PIECE_DE: Record<string, string> = {
  K: 'K',
  Q: 'D',
  R: 'T',
  B: 'L',
  N: 'S',
  P: 'B'
};

const YAC_TEXT_FIELDS = 14;
const YAC_CHECKBOX_DEFAULTS = ['0', '0', '0', '0'];

function yacEscapeAndJoin(parts: string[]): string {
  return parts
    .map((p) => p.replace(/\\/g, '\\\\').replace(/\//g, '\\/'))
    .join('/');
}

function yacB64(s: string): string {
  const bytes = Buffer.from(s, 'utf-8');
  return bytes.toString('base64').replace(/\//g, '*');
}

function pieceTokens(
  fen: string,
  colorFor: (white: boolean) => string,
  letterFor: Record<string, string>
): string[] {
  const tokens: string[] = [];
  const ranks = boardField(fen).split('/');

  for (let ri = 0; ri < ranks.length; ri++) {
    const rankStr = ranks[ri] ?? '';
    const rankNum = 8 - ri;
    let fileIdx = 0;

    for (const ch of rankStr) {
      if (ch >= '1' && ch <= '8') {
        fileIdx += Number(ch);
        continue;
      }
      const isWhite = ch === ch.toUpperCase();
      const type = letterFor[ch.toUpperCase()] ?? '?';
      const file = FILES[fileIdx] ?? '?';
      tokens.push(`${colorFor(isWhite)}${type}${file}${rankNum}`);
      fileIdx++;
    }
  }
  return tokens;
}

export function buildLichessUrl(fen: string): string {
  const path = fen
    .trim()
    .split(' ')
    .map((seg) => seg.split('/').map(encodeURIComponent).join('/'))
    .join('_');
  return `https://lichess.org/analysis/standard/${path}`;
}

export function buildChessdbUrl(fen: string): string {
  const query = fen.trim().replace(/ /g, '_');
  return `https://www.chessdb.cn/queryc_en/?${query}`;
}

export function buildPdbUrl(fen: string): string {
  const tokens = pieceTokens(fen, (w) => (w ? 'w' : 's'), PDB_PIECE_DE);
  const query = encodeURIComponent(`POSITION='${tokens.join(' ')}'`);
  return `https://pdb.dieschwalbe.de/search.jsp?expression=${query}`;
}

export function buildYacpdbUrl(fen: string): string {
  const parts = new Array<string>(YAC_TEXT_FIELDS).fill('');
  parts[0] = boardField(fen);
  const encoded = yacB64(
    yacEscapeAndJoin([...parts, ...YAC_CHECKBOX_DEFAULTS])
  );
  return `https://www.yacpdb.org/#search/${encoded}/1`;
}

export function buildDbUrl(provider: DatabaseProvider, fen: string): string {
  switch (provider) {
    case 'lichess':
      return buildLichessUrl(fen);
    case 'chessdb':
      return buildChessdbUrl(fen);
    case 'pdb':
      return buildPdbUrl(fen);
    case 'yacpdb':
      return buildYacpdbUrl(fen);
    default:
      return '#';
  }
}

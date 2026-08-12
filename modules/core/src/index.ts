export type Fen = string;
export type Color = 'white' | 'black';
export type Piece = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Square = string;
export type BoardMatrix = (string | null)[][];

export const STARTING_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export const EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';
export const MAX_FEN_LENGTH = 80;

export const PIECE_UNICODE: Record<string, string> = {
  K: '♔',
  Q: '♕',
  R: '♖',
  B: '♗',
  N: '♘',
  P: '♙',
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟'
};

export const SQUARE_COLORS: Record<string, 'light' | 'dark'> = {};
for (let r = 0; r < 8; r++) {
  for (let f = 0; f < 8; f++) {
    const file = 'abcdefgh'[f];
    const rank = '' + (8 - r);
    SQUARE_COLORS[`${file}${rank}`] = (r + f) % 2 === 0 ? 'light' : 'dark';
  }
}

export function parseFenToMatrix(fen: Fen): BoardMatrix {
  const parts = fen.split(' ');
  const ranks = parts[0]?.split('/');
  if (!ranks || ranks.length !== 8)
    return Array.from({ length: 8 }, () => Array(8).fill(null));
  return ranks.map((rank) => {
    const row: (string | null)[] = [];
    for (const ch of rank) {
      if (ch >= '1' && ch <= '8') {
        for (let i = 0; i < parseInt(ch); i++) row.push(null);
      } else {
        row.push(ch);
      }
    }
    return row;
  });
}

export function isValidFen(fen: string): boolean {
  if (!fen || fen.length > MAX_FEN_LENGTH) return false;
  const parts = fen.trim().split(' ');
  if (parts.length < 4 || parts.length > 6) return false;
  const ranksPart = parts[0];
  const turnPart = parts[1];
  if (!ranksPart || !turnPart) return false;
  const ranks = ranksPart.split('/');
  if (ranks.length !== 8) return false;
  const pieceChars = 'prnbqkPRNBQK';
  for (const rank of ranks) {
    let count = 0;
    for (const ch of rank) {
      if (ch >= '1' && ch <= '8') count += parseInt(ch);
      else if (pieceChars.includes(ch)) count++;
      else return false;
    }
    if (count !== 8) return false;
  }
  if (!['w', 'b'].includes(turnPart)) return false;
  return true;
}

export function fenToDisplayName(fen: Fen): string {
  if (fen === STARTING_FEN) return 'Starting Position';
  if (fen === EMPTY_FEN) return 'Empty Board';
  const parts = fen.split(' ');
  const turn = parts[1] === 'w' ? 'White' : 'Black';
  const moves = parts[5] || '0';
  return `${turn} · ${moves} move(s)`;
}

// Helpers
export function boardField(fen: string): string {
  return fen.trim().split(/\s+/)[0] ?? '';
}

export function isValidBoardField(board: string): boolean {
  if (!board || board.length > 100) return false;
  const ranks = board.split('/');
  if (ranks.length !== 8) return false;
  for (const rank of ranks) {
    if (!/^[pnbrqkPNBRQK1-8]+$/.test(rank)) return false;
    if (/\d\d/.test(rank)) return false;
    let squares = 0;
    for (const ch of rank) {
      squares += ch >= '1' && ch <= '8' ? ch.charCodeAt(0) - 48 : 1;
    }
    if (squares !== 8) return false;
  }
  return true;
}

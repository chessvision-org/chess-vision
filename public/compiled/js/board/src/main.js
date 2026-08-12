// node_modules/@chessviewer-org/chess-viewer/dist/index.js
var MAX_FEN_LENGTH = 93;
var VALID_PIECES = /* @__PURE__ */ new Set(["p", "n", "b", "r", "q", "k", "P", "N", "B", "R", "Q", "K"]);
var VALID_DIGITS = /* @__PURE__ */ new Set(["1", "2", "3", "4", "5", "6", "7", "8"]);
function isPieceSymbol(char) {
  return VALID_PIECES.has(char);
}
var FENParseError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "FENParseError";
  }
};
function parseFEN(fenString) {
  if (!fenString || typeof fenString !== "string")
    throw new FENParseError("Invalid FEN string");
  if (fenString.length > MAX_FEN_LENGTH)
    throw new FENParseError("FEN string exceeds maximum length");
  const trimmed = fenString.trim();
  if (trimmed.length === 0) throw new FENParseError("FEN string is empty");
  const position = trimmed.split(/\s+/)[0] ?? "";
  const rows = position.split("/");
  if (rows.length !== 8)
    throw new FENParseError(`Invalid FEN: expected 8 ranks, got ${rows.length}`);
  const board = [];
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    if (row === void 0) continue;
    const boardRow = [];
    let squareCount = 0;
    for (const char of row) {
      if (VALID_DIGITS.has(char)) {
        const count = parseInt(char, 10);
        squareCount += count;
        for (let i = 0; i < count; i++) boardRow.push("");
      } else {
        if (!isPieceSymbol(char))
          throw new FENParseError(`Invalid piece character '${char}' in rank ${rowIndex + 1}`);
        squareCount++;
        boardRow.push(char);
      }
    }
    if (squareCount !== 8)
      throw new FENParseError(`Rank ${rowIndex + 1} has ${squareCount} squares instead of 8`);
    board.push(boardRow);
  }
  if (board.length !== 8)
    throw new FENParseError(`Invalid board structure: ${board.length} ranks`);
  return board;
}
var DAY_MS = 24 * 60 * 60 * 1e3;
var SEVEN_DAYS_MS = 7 * DAY_MS;
var THIRTY_DAYS_MS = 30 * DAY_MS;
var NINETY_DAYS_MS = 90 * DAY_MS;
var crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    t[n] = c;
  }
  return t;
})();

// ui/board/src/main.ts
var boardApi = {
  setFen(fen) {
    try {
      const parsed = parseFEN(fen);
      console.log("Board FEN updated:", fen, parsed);
    } catch {
      console.warn("Invalid FEN:", fen);
    }
  }
};
window.boardApi = boardApi;
window.initBoard = (fen) => {
  boardApi.setFen(fen);
};
console.log("ChessViewer board initialized");

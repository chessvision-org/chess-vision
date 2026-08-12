var ChessViewer = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/@chessviewer-org/chess-viewer/dist/index.js
  var index_exports = {};
  __export(index_exports, {
    BOARD_THEMES: () => BOARD_THEMES,
    DEFAULT_DARK_SQUARE: () => DEFAULT_DARK_SQUARE,
    DEFAULT_LIGHT_SQUARE: () => DEFAULT_LIGHT_SQUARE,
    EMPTY_FEN: () => EMPTY_FEN,
    FENParseError: () => FENParseError,
    MAX_FEN_LENGTH: () => MAX_FEN_LENGTH,
    PIECES: () => PIECES,
    PIECE_MAP: () => PIECE_MAP,
    PIECE_SETS: () => PIECE_SETS,
    PIECE_SET_POPULARITY: () => PIECE_SET_POPULARITY,
    QUALITY_PRESETS: () => QUALITY_PRESETS,
    STARTING_FEN: () => STARTING_FEN,
    applyDragMove: () => applyDragMove,
    applyDragRemove: () => applyDragRemove,
    applyFilters: () => applyFilters,
    applyPaletteDrop: () => applyPaletteDrop,
    bestTextColor: () => bestTextColor,
    boardToFEN: () => boardToFEN,
    buildFENRecord: () => buildFENRecord,
    calculateStatus: () => calculateStatus,
    changeDPI: () => changeDPI,
    cloneBoard: () => cloneBoard,
    contrastRatio: () => contrastRatio,
    convertToArchivedEntry: () => convertToArchivedEntry,
    countPieces: () => countPieces,
    createBoard: () => createBoard,
    createEmptyBoard: () => createEmptyBoard,
    createHistoryEntry: () => createHistoryEntry,
    describeBoardPosition: () => describeBoardPosition,
    fenPlacementField: () => fenPlacementField,
    findKing: () => findKing,
    flipBoard: () => flipBoard,
    generateDiagram: () => generateDiagram,
    getBoardTheme: () => getBoardTheme,
    getCoordinateParams: () => getCoordinateParams,
    getDisplayCoordinates: () => getDisplayCoordinates,
    getFENValidationError: () => getFENValidationError,
    getPieceAt: () => getPieceAt,
    getPieceSVG: () => getPieceSVG,
    getPieceSet: () => getPieceSet,
    getQualityPreset: () => getQualityPreset,
    getSquareBounds: () => getSquareBounds,
    hasBothKings: () => hasBothKings,
    hexToHsv: () => hexToHsv,
    hexToRgb: () => hexToRgb,
    hsvToHex: () => hsvToHex,
    hsvToRgb: () => hsvToRgb,
    indicesToSquare: () => indicesToSquare,
    isBoardEmpty: () => isBoardEmpty,
    isLightSquare: () => isLightSquare,
    isRecord: () => isRecord,
    isValidArrow: () => isValidArrow,
    isValidHexColor: () => isValidHexColor,
    isValidHighlight: () => isValidHighlight,
    listPieces: () => listPieces,
    listThemeIds: () => listThemeIds,
    materialBalance: () => materialBalance,
    mergeById: () => mergeById,
    movePiece: () => movePiece,
    normalizeFEN: () => normalizeFEN,
    parseFEN: () => parseFEN,
    parseFENRecord: () => parseFENRecord,
    partitionByArchiveStatus: () => partitionByArchiveStatus,
    physicalSize: () => physicalSize,
    pieceSetsByPopularity: () => pieceSetsByPopularity,
    pieceToName: () => pieceToName,
    pointToSquare: () => pointToSquare,
    readImageDimensions: () => readImageDimensions,
    relativeLuminance: () => relativeLuminance,
    removePieceAt: () => removePieceAt,
    renderArrowsSVG: () => renderArrowsSVG,
    renderCheckIndicatorSVG: () => renderCheckIndicatorSVG,
    renderHighlightsSVG: () => renderHighlightsSVG,
    resolveClick: () => resolveClick,
    rgbToHex: () => rgbToHex,
    rgbToHsv: () => rgbToHsv,
    safeJSONParse: () => safeJSONParse,
    sanitizeAnnotations: () => sanitizeAnnotations,
    sanitizeFileName: () => sanitizeFileName,
    sanitizeHexColor: () => sanitizeHexColor,
    sanitizeInput: () => sanitizeInput,
    setPieceAt: () => setPieceAt,
    sortArchivedByArchiveDate: () => sortArchivedByArchiveDate,
    sortByMostRecent: () => sortByMostRecent,
    squareToIndices: () => squareToIndices,
    squareToPoint: () => squareToPoint,
    themeContrast: () => themeContrast,
    themeCoordinateColor: () => themeCoordinateColor,
    toggleActiveColor: () => toggleActiveColor,
    touchEntry: () => touchEntry,
    validateFEN: () => validateFEN,
    validateFENDetailed: () => validateFENDetailed
  });
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
  function countRankSquares(rank) {
    let count = 0;
    for (const char of rank) {
      if (VALID_DIGITS.has(char)) count += parseInt(char, 10);
      else if (VALID_PIECES.has(char)) count++;
      else return { badChar: char };
    }
    return count;
  }
  function parseFEN(fenString) {
    var _a;
    if (!fenString || typeof fenString !== "string")
      throw new FENParseError("Invalid FEN string");
    if (fenString.length > MAX_FEN_LENGTH)
      throw new FENParseError("FEN string exceeds maximum length");
    const trimmed = fenString.trim();
    if (trimmed.length === 0) throw new FENParseError("FEN string is empty");
    const position = (_a = trimmed.split(/\s+/)[0]) != null ? _a : "";
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
  function validateFEN(fen) {
    return getFENValidationError(fen) === "";
  }
  function getFENValidationError(fen) {
    var _a;
    try {
      if (!fen || typeof fen !== "string") return "FEN is empty";
      if (fen.length > MAX_FEN_LENGTH) return "FEN string is too long";
      const position = (_a = fen.trim().split(/\s+/)[0]) != null ? _a : "";
      const rows = position.split("/");
      if (rows.length !== 8) return "Board must have 8 ranks";
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        if (row === void 0) continue;
        const count = countRankSquares(row);
        if (typeof count !== "number") return `Invalid piece character: ${count.badChar}`;
        if (count !== 8) return `Rank ${rowIndex + 1} has ${count} squares`;
      }
      return "";
    } catch (e) {
      return "Invalid FEN";
    }
  }
  function validateFENDetailed(fen) {
    if (!fen || typeof fen !== "string") {
      return { isValid: false, errorMessage: "Error: FEN string is empty or has an invalid format." };
    }
    if (fen.length > MAX_FEN_LENGTH) {
      return { isValid: false, errorMessage: "Error: FEN string is too long." };
    }
    const trimmed = fen.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length !== 6) {
      return {
        isValid: false,
        errorMessage: `Error: A valid FEN must have exactly 6 parts. You provided ${parts.length}.`
      };
    }
    const [position, activeColor, castling, enPassant, halfmove, fullmove] = parts;
    if (!position || !activeColor || !castling || !enPassant || !halfmove || !fullmove) {
      return { isValid: false, errorMessage: "Error: Missing FEN parts." };
    }
    const rows = position.split("/");
    if (rows.length !== 8) {
      return {
        isValid: false,
        errorMessage: `Error: The board must have 8 ranks, but yours has ${rows.length}.`
      };
    }
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (row === void 0) continue;
      const count = countRankSquares(row);
      if (typeof count !== "number") {
        return {
          isValid: false,
          errorMessage: `Error: Invalid character '${count.badChar}' in the piece placement field.`
        };
      }
      if (count !== 8) {
        return {
          isValid: false,
          errorMessage: `Error: Rank ${rowIndex + 1} has ${count} squares instead of 8.`
        };
      }
    }
    if (activeColor !== "w" && activeColor !== "b") {
      return { isValid: false, errorMessage: "Error: Active color must be 'w' (white) or 'b' (black)." };
    }
    if (castling !== "-") {
      if (!/^[KQkq]{1,4}$/.test(castling)) {
        return { isValid: false, errorMessage: "Error: Castling field is invalid." };
      }
      const unique = new Set(castling);
      if (unique.size !== castling.length) {
        return { isValid: false, errorMessage: "Error: Castling field contains duplicate characters." };
      }
    }
    if (enPassant !== "-" && !/^[a-h][36]$/.test(enPassant)) {
      return {
        isValid: false,
        errorMessage: "Error: En passant square is invalid (must be a file a-h on rank 3 or 6)."
      };
    }
    if (!/^\d+$/.test(halfmove) || !/^\d+$/.test(fullmove)) {
      return {
        isValid: false,
        errorMessage: "Error: Halfmove clock and fullmove number must be non-negative integers."
      };
    }
    if (parseInt(fullmove, 10) < 1) {
      return { isValid: false, errorMessage: "Error: Fullmove number must be at least 1." };
    }
    return { isValid: true, errorMessage: null };
  }
  function createEmptyBoard() {
    return Array(8).fill(null).map(() => Array(8).fill(""));
  }
  function boardToFEN(board) {
    const rows = [];
    for (let r = 0; r < 8; r++) {
      const row = board[r];
      if (!row) continue;
      let fenRow = "";
      let emptyCount = 0;
      for (let c = 0; c < 8; c++) {
        const piece = row[c];
        if (piece === "") {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fenRow += emptyCount.toString();
            emptyCount = 0;
          }
          fenRow += piece;
        }
      }
      if (emptyCount > 0) fenRow += emptyCount.toString();
      rows.push(fenRow);
    }
    return rows.join("/");
  }
  function isBoardEmpty(board) {
    return board.every((row) => row.every((piece) => piece === ""));
  }
  var PIECE_NAMES = {
    K: "white king",
    Q: "white queen",
    R: "white rook",
    B: "white bishop",
    N: "white knight",
    P: "white pawn",
    k: "black king",
    q: "black queen",
    r: "black rook",
    b: "black bishop",
    n: "black knight",
    p: "black pawn"
  };
  function pieceToName(piece) {
    var _a;
    return (_a = PIECE_NAMES[piece]) != null ? _a : piece;
  }
  function describeBoardPosition(board, flipped = false) {
    var _a, _b;
    const white = [];
    const black = [];
    const files = "abcdefgh";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = (_a = board[r]) == null ? void 0 : _a[c];
        if (!piece) continue;
        const displayRow = flipped ? r : 7 - r;
        const displayCol = flipped ? 7 - c : c;
        const square = `${(_b = files[displayCol]) != null ? _b : c}${displayRow + 1}`;
        const name = pieceToName(piece);
        if (piece === piece.toUpperCase()) white.push(`${name} ${square}`);
        else black.push(`${name} ${square}`);
      }
    }
    if (white.length === 0 && black.length === 0) return "Empty board";
    const parts = [];
    if (white.length > 0) parts.push(`White: ${white.join(", ")}`);
    if (black.length > 0) parts.push(`Black: ${black.join(", ")}`);
    return parts.join(". ");
  }
  var CASTLING_RE = /^(-|[KQkq]{1,4})$/;
  var EN_PASSANT_RE = /^(-|[a-h][36])$/;
  function parseFENRecord(fen) {
    if (!fen || typeof fen !== "string") throw new FENParseError("Invalid FEN string");
    const parts = fen.trim().split(/\s+/);
    const [
      placement,
      activeColor = "w",
      castling = "-",
      enPassant = "-",
      halfmoveRaw = "0",
      fullmoveRaw = "1"
    ] = parts;
    const board = parseFEN(placement != null ? placement : "");
    if (activeColor !== "w" && activeColor !== "b")
      throw new FENParseError(`Invalid active color '${activeColor}'`);
    if (!CASTLING_RE.test(castling))
      throw new FENParseError(`Invalid castling field '${castling}'`);
    if (castling !== "-" && new Set(castling).size !== castling.length)
      throw new FENParseError("Castling field contains duplicate characters");
    if (!EN_PASSANT_RE.test(enPassant))
      throw new FENParseError(`Invalid en passant square '${enPassant}'`);
    if (!/^\d+$/.test(halfmoveRaw))
      throw new FENParseError(`Invalid halfmove clock '${halfmoveRaw}'`);
    if (!/^\d+$/.test(fullmoveRaw))
      throw new FENParseError(`Invalid fullmove number '${fullmoveRaw}'`);
    const halfmove = parseInt(halfmoveRaw, 10);
    const fullmove = parseInt(fullmoveRaw, 10);
    if (fullmove < 1) throw new FENParseError("Fullmove number must be at least 1");
    return { board, activeColor, castling, enPassant, halfmove, fullmove };
  }
  function buildFENRecord(record) {
    const {
      board,
      activeColor = "w",
      castling = "-",
      enPassant = "-",
      halfmove = 0,
      fullmove = 1
    } = record;
    return `${boardToFEN(board)} ${activeColor} ${castling} ${enPassant} ${halfmove} ${fullmove}`;
  }
  function toggleActiveColor(record) {
    return { ...record, activeColor: record.activeColor === "w" ? "b" : "w" };
  }
  function fenPlacementField(fen) {
    var _a;
    return (_a = (fen != null ? fen : "").trim().split(/\s+/)[0]) != null ? _a : "";
  }
  function normalizeFEN(fen) {
    return buildFENRecord(parseFENRecord(fen));
  }
  function getCoordinateParams(boardSize) {
    const borderSize = Math.round(Math.max(18, Math.min(800, boardSize * 0.05)));
    const fontSize = Math.round(Math.max(10, Math.min(480, borderSize * 0.72)));
    return { fontSize, borderSize, fontWeight: 600, offset: Math.round(borderSize / 2) };
  }
  function getSquareBounds(rowIndex, colIndex, squareSize, offsetX = 0, offsetY = 0) {
    const x0 = Math.round(offsetX + colIndex * squareSize);
    const x1 = Math.round(offsetX + (colIndex + 1) * squareSize);
    const y0 = Math.round(offsetY + rowIndex * squareSize);
    const y1 = Math.round(offsetY + (rowIndex + 1) * squareSize);
    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0, centerX: Math.round((x0 + x1) / 2), centerY: Math.round((y0 + y1) / 2) };
  }
  function isLightSquare(row, col) {
    return (row + col) % 2 === 0;
  }
  function getDisplayCoordinates(row, col, flipped) {
    return [flipped ? 7 - row : row, flipped ? 7 - col : col];
  }
  function squareToIndices(square) {
    var _a;
    if (square.length !== 2) return null;
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt((_a = square[1]) != null ? _a : "", 10);
    if (file < 0 || file > 7 || isNaN(rank) || rank < 1 || rank > 8) return null;
    return [8 - rank, file];
  }
  function indicesToSquare(row, col) {
    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;
    return `${file}${rank}`;
  }
  function resolve(square) {
    if (typeof square === "string") return squareToIndices(square);
    const [row, col] = square;
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return [row, col];
  }
  function cloneBoard(board) {
    return board.map((row) => [...row]);
  }
  function getPieceAt(board, square) {
    var _a, _b;
    const idx = resolve(square);
    if (!idx) return null;
    return (_b = (_a = board[idx[0]]) == null ? void 0 : _a[idx[1]]) != null ? _b : null;
  }
  function setPieceAt(board, square, piece) {
    const idx = resolve(square);
    if (!idx) return board;
    const next = cloneBoard(board);
    const row = next[idx[0]];
    if (row) row[idx[1]] = piece;
    return next;
  }
  function removePieceAt(board, square) {
    return setPieceAt(board, square, "");
  }
  function movePiece(board, from, to) {
    const piece = getPieceAt(board, from);
    if (!piece) return board;
    const cleared = removePieceAt(board, from);
    return setPieceAt(cleared, to, piece);
  }
  function flipBoard(board) {
    return board.map((row) => [...row].reverse()).reverse();
  }
  function listPieces(board) {
    var _a;
    const out = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = (_a = board[row]) == null ? void 0 : _a[col];
        if (piece) out.push({ square: indicesToSquare(row, col), piece });
      }
    }
    return out;
  }
  function countPieces(board) {
    var _a;
    const counts = {};
    for (const row of board) {
      for (const piece of row) {
        if (piece) counts[piece] = ((_a = counts[piece]) != null ? _a : 0) + 1;
      }
    }
    return counts;
  }
  var MATERIAL_VALUES = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0
  };
  function materialBalance(board) {
    var _a;
    let balance = 0;
    for (const row of board) {
      for (const piece of row) {
        if (!piece) continue;
        const value = (_a = MATERIAL_VALUES[piece.toLowerCase()]) != null ? _a : 0;
        balance += piece === piece.toUpperCase() ? value : -value;
      }
    }
    return balance;
  }
  function findKing(board, color) {
    var _a;
    const target = color === "w" ? "K" : "k";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (((_a = board[row]) == null ? void 0 : _a[col]) === target) return indicesToSquare(row, col);
      }
    }
    return null;
  }
  function hasBothKings(board) {
    const counts = countPieces(board);
    return counts["K"] === 1 && counts["k"] === 1;
  }
  var PIECES = {
    wK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="miter" d="M22.5 11.63V6M20 8h5"/><path fill="#fff" stroke-linecap="butt" stroke-linejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path fill="#fff" d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>`,
    wQ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0m16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0M16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0"/><path stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z"/><path stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"/></g></svg>`,
    wR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="butt" d="M9 39h27v-3H9zm3-3v-4h21v4zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/><path d="m34 14-3 3H14l-3-3"/><path stroke-linecap="butt" stroke-linejoin="miter" d="M31 17v12.5H14V17"/><path d="m31 29.5 1.5 2.5h-20l1.5-2.5"/><path fill="none" stroke-linejoin="miter" d="M11 14h23"/></g></svg>`,
    wB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>`,
    wN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#fff" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#fff" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><path fill="#000" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5"/></g></svg>`,
    wP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path fill="#fff" stroke="#000" stroke-linecap="round" stroke-width="1.5" d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></svg>`,
    bK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="miter" d="M22.5 11.6V6"/><path fill="#000" stroke-linecap="butt" stroke-linejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path fill="#000" d="M11.5 37a22.3 22.3 0 0 0 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z"/><path stroke-linejoin="miter" d="M20 8h5"/><path stroke="#ececec" d="M32 29.5s8.5-4 6-9.7C34.1 14 25 18 22.5 24.6v2.1-2.1C20 18 9.9 14 7 19.9c-2.5 5.6 4.8 9 4.8 9"/><path stroke="#ececec" d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>`,
    bQ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g stroke="none"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5z"/><path stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" stroke-linecap="butt" d="M11 38.5a35 35 1 0 0 23 0"/><path fill="none" stroke="#ececec" d="M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0"/></g></svg>`,
    bR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="butt" d="M9 39h27v-3H9zm3.5-7 1.5-2.5h17l1.5 2.5zm-.5 4v-4h21v4z"/><path stroke-linecap="butt" stroke-linejoin="miter" d="M14 29.5v-13h17v13z"/><path stroke-linecap="butt" d="M14 16.5 11 14h23l-3 2.5zM11 14V9h4v2h5V9h5v2h5V9h4v5z"/><path fill="none" stroke="#ececec" stroke-linejoin="miter" stroke-width="1" d="M12 35.5h21m-20-4h19m-18-2h17m-17-13h17M11 14h23"/></g></svg>`,
    bB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#000" stroke-linecap="butt"><path d="M9 36c3.4-1 10.1.4 13.5-2 3.4 2.4 10.1 1 13.5 2 0 0 1.6.5 3 2-.7 1-1.6 1-3 .5-3.4-1-10.1.5-13.5-1-3.4 1.5-10.1 0-13.5 1-1.4.5-2.3.5-3-.5 1.4-2 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke="#ececec" stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>`,
    bN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#000" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#000" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3"/><path fill="#ececec" stroke="#ececec" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.43-9.75a.5 1.5 30 1 1-.86-.5.5 1.5 30 1 1 .86.5"/><path fill="#ececec" stroke="none" d="m24.55 10.4-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34s-5.79-6.64-9.19-7.16z"/></g></svg>`,
    bP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path stroke="#000" stroke-linecap="round" stroke-width="1.5" d="M22.5 9a4 4 0 0 0-3.22 6.38 6.48 6.48 0 0 0-.87 10.65c-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47a6.46 6.46 0 0 0-.87-10.65A4.01 4.01 0 0 0 22.5 9z"/></svg>`
  };
  function getPieceSVG(fenChar) {
    var _a;
    const isWhite = fenChar === fenChar.toUpperCase();
    const type = fenChar.toUpperCase();
    const key = (isWhite ? "w" : "b") + type;
    return (_a = PIECES[key]) != null ? _a : null;
  }
  var PROTOTYPE_POISON_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
  function safeJSONParse(jsonString, fallback) {
    if (!jsonString || typeof jsonString !== "string") return fallback;
    try {
      const parsed = JSON.parse(jsonString, (key, value) => {
        if (key !== "" && PROTOTYPE_POISON_KEYS.has(key)) return void 0;
        return value;
      });
      return parsed !== null && parsed !== void 0 ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function sanitizeFileName(fileName) {
    if (!fileName || typeof fileName !== "string") return "chess-position";
    let s = fileName.replace(/[\\/:*?"<>|&]/g, "-");
    s = s.replace(/\s+/g, "_");
    s = s.replace(/^\.+/, "").replace(/\.+$/, "").trim();
    if (s.length > 100) s = s.substring(0, 100);
    return s || "chess-position";
  }
  function isValidHexColor(color) {
    if (!color || typeof color !== "string") return false;
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }
  function sanitizeHexColor(color, fallback = "#ffffff") {
    return isValidHexColor(color) ? color : fallback;
  }
  function sanitizeInput(input, maxLength = 500) {
    if (!input || typeof input !== "string") return "";
    let s = input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
    s = s.trim();
    return s.length > maxLength ? s.substring(0, maxLength) : s;
  }
  function isRecord(val) {
    return typeof val === "object" && val !== null && !Array.isArray(val);
  }
  var DEFAULT_HIGHLIGHT_COLOR = "#ffeb3b";
  var DEFAULT_ARROW_COLOR = "#15781b";
  var CHECK_COLOR = "#e8412c";
  function isValidSquareName(square) {
    return squareToIndices(square) !== null;
  }
  function isValidHighlight(highlight) {
    if (!isValidSquareName(highlight.square)) return false;
    if (highlight.color !== void 0 && !isValidHexColor(highlight.color)) return false;
    if (highlight.style !== void 0 && highlight.style !== "fill" && highlight.style !== "ring") return false;
    return true;
  }
  function isValidArrow(arrow) {
    if (!isValidSquareName(arrow.from) || !isValidSquareName(arrow.to)) return false;
    if (arrow.from === arrow.to) return false;
    if (arrow.color !== void 0 && !isValidHexColor(arrow.color)) return false;
    return true;
  }
  function sanitizeAnnotations(annotations) {
    var _a, _b;
    const highlights = ((_a = annotations.highlights) != null ? _a : []).filter(isValidHighlight);
    const arrows = ((_b = annotations.arrows) != null ? _b : []).filter(isValidArrow);
    const check = annotations.check && isValidSquareName(annotations.check.square) ? annotations.check : void 0;
    const result = {};
    if (highlights.length > 0) result.highlights = highlights;
    if (arrows.length > 0) result.arrows = arrows;
    if (check) result.check = check;
    return result;
  }
  function escapeXml(value) {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function renderHighlightsSVG(highlights, squareToPixel, squareSize) {
    var _a, _b;
    const parts = [];
    for (const highlight of highlights) {
      if (!isValidHighlight(highlight)) continue;
      const origin = squareToPixel(highlight.square);
      if (!origin) continue;
      const color = (_a = highlight.color) != null ? _a : DEFAULT_HIGHLIGHT_COLOR;
      const style = (_b = highlight.style) != null ? _b : "fill";
      if (style === "ring") {
        const strokeW = Math.max(2, Math.round(squareSize * 0.06));
        const inset = strokeW / 2;
        parts.push(
          `<rect x="${origin.x + inset}" y="${origin.y + inset}" width="${squareSize - strokeW}" height="${squareSize - strokeW}" fill="none" stroke="${escapeXml(color)}" stroke-width="${strokeW}"/>`
        );
      } else {
        parts.push(
          `<rect x="${origin.x}" y="${origin.y}" width="${squareSize}" height="${squareSize}" fill="${escapeXml(color)}" fill-opacity="0.55"/>`
        );
      }
    }
    return parts.join("\n");
  }
  function renderArrowsSVG(arrows, squareToPixel, squareSize) {
    var _a;
    const parts = [];
    let markerIndex = 0;
    for (const arrow of arrows) {
      if (!isValidArrow(arrow)) continue;
      const from = squareToPixel(arrow.from);
      const to = squareToPixel(arrow.to);
      if (!from || !to) continue;
      const color = (_a = arrow.color) != null ? _a : DEFAULT_ARROW_COLOR;
      const markerId = `chess-arrowhead-${markerIndex++}`;
      const half = squareSize / 2;
      const x1 = from.x + half;
      const y1 = from.y + half;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.hypot(dx, dy) || 1;
      const shorten = half * 0.9;
      const x2 = to.x + half - dx / length * shorten;
      const y2 = to.y + half - dy / length * shorten;
      const strokeW = Math.max(2, Math.round(squareSize * 0.12));
      parts.push(
        `<marker id="${markerId}" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto-start-reverse"><path d="M0,0 L4,2 L0,4 Z" fill="${escapeXml(color)}"/></marker>`
      );
      parts.push(
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${escapeXml(color)}" stroke-width="${strokeW}" stroke-opacity="0.8" marker-end="url(#${markerId})"/>`
      );
    }
    return parts.join("\n");
  }
  function renderCheckIndicatorSVG(check, squareToPixel, squareSize) {
    if (!isValidSquareName(check.square)) return "";
    const origin = squareToPixel(check.square);
    if (!origin) return "";
    const cx = origin.x + squareSize / 2;
    const cy = origin.y + squareSize / 2;
    const r = squareSize * 0.65;
    const gradientId = `chess-check-glow-${check.square}`;
    const opacity = check.type === "checkmate" ? 0.85 : 0.6;
    return [
      `<radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">`,
      `<stop offset="0%" stop-color="${CHECK_COLOR}" stop-opacity="${opacity}"/>`,
      `<stop offset="100%" stop-color="${CHECK_COLOR}" stop-opacity="0"/>`,
      `</radialGradient>`,
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${gradientId})"/>`
    ].join("\n");
  }
  function safeColor(color, fallback) {
    if (color && isValidHexColor(color)) return color;
    return fallback;
  }
  function resolveCoordColor(color, fallback) {
    if (color === "white") return "#ffffff";
    if (color === "black") return "#000000";
    return safeColor(color, fallback);
  }
  function generateDiagram(options) {
    var _a;
    const {
      fen,
      size = 400,
      showCoords = false,
      flipped = false,
      showFrame = false,
      label = "Chess position",
      coordStyle = "border"
    } = options;
    const lightSquare = safeColor(options.lightSquare, "#f0d9b5");
    const darkSquare = safeColor(options.darkSquare, "#b58863");
    const coordColor = resolveCoordColor(options.coordColor, "#000000");
    const showInnerCoords = showCoords && coordStyle === "inner";
    const showBorderCoords = showCoords && coordStyle !== "inner";
    const board = parseFEN(fen);
    const COORD_RATIO = 0.05;
    const coordBorder = showBorderCoords ? Math.round(Math.max(18, size * COORD_RATIO)) : 0;
    const frameThickness = showFrame ? Math.max(2, Math.round(size * 3e-3)) : 0;
    const framePadding = showFrame ? frameThickness * 2 : 0;
    const totalWidth = coordBorder + size + framePadding;
    const totalHeight = size + coordBorder + framePadding;
    const boardX = coordBorder + (showFrame ? frameThickness : 0);
    const boardY = showFrame ? frameThickness : 0;
    const squareSize = size / 8;
    const parts = [];
    parts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" role="img" aria-label="${escapeXml(label)}">`
    );
    parts.push(`<title>${escapeXml(label)}</title>`);
    if (showFrame) {
      const f = frameThickness;
      parts.push(
        `<rect x="0" y="0" width="${totalWidth}" height="${f}" fill="#333333"/>`,
        `<rect x="0" y="${totalHeight - f}" width="${totalWidth}" height="${f}" fill="#333333"/>`,
        `<rect x="0" y="0" width="${f}" height="${totalHeight}" fill="#333333"/>`,
        `<rect x="${totalWidth - f}" y="0" width="${f}" height="${totalHeight}" fill="#333333"/>`
      );
    }
    const strokeW = Math.max(1, Math.round(size * 2e-3));
    const half = strokeW / 2;
    parts.push(
      `<rect x="${boardX - half}" y="${boardY - half}" width="${size + strokeW}" height="${size + strokeW}" fill="none" stroke="#000000" stroke-width="${strokeW}"/>`
    );
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const visRow = flipped ? 7 - row : row;
        const visCol = flipped ? 7 - col : col;
        const color = (row + col) % 2 === 0 ? lightSquare : darkSquare;
        const x = boardX + visCol * squareSize;
        const y = boardY + visRow * squareSize;
        parts.push(
          `<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${escapeXml(color)}"/>`
        );
      }
    }
    const annotations = options.annotations ? sanitizeAnnotations(options.annotations) : null;
    const squareToPixel = (square) => {
      var _a2;
      const file = square.charCodeAt(0) - 97;
      const rank = parseInt((_a2 = square[1]) != null ? _a2 : "", 10);
      if (file < 0 || file > 7 || isNaN(rank) || rank < 1 || rank > 8) return null;
      const row = 8 - rank;
      const col = file;
      const visRow = flipped ? 7 - row : row;
      const visCol = flipped ? 7 - col : col;
      return { x: boardX + visCol * squareSize, y: boardY + visRow * squareSize };
    };
    if (annotations == null ? void 0 : annotations.highlights) {
      parts.push(renderHighlightsSVG(annotations.highlights, squareToPixel, squareSize));
    }
    if (annotations == null ? void 0 : annotations.check) {
      parts.push(renderCheckIndicatorSVG(annotations.check, squareToPixel, squareSize));
    }
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const fenPiece = (_a = board[row]) == null ? void 0 : _a[col];
        if (!fenPiece) continue;
        const pieceSvg = getPieceSVG(fenPiece);
        if (!pieceSvg) continue;
        const visRow = flipped ? 7 - row : row;
        const visCol = flipped ? 7 - col : col;
        const x = boardX + visCol * squareSize;
        const y = boardY + visRow * squareSize;
        const innerContent = pieceSvg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
        parts.push(
          `<g transform="translate(${x},${y}) scale(${squareSize / 45})">${innerContent}</g>`
        );
      }
    }
    if (annotations == null ? void 0 : annotations.arrows) {
      parts.push(renderArrowsSVG(annotations.arrows, squareToPixel, squareSize));
    }
    if (showBorderCoords) {
      const files = flipped ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"];
      const ranks = flipped ? ["1", "2", "3", "4", "5", "6", "7", "8"] : ["8", "7", "6", "5", "4", "3", "2", "1"];
      const fontSize = Math.round(Math.max(10, coordBorder * 0.72));
      const fontFamily = "'Inter', system-ui, sans-serif";
      const textAttrs = `font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="600" fill="${escapeXml(coordColor)}" text-anchor="middle"`;
      for (let col = 0; col < 8; col++) {
        const x = boardX + col * squareSize + squareSize / 2;
        const y = boardY + size + coordBorder * 0.7;
        parts.push(`<text x="${x}" y="${y}" ${textAttrs}>${files[col]}</text>`);
      }
      for (let row = 0; row < 8; row++) {
        const frameOffset = showFrame ? frameThickness : 0;
        const x = frameOffset + coordBorder * 0.5;
        const y = boardY + row * squareSize + squareSize / 2 + fontSize * 0.35;
        parts.push(`<text x="${x}" y="${y}" ${textAttrs}>${ranks[row]}</text>`);
      }
    }
    if (showInnerCoords) {
      const files = flipped ? ["h", "g", "f", "e", "d", "c", "b", "a"] : ["a", "b", "c", "d", "e", "f", "g", "h"];
      const ranks = flipped ? ["1", "2", "3", "4", "5", "6", "7", "8"] : ["8", "7", "6", "5", "4", "3", "2", "1"];
      const fontSize = Math.round(Math.max(8, squareSize * 0.18));
      const fontFamily = "'Inter', system-ui, sans-serif";
      const pad = fontSize * 0.5;
      for (let col = 0; col < 8; col++) {
        const color = (7 + col) % 2 === 0 ? lightSquare : darkSquare;
        const x = boardX + col * squareSize + pad;
        const y = boardY + size - pad;
        parts.push(
          `<text x="${x}" y="${y}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="700" fill="${escapeXml(color)}" text-anchor="start">${files[col]}</text>`
        );
      }
      for (let row = 0; row < 8; row++) {
        const color = row % 2 === 0 ? lightSquare : darkSquare;
        const x = boardX + squareSize - pad;
        const y = boardY + row * squareSize + pad + fontSize * 0.7;
        parts.push(
          `<text x="${x}" y="${y}" font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="700" fill="${escapeXml(color)}" text-anchor="end">${ranks[row]}</text>`
        );
      }
    }
    parts.push("</svg>");
    return parts.join("\n");
  }
  function pointToSquare(point, options) {
    const { size, flipped = false, offsetX = 0, offsetY = 0 } = options;
    const localX = point.x - offsetX;
    const localY = point.y - offsetY;
    if (localX < 0 || localY < 0 || localX >= size || localY >= size) return null;
    const squareSize = size / 8;
    const visCol = Math.floor(localX / squareSize);
    const visRow = Math.floor(localY / squareSize);
    const row = flipped ? 7 - visRow : visRow;
    const col = flipped ? 7 - visCol : visCol;
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return indicesToSquare(row, col);
  }
  function squareToPoint(square, options) {
    var _a;
    const { size, flipped = false, offsetX = 0, offsetY = 0 } = options;
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt((_a = square[1]) != null ? _a : "", 10);
    if (file < 0 || file > 7 || isNaN(rank) || rank < 1 || rank > 8) return null;
    const row = 8 - rank;
    const col = file;
    const visRow = flipped ? 7 - row : row;
    const visCol = flipped ? 7 - col : col;
    const squareSize = size / 8;
    return {
      x: offsetX + visCol * squareSize,
      y: offsetY + visRow * squareSize,
      size: squareSize
    };
  }
  function applyDragMove(board, from, to) {
    const piece = getPieceAt(board, from);
    if (!piece || from === to) {
      return { board, moved: false, captured: null };
    }
    const captured = getPieceAt(board, to) || null;
    return { board: movePiece(board, from, to), moved: true, captured };
  }
  function applyDragRemove(board, from) {
    return removePieceAt(board, from);
  }
  function applyPaletteDrop(board, to, piece) {
    return setPieceAt(board, to, piece);
  }
  function resolveClick(clickedSquare, selected, board) {
    if (selected === null) {
      const piece = getPieceAt(board, clickedSquare);
      return piece ? { kind: "select", square: clickedSquare } : { kind: "deselect" };
    }
    if (clickedSquare === selected) {
      return { kind: "deselect" };
    }
    const clickedPiece = getPieceAt(board, clickedSquare);
    if (clickedPiece) {
      return { kind: "select", square: clickedSquare };
    }
    return { kind: "move", from: selected, to: clickedSquare };
  }
  var DEFAULT_LIGHT_SQUARE = "#f0d9b5";
  var DEFAULT_DARK_SQUARE = "#b58863";
  var STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  var EMPTY_FEN = "8/8/8/8/8/8/8/8 w - - 0 1";
  var PIECE_SETS = [
    { id: "alpha", name: "Alpha" },
    { id: "cardinal", name: "Cardinal" },
    { id: "california", name: "California" },
    { id: "cburnett", name: "Classic (CBurnett)" },
    { id: "companion", name: "Companion" },
    { id: "dubrovny", name: "Dubrovny" },
    { id: "fantasy", name: "Fantasy" },
    { id: "fresca", name: "Fresca" },
    { id: "gioco", name: "Gioco" },
    { id: "governor", name: "Governor" },
    { id: "horsey", name: "Horsey" },
    { id: "icpieces", name: "IC Pieces" },
    { id: "kosal", name: "Kosal" },
    { id: "leipzig", name: "Leipzig" },
    { id: "merida", name: "Merida" },
    { id: "maestro", name: "Maestro" },
    { id: "pirouetti", name: "Pirouetti" },
    { id: "pixel", name: "Pixel" },
    { id: "reillycraig", name: "Reilly Craig" },
    { id: "riohacha", name: "Riohacha" },
    { id: "spatial", name: "Spatial" },
    { id: "staunty", name: "Staunty" },
    { id: "tatiana", name: "Tatiana" }
  ];
  var PIECE_SET_POPULARITY = [
    "cburnett",
    "merida",
    "alpha",
    "staunty",
    "maestro",
    "horsey",
    "fantasy",
    "leipzig",
    "pixel",
    "gioco",
    "governor",
    "tatiana",
    "dubrovny",
    "fresca",
    "cardinal",
    "icpieces",
    "companion",
    "california",
    "pirouetti",
    "kosal",
    "reillycraig",
    "spatial",
    "riohacha"
  ];
  var BOARD_THEMES = {
    classic: { name: "Classic", light: "#f0d9b5", dark: "#b58863" },
    brown: { name: "Brown", light: "#f0d9b5", dark: "#946f51" },
    wood: { name: "Wood", light: "#d4af7a", dark: "#8b4513" },
    sand: { name: "Sand", light: "#f5deb3", dark: "#d2b48c" },
    slate: { name: "Slate", light: "#d0d0d0", dark: "#4a4a4a" },
    marble: { name: "Marble", light: "#e3e6e8", dark: "#6e7a8a" },
    blue: { name: "Blue", light: "#dee3e6", dark: "#8ca2ad" },
    ocean: { name: "Ocean", light: "#c9e4f5", dark: "#4a90a4" },
    green: { name: "Green", light: "#ffffdd", dark: "#86a666" },
    forest: { name: "Forest", light: "#d4e8d4", dark: "#2d6930" },
    mint: { name: "Mint", light: "#e0f5e9", dark: "#6fb98f" },
    purple: { name: "Purple", light: "#e8d5c7", dark: "#9f7ab9" },
    lavender: { name: "Lavender", light: "#e6e6fa", dark: "#9370db" },
    red: { name: "Red", light: "#ffe0c5", dark: "#c97866" },
    coral: { name: "Coral", light: "#ffebcd", dark: "#ff7f50" },
    sunset: { name: "Sunset", light: "#ffe4b5", dark: "#ff8c42" },
    pink: { name: "Pink", light: "#ffd7e0", dark: "#d87093" },
    burgundy: { name: "Burgundy", light: "#e8d0d0", dark: "#8b3a3a" },
    navy: { name: "Navy", light: "#d9e3f0", dark: "#405d7f" },
    ice: { name: "Ice", light: "#e8f4f8", dark: "#7eb8da" }
  };
  var QUALITY_PRESETS = [
    { value: 1, label: "Print 1\xD7 (300 DPI)", description: "Standard print resolution \u2014 300 DPI at physical size", mode: "print", forceCoordinateBorder: false, estimatedSize: "10-110 KB" },
    { value: 2, label: "Print 2\xD7 (600 DPI)", description: "High print resolution \u2014 600 DPI at physical size", mode: "print", forceCoordinateBorder: false, estimatedSize: "50-440 KB" },
    { value: 3, label: "Social 3\xD7 (900 DPI)", description: "Keeps board size, higher zoom quality \u2014 900 DPI", mode: "social", forceCoordinateBorder: true, estimatedSize: "170KB-1.5MB" },
    { value: 4, label: "Max 4\xD7 (1200 DPI)", description: "Keeps board size, maximum zoom quality \u2014 1200 DPI", mode: "social", forceCoordinateBorder: true, estimatedSize: "300KB-2.7MB" }
  ];
  var PIECE_MAP = {
    wK: "wK",
    wQ: "wQ",
    wR: "wR",
    wB: "wB",
    wN: "wN",
    wP: "wP",
    bK: "bK",
    bQ: "bQ",
    bR: "bR",
    bB: "bB",
    bN: "bN",
    bP: "bP"
  };
  var DEFAULT_CLASS_NAMES = {
    wrap: "board-wrap",
    grid: "board-grid",
    square: "board-square",
    piece: "board-piece",
    selected: "board-square-selected",
    coordsRanks: "coords-ranks",
    coordRank: "coord-rank",
    coordsFiles: "coords-files",
    coordFile: "coord-file"
  };
  var FILES = "abcdefgh";
  function pieceKeyFor(cell) {
    if (!cell) return "";
    const white = cell === cell.toUpperCase();
    return (white ? "w" : "b") + cell.toUpperCase();
  }
  function pieceAltForKey(key) {
    var _a;
    if (!key || key.length !== 2) return "Piece";
    const char = key[0] === "w" ? key[1] : ((_a = key[1]) != null ? _a : "").toLowerCase();
    return pieceToName(char).replace(/\b\w/g, (ch) => ch.toUpperCase());
  }
  function resolveSquare(square) {
    if (typeof square === "string") return squareToIndices(square);
    const [row, col] = square;
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return [row, col];
  }
  function createBoard(container, config = {}) {
    var _a, _b, _c, _d, _e, _f;
    const cn = { ...DEFAULT_CLASS_NAMES, ...config.className };
    let orientation = (_a = config.orientation) != null ? _a : "white";
    let coordinates = (_b = config.coordinates) != null ? _b : true;
    let pieceStyle = (_c = config.pieceStyle) != null ? _c : "cburnett";
    let pieceTheme = (_d = config.pieceTheme) != null ? _d : "/piece/{style}/{piece}.svg";
    let lightSquare = (_e = config.lightSquare) != null ? _e : DEFAULT_LIGHT_SQUARE;
    let darkSquare = (_f = config.darkSquare) != null ? _f : DEFAULT_DARK_SQUARE;
    let board = safeParse(config.fen);
    let selected = null;
    const grid = document.createElement("div");
    grid.className = cn.grid;
    grid.setAttribute("role", "grid");
    grid.tabIndex = 0;
    grid.setAttribute("aria-label", "Chess board editor");
    const coordsRanks = document.createElement("div");
    coordsRanks.className = cn.coordsRanks;
    coordsRanks.setAttribute("data-coords-ranks", "");
    const coordsFiles = document.createElement("div");
    coordsFiles.className = cn.coordsFiles;
    coordsFiles.setAttribute("data-coords-files", "");
    const squares = [];
    const rankEls = [];
    const fileEls = [];
    function safeParse(fen) {
      if (!fen || !validateFEN(fen.trim())) return parseFEN(STARTING_FEN);
      try {
        return parseFEN(fen.trim());
      } catch (e) {
        return parseFEN(STARTING_FEN);
      }
    }
    function pieceUrl(key) {
      return pieceTheme.replace(/\{piece\}/g, key).replace(/\{style\}/g, pieceStyle);
    }
    function visualToLogical(index) {
      const dr = Math.floor(index / 8);
      const dc = index % 8;
      return orientation === "black" ? [7 - dr, 7 - dc] : [dr, dc];
    }
    function buildSquares() {
      for (let i = 0; i < 64; i++) {
        const dr = Math.floor(i / 8);
        const dc = i % 8;
        const [row, col] = visualToLogical(i);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = cn.square;
        btn.setAttribute("role", "gridcell");
        btn.setAttribute("data-r", String(dr));
        btn.setAttribute("data-c", String(dc));
        btn.setAttribute("aria-label", indicesToSquare(row, col));
        btn.setAttribute("aria-selected", "false");
        btn.style.backgroundColor = isLightSquare(row, col) ? lightSquare : darkSquare;
        grid.appendChild(btn);
        squares.push(btn);
      }
    }
    function buildCoords() {
      for (let i = 0; i < 8; i++) {
        const rank = document.createElement("div");
        rank.className = cn.coordRank;
        coordsRanks.appendChild(rank);
        rankEls.push(rank);
        const file = document.createElement("div");
        file.className = cn.coordFile;
        coordsFiles.appendChild(file);
        fileEls.push(file);
      }
    }
    function syncPieces() {
      var _a2, _b2;
      for (let i = 0; i < 64; i++) {
        const [row, col] = visualToLogical(i);
        const btn = squares[i];
        const cell = (_b2 = (_a2 = board[row]) == null ? void 0 : _a2[col]) != null ? _b2 : "";
        const key = pieceKeyFor(cell);
        const bg = isLightSquare(row, col) ? lightSquare : darkSquare;
        const label = indicesToSquare(row, col);
        const isSel = selected !== null && selected[0] === row && selected[1] === col;
        btn.style.backgroundColor = bg;
        btn.setAttribute("aria-label", label);
        btn.classList.toggle(cn.selected, isSel);
        btn.setAttribute("aria-selected", String(isSel));
        const img = btn.firstElementChild;
        if (key) {
          const src = pieceUrl(key);
          if (img instanceof HTMLImageElement) {
            if (img.getAttribute("src") !== src) img.setAttribute("src", src);
            const alt = pieceAltForKey(key);
            if (img.getAttribute("alt") !== alt) img.setAttribute("alt", alt);
          } else {
            const fresh = document.createElement("img");
            fresh.className = cn.piece;
            fresh.setAttribute("src", src);
            fresh.setAttribute("alt", pieceAltForKey(key));
            fresh.draggable = false;
            btn.appendChild(fresh);
          }
        } else if (img) {
          btn.removeChild(img);
        }
      }
    }
    function syncCoords() {
      var _a2;
      for (let i = 0; i < 8; i++) {
        rankEls[i].textContent = String(orientation === "black" ? i + 1 : 8 - i);
        fileEls[i].textContent = (_a2 = FILES[orientation === "black" ? 7 - i : i]) != null ? _a2 : "";
      }
      coordsRanks.hidden = !coordinates;
      coordsFiles.hidden = !coordinates;
    }
    function render() {
      syncPieces();
      syncCoords();
    }
    buildSquares();
    buildCoords();
    container.appendChild(grid);
    container.appendChild(coordsRanks);
    container.appendChild(coordsFiles);
    render();
    return {
      set(config2) {
        if (config2.fen !== void 0 && config2.fen.trim() !== boardToFEN(board)) {
          board = safeParse(config2.fen);
        }
        if (config2.orientation !== void 0) orientation = config2.orientation;
        if (config2.coordinates !== void 0) coordinates = config2.coordinates;
        if (config2.pieceStyle !== void 0) pieceStyle = config2.pieceStyle;
        if (config2.pieceTheme !== void 0) pieceTheme = config2.pieceTheme;
        if (config2.lightSquare !== void 0) lightSquare = config2.lightSquare;
        if (config2.darkSquare !== void 0) darkSquare = config2.darkSquare;
        if (config2.className) Object.assign(cn, config2.className);
        render();
      },
      getFen() {
        return boardToFEN(board);
      },
      getOrientation() {
        return orientation;
      },
      toggleOrientation() {
        orientation = orientation === "white" ? "black" : "white";
        selected = null;
        render();
      },
      selectSquare(square) {
        var _a2;
        selected = square === null ? null : (_a2 = resolveSquare(square)) != null ? _a2 : selected;
        render();
      },
      getSquare(square) {
        var _a2;
        const idx = resolveSquare(square);
        if (!idx) return null;
        const [row, col] = idx;
        const index = orientation === "black" ? (7 - row) * 8 + (7 - col) : row * 8 + col;
        return (_a2 = squares[index]) != null ? _a2 : null;
      },
      getGrid() {
        return grid;
      },
      destroy() {
        grid.remove();
        coordsRanks.remove();
        coordsFiles.remove();
        squares.length = 0;
        board = [];
        selected = null;
      }
    };
  }
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0 };
    const r = result[1], g = result[2], b = result[3];
    if (r === void 0 || g === void 0 || b === void 0) return { r: 0, g: 0, b: 0 };
    return { r: parseInt(r, 16), g: parseInt(g, 16), b: parseInt(b, 16) };
  }
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }
  function rgbToHsv(r, g, b) {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    if (max !== min) {
      switch (max) {
        case rn:
          h = (gn - bn) / d + (gn < bn ? 6 : 0);
          break;
        case gn:
          h = (bn - rn) / d + 2;
          break;
        case bn:
          h = (rn - gn) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h, s, v };
  }
  function hsvToRgb(h, s, v) {
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }
  function hexToHsv(hex) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHsv(r, g, b);
  }
  function hsvToHex(h, s, v) {
    const { r, g, b } = hsvToRgb(h, s, v);
    return rgbToHex(r, g, b);
  }
  function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const toLinear = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }
  function contrastRatio(hex1, hex2) {
    const l1 = relativeLuminance(hex1);
    const l2 = relativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  function bestTextColor(backgroundHex) {
    const contrastWithWhite = contrastRatio(backgroundHex, "#ffffff");
    const contrastWithBlack = contrastRatio(backgroundHex, "#000000");
    return contrastWithWhite >= contrastWithBlack ? "white" : "black";
  }
  var DAY_MS = 24 * 60 * 60 * 1e3;
  var SEVEN_DAYS_MS = 7 * DAY_MS;
  var THIRTY_DAYS_MS = 30 * DAY_MS;
  var NINETY_DAYS_MS = 90 * DAY_MS;
  function calculateStatus(lastActiveAt) {
    const age = Date.now() - lastActiveAt;
    if (age < SEVEN_DAYS_MS) return "green";
    if (age < THIRTY_DAYS_MS) return "yellow";
    return "red";
  }
  function createHistoryEntry(fen, source, dragSessionId = null) {
    const now = Date.now();
    return {
      id: now,
      fen,
      createdAt: now,
      lastActiveAt: now,
      source,
      isFavorite: false,
      ...dragSessionId ? { dragSessionId } : {}
    };
  }
  function touchEntry(entry) {
    return { ...entry, lastActiveAt: Date.now() };
  }
  function sortByMostRecent(entries) {
    return [...entries].sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  }
  function sortArchivedByArchiveDate(entries) {
    return [...entries].sort((a, b) => b.archivedAt - a.archivedAt);
  }
  function mergeById(primary, secondary) {
    const byId = /* @__PURE__ */ new Map();
    for (const entry of secondary) byId.set(entry.id, entry);
    for (const entry of primary) byId.set(entry.id, entry);
    return [...byId.values()];
  }
  function applyFilters(entries, filters) {
    if (!filters || Object.keys(filters).length === 0) return entries;
    return entries.filter((entry) => {
      if (filters.fenSearch && !entry.fen.toLowerCase().includes(filters.fenSearch.toLowerCase())) return false;
      if (filters.dateFrom && entry.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && entry.createdAt > filters.dateTo) return false;
      if (filters.status && calculateStatus(entry.lastActiveAt) !== filters.status) return false;
      if (filters.source && entry.source !== filters.source) return false;
      if (filters.favoritesOnly && !entry.isFavorite) return false;
      return true;
    });
  }
  function partitionByArchiveStatus(entries) {
    const active = [];
    const toArchive = [];
    for (const entry of entries) {
      if (entry.isFavorite || Date.now() - entry.lastActiveAt < NINETY_DAYS_MS) {
        active.push(entry);
      } else {
        toArchive.push(entry);
      }
    }
    return { active, toArchive };
  }
  function convertToArchivedEntry(entry, archiveSource = "auto") {
    return {
      id: entry.id,
      fen: entry.fen,
      createdAt: entry.createdAt,
      lastActiveAt: entry.lastActiveAt,
      archivedAt: Date.now(),
      source: entry.source,
      archiveSource,
      isFavorite: entry.isFavorite
    };
  }
  async function changeDPI(blob, dpi, format) {
    return format === "png" ? changePngDPI(blob, dpi) : changeJpegDPI(blob, dpi);
  }
  var crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  async function changePngDPI(blob, dpi) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const ppm = Math.round(dpi * 39.3701);
    const phys = new Uint8Array(21);
    phys.set([0, 0, 0, 9, 112, 72, 89, 115]);
    const dv = new DataView(phys.buffer);
    dv.setUint32(8, ppm);
    dv.setUint32(12, ppm);
    phys[16] = 1;
    let crc = 4294967295;
    for (let i = 4; i < 17; i++) crc = crcTable[(crc ^ phys[i]) & 255] ^ crc >>> 8;
    dv.setUint32(17, crc ^ 4294967295);
    const chunks = [bytes.slice(0, 8)];
    let pos = 8, inserted = false;
    while (pos < bytes.length) {
      const length = new DataView(bytes.buffer).getUint32(pos);
      const type = String.fromCharCode(...Array.from(bytes.slice(pos + 4, pos + 8)));
      if (!inserted && (type === "IDAT" || type === "PLTE")) {
        chunks.push(phys);
        inserted = true;
      }
      if (type !== "pHYs") chunks.push(bytes.slice(pos, pos + 12 + length));
      pos += 12 + length;
    }
    if (!inserted) chunks.splice(chunks.length - 1, 0, phys);
    return new Blob(chunks, { type: "image/png" });
  }
  async function changeJpegDPI(blob, dpi) {
    dpi = Math.min(Math.max(Math.round(dpi), 1), 65535);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (bytes[0] !== 255 || bytes[1] !== 216) return blob;
    let pos = 2;
    while (pos < bytes.length) {
      if (bytes[pos] !== 255) break;
      const marker = bytes[pos + 1];
      const l1 = bytes[pos + 2], l2 = bytes[pos + 3];
      if (l1 === void 0 || l2 === void 0) break;
      const length = (l1 << 8) + l2;
      if (marker === 224 && length >= 16) {
        const jfif = bytes.slice(pos, pos + 2 + length);
        jfif[13] = 1;
        jfif[14] = dpi >> 8 & 255;
        jfif[15] = dpi & 255;
        jfif[16] = dpi >> 8 & 255;
        jfif[17] = dpi & 255;
        const out2 = new Uint8Array(bytes.length);
        out2.set(bytes.slice(0, pos));
        out2.set(jfif, pos);
        out2.set(bytes.slice(pos + 2 + length), pos + 2 + length);
        return new Blob([out2], { type: "image/jpeg" });
      }
      if (marker === 218) break;
      pos += 2 + length;
    }
    const header = new Uint8Array([
      255,
      224,
      0,
      16,
      74,
      70,
      73,
      70,
      0,
      1,
      1,
      1,
      dpi >> 8 & 255,
      dpi & 255,
      dpi >> 8 & 255,
      dpi & 255,
      0,
      0
    ]);
    const out = new Uint8Array(bytes.length + header.length);
    out.set(bytes.slice(0, 2));
    out.set(header, 2);
    out.set(bytes.slice(2), 2 + header.length);
    return new Blob([out], { type: "image/jpeg" });
  }
  function getBoardTheme(id) {
    var _a;
    return (_a = BOARD_THEMES[id]) != null ? _a : null;
  }
  function listThemeIds() {
    return Object.keys(BOARD_THEMES);
  }
  function getPieceSet(id) {
    var _a;
    return (_a = PIECE_SETS.find((set) => set.id === id)) != null ? _a : null;
  }
  function pieceSetsByPopularity() {
    const rank = new Map(PIECE_SET_POPULARITY.map((id, i) => [id, i]));
    return [...PIECE_SETS].sort((a, b) => {
      var _a, _b;
      const ra = (_a = rank.get(a.id)) != null ? _a : Number.MAX_SAFE_INTEGER;
      const rb = (_b = rank.get(b.id)) != null ? _b : Number.MAX_SAFE_INTEGER;
      return ra - rb;
    });
  }
  function getQualityPreset(value) {
    var _a;
    return (_a = QUALITY_PRESETS.find((preset) => preset.value === value)) != null ? _a : null;
  }
  function themeContrast(theme) {
    return contrastRatio(theme.light, theme.dark);
  }
  function themeCoordinateColor(theme) {
    return bestTextColor(theme.dark);
  }
  function readImageDimensions(data) {
    var _a;
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    return (_a = readPng(bytes)) != null ? _a : readJpeg(bytes);
  }
  function readPng(bytes) {
    if (bytes.length < 24) return null;
    const sig = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < sig.length; i++) if (bytes[i] !== sig[i]) return null;
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: dv.getUint32(16), height: dv.getUint32(20) };
  }
  function readJpeg(bytes) {
    if (bytes[0] !== 255 || bytes[1] !== 216) return null;
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let pos = 2;
    while (pos + 4 < bytes.length) {
      if (bytes[pos] !== 255) {
        pos++;
        continue;
      }
      const marker = bytes[pos + 1];
      if (marker === void 0) break;
      const isSOF = marker >= 192 && marker <= 195 || marker >= 197 && marker <= 199 || marker >= 201 && marker <= 203 || marker >= 205 && marker <= 207;
      if (isSOF) {
        if (pos + 9 > bytes.length) return null;
        return { width: dv.getUint16(pos + 7), height: dv.getUint16(pos + 5) };
      }
      if (marker === 216 || marker === 217 || marker >= 208 && marker <= 215) {
        pos += 2;
        continue;
      }
      const length = dv.getUint16(pos + 2);
      if (length < 2) return null;
      pos += 2 + length;
    }
    return null;
  }
  function physicalSize(pixels, dpi) {
    if (dpi <= 0) return { inches: 0, mm: 0 };
    const inches = pixels / dpi;
    return { inches, mm: inches * 25.4 };
  }
  return __toCommonJS(index_exports);
})();

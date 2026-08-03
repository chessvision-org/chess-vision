(function () {
  'use strict';

  var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  var EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';
  var MAX_LEN = 80;
  var FILES = 'abcdefgh';

  var PIECE_NAMES = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' };

  var state = {
    fen: '',
    squares: [],
    error: '',
    past: [],
    future: [],
    held: null,
    palettePiece: null,
    favorites: {},
    isFavorite: false,
    showCoords: true,
    showCoordinateBorder: true,
    showThinFrame: false,
    flipped: false,
    pieceStyle: 'cburnett',
    lightColor: '#f0d9b5',
    darkColor: '#b58863',
    boardSize: 4,
    fileName: 'chess-position',
    exportQuality: 16,
    shareOpen: false,
    shareUrl: '',
    history: [],
    slowDbNotified: false,
    // keyboard navigation
    cursor: null,
    keyHeld: null,
    // drag state
    dragData: null,
    dragGhost: null,
    dragOver: null,
    suppressClick: false
  };

  var els = {};
  var handlersBound = false;

  function notify(type, message) {
    try {
      window.CV.notify.push({ type: type, message: message });
    } catch (e) {}
  }

  // --- FEN helpers ---

  function placement(fen) {
    return String(fen || '').trim().split(/\s+/)[0] || '';
  }

  function validPlacement(p) {
    if (!p) return false;
    if (!/^[rnbqkpRNBQKP1-8/]+$/.test(p)) return false;
    var ranks = p.split('/');
    if (ranks.length !== 8) return false;
    for (var r = 0; r < ranks.length; r++) {
      var rank = ranks[r];
      if (!rank) return false;
      var sum = 0;
      for (var i = 0; i < rank.length; i++) {
        var ch = rank[i];
        sum += ch >= '1' && ch <= '8' ? Number(ch) : 1;
      }
      if (sum !== 8) return false;
    }
    return true;
  }

  var fenDebounceTimer = null;

  function validateFenDetailed(fen) {
    var PIECES = { p: 1, n: 1, b: 1, r: 1, q: 1, k: 1, P: 1, N: 1, B: 1, R: 1, Q: 1, K: 1 };
    var DIGITS = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 };
    if (!fen || typeof fen !== 'string') {
      return { isValid: false, errorMessage: 'Error: FEN string is empty or has an invalid format.' };
    }
    if (fen.length > MAX_LEN) {
      return { isValid: false, errorMessage: 'Error: FEN string is too long.' };
    }
    var trimmed = fen.trim();
    var parts = trimmed.split(/\s+/);
    if (parts.length !== 6) {
      return {
        isValid: false,
        errorMessage:
          'Error: A valid FEN must have exactly 6 parts. You provided ' + parts.length + '.'
      };
    }
    var position = parts[0];
    var activeColor = parts[1];
    var castling = parts[2];
    var enPassant = parts[3];
    var halfmove = parts[4];
    var fullmove = parts[5];
    if (!position || !activeColor || !castling || !enPassant || !halfmove || !fullmove) {
      return { isValid: false, errorMessage: 'Error: Missing FEN parts.' };
    }
    var rows = position.split('/');
    if (rows.length !== 8) {
      return {
        isValid: false,
        errorMessage: 'Error: The board must have 8 ranks, but yours has ' + rows.length + '.'
      };
    }
    for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      var row = rows[rowIndex];
      if (row === undefined) continue;
      var count = 0;
      for (var ci = 0; ci < row.length; ci++) {
        var ch = row[ci];
        if (DIGITS[ch]) count += parseInt(ch, 10);
        else if (PIECES[ch]) count++;
        else {
          return {
            isValid: false,
            errorMessage: "Error: Invalid character '" + ch + "' in the piece placement field."
          };
        }
      }
      if (count !== 8) {
        return {
          isValid: false,
          errorMessage: 'Error: Rank ' + (rowIndex + 1) + ' has ' + count + ' squares instead of 8.'
        };
      }
    }
    if (activeColor !== 'w' && activeColor !== 'b') {
      return { isValid: false, errorMessage: "Error: Active color must be 'w' (white) or 'b' (black)." };
    }
    if (castling !== '-') {
      if (!/^[KQkq]{1,4}$/.test(castling)) {
        return { isValid: false, errorMessage: 'Error: Castling field is invalid.' };
      }
      var unique = {};
      var dup = false;
      for (var j = 0; j < castling.length; j++) {
        if (unique[castling[j]]) {
          dup = true;
          break;
        }
        unique[castling[j]] = true;
      }
      if (dup) {
        return { isValid: false, errorMessage: 'Error: Castling field contains duplicate characters.' };
      }
    }
    if (enPassant !== '-' && !/^[a-h][36]$/.test(enPassant)) {
      return {
        isValid: false,
        errorMessage: 'Error: En passant square is invalid (must be a file a-h on rank 3 or 6).'
      };
    }
    if (!/^\d+$/.test(halfmove) || !/^\d+$/.test(fullmove)) {
      return {
        isValid: false,
        errorMessage: 'Error: Halfmove clock and fullmove number must be non-negative integers.'
      };
    }
    if (parseInt(fullmove, 10) < 1) {
      return { isValid: false, errorMessage: 'Error: Fullmove number must be at least 1.' };
    }
    return { isValid: true, errorMessage: null };
  }

  function parse(p) {
    var ranks = p.split('/');
    var board = [];
    for (var ri = 0; ri < 8; ri++) {
      var row = [];
      var rank = ranks[ri] || '';
      for (var ci = 0; ci < rank.length; ci++) {
        var ch = rank[ci];
        if (ch >= '1' && ch <= '8') {
          var n = Number(ch);
          for (var k = 0; k < n; k++) row.push('');
        } else {
          row.push(ch);
        }
      }
      while (row.length < 8) row.push('');
      board.push(row.slice(0, 8));
    }
    return board;
  }

  function serialize(board) {
    return board
      .map(function (row) {
        var out = '';
        var empty = 0;
        for (var i = 0; i < row.length; i++) {
          var cell = row[i];
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

  function pieceChar(key) {
    if (!key || key.length !== 2) return '';
    return key[0] === 'w' ? key[1].toUpperCase() : key[1].toLowerCase();
  }

  function metaOf(fen) {
    var rest = String(fen || '').trim().split(/\s+/).slice(1).join(' ');
    return rest || 'w - - 0 1';
  }

  function pieceNameForKey(key) {
    if (!key || key.length !== 2) return 'Piece';
    return (
      (key[0] === 'w' ? 'White ' : 'Black ') +
      (PIECE_NAMES[key[1].toUpperCase()] || 'Piece')
    );
  }

  function actual(dr, dc) {
    return state.flipped ? [7 - dr, 7 - dc] : [dr, dc];
  }

  // --- DB URL builders (mirror app/views/components/chess/boardUtils.ts) ---

  function yacB64(s) {
    try {
      return btoa(unescape(encodeURIComponent(s))).replace(/\//g, '*');
    } catch (e) {
      return '';
    }
  }

  function pdbUrl(fen) {
    var map = { K: 'K', Q: 'D', R: 'T', B: 'L', N: 'S', P: 'B' };
    var tokens = [];
    var ranks = placement(fen).split('/');
    for (var ri = 0; ri < ranks.length; ri++) {
      var rank = ranks[ri] || '';
      var rankNum = 8 - ri;
      var fileIdx = 0;
      for (var ci = 0; ci < rank.length; ci++) {
        var ch = rank[ci];
        if (ch >= '1' && ch <= '8') {
          fileIdx += Number(ch);
          continue;
        }
        var isWhite = ch === ch.toUpperCase();
        var type = map[ch.toUpperCase()] || '?';
        tokens.push((isWhite ? 'w' : 's') + type + FILES[fileIdx] + rankNum);
        fileIdx++;
      }
    }
    return (
      'https://pdb.dieschwalbe.de/search.jsp?expression=' +
      encodeURIComponent("POSITION='" + tokens.join(' ') + "'")
    );
  }

  function yacpdbUrl(fen) {
    var parts = [];
    for (var i = 0; i < 14; i++) parts.push('');
    parts[0] = placement(fen);
    var joined = parts
      .concat(['0', '0', '0', '0'])
      .map(function (p) {
        return p.replace(/\\/g, '\\\\').replace(/\//g, '\\/');
      })
      .join('/');
    return 'https://www.yacpdb.org/#search/' + yacB64(joined) + '/1';
  }

  function computeDbUrl(provider, fen) {
    var trimmed = String(fen || '').trim();
    if (provider === 'lichess') {
      return (
        'https://lichess.org/analysis/standard/' +
        trimmed
          .split(' ')
          .map(function (seg) {
            return seg
              .split('/')
              .map(encodeURIComponent)
              .join('/');
          })
          .join('_')
      );
    }
    if (provider === 'chessdb') {
      return 'https://www.chessdb.cn/queryc_en/?' + trimmed.replace(/ /g, '_');
    }
    if (provider === 'pdb') return pdbUrl(trimmed);
    if (provider === 'yacpdb') return yacpdbUrl(trimmed);
    return '#';
  }

  // --- board rendering (delegated to @chessviewer-org/chess-viewer) ---

  function syncBoard() {
    if (!state.board) return;
    state.board.set({
      fen: state.fen,
      orientation: state.flipped ? 'black' : 'white',
      coordinates: state.showCoords,
      pieceStyle: state.pieceStyle,
      lightSquare: state.lightColor,
      darkSquare: state.darkColor
    });
  }

  function syncSelection() {
    if (!state.board) return;
    state.board.selectSquare(state.held);
  }

  function renderTextarea() {
    if (document.activeElement !== els.fenInput) els.fenInput.value = state.fen;
  }

  function renderError() {
    var hasError = !!state.error;
    els.fenErrorText.textContent = state.error;
    els.fenError.classList.toggle('fen-error-visible', hasError);
    els.fenWrap.classList.toggle('fen-input-error', hasError);
    els.fenInput.classList.toggle('fen-textarea-error', hasError);
    els.fenInput.setAttribute('aria-invalid', hasError ? 'true' : 'false');
  }

  function renderDbLinks() {
    for (var i = 0; i < els.dbRows.length; i++) {
      var a = els.dbRows[i];
      a.href = computeDbUrl(a.getAttribute('data-provider'), state.fen);
    }
  }

  function notifySlowDb(provider) {
    if (state.slowDbNotified) return;
    if (provider !== 'pdb' && provider !== 'yacpdb') return;
    state.slowDbNotified = true;
    notify('warning', 'PDB/YACPDB are slow databases — this lookup can take up to ~40 seconds.');
  }

  function onDbRowClick(e) {
    var a = e.target.closest('[data-provider]');
    if (!a) return;
    notifySlowDb(a.getAttribute('data-provider'));
  }

  function renderFavorite() {
    var fav = state.isFavorite;
    els.favBtn.classList.toggle('toolbar-btn-fav-active', fav);
    els.favBtn.classList.toggle('toolbar-btn-neutral', !fav);
    els.favBtn.setAttribute('aria-pressed', String(fav));
    els.favBtn.title = fav ? 'Remove from favorites' : 'Add to favorites';
    els.favLabel.textContent = fav ? 'Saved' : 'Save';
  }

  function renderCmdBar() {
    els.undoBtn.disabled = state.past.length === 0;
    els.redoBtn.disabled = state.future.length === 0;
  }

  function renderPalette() {
    for (var i = 0; i < els.paletteBtns.length; i++) {
      var btn = els.paletteBtns[i];
      var active = btn.getAttribute('data-palette') === state.palettePiece;
      btn.classList.toggle('palette-btn-active', active);
      btn.setAttribute('aria-pressed', String(active));
    }
    els.paletteHint.hidden = !state.palettePiece;
    if (state.palettePiece) {
      els.paletteHint.textContent =
        'Placing: ' + pieceNameForKey(state.palettePiece) + '. Click a square to place it.';
    }
  }

  function renderPaletteImages() {
    if (!els.paletteStyle) return;
    els.paletteStyle.setAttribute('data-palette-style', state.pieceStyle);
    for (var i = 0; i < els.paletteBtns.length; i++) {
      var btn = els.paletteBtns[i];
      var key = btn.getAttribute('data-palette');
      var img = btn.querySelector('img');
      if (key && img) img.src = pieceSrcFor(key, state.pieceStyle);
    }
  }

  function pieceSrcFor(key, style) {
    return '/piece/' + style + '/' + key + '.svg';
  }

  function renderTrash() {
    var held = !!state.held || !!state.palettePiece;
    els.trashEmpty.hidden = held;
    els.trashHeld.hidden = !held;
    els.trash.classList.toggle('trash-zone-active', !!state.held);
  }

  function renderFrame() {
    els.boardWrap.classList.toggle('board-frame-on', state.showThinFrame);
  }

  function renderOptions() {
    els.coordsOpt.checked = state.showCoords;
    els.frameOpt.checked = state.showThinFrame;
  }

  function renderShare() {
    els.shareDialog.dataset.state = state.shareOpen ? 'open' : 'closed';
    document.body.classList.toggle('modal-open', state.shareOpen);
    if (state.shareOpen) {
      els.shareFen.textContent = state.fen;
    }
  }

  function renderAll() {
    syncBoard();
    syncSelection();
    renderTextarea();
    renderError();
    renderDbLinks();
    renderFavorite();
    renderCmdBar();
    renderPalette();
    renderPaletteImages();
    renderTrash();
    renderFrame();
    renderOptions();
    renderShare();
    renderCursor();
  }

  // --- state operations ---

  function loadFen(fen, fromHistory) {
    var p = placement(fen);
    if (!validPlacement(p)) return;
    state.fen = String(fen || '').trim();
    state.squares = parse(p);
    if (!fromHistory) {
      state.past = [];
      state.future = [];
    }
    saveFen();
    syncFavorite();
  }

  function commit(newPlacement) {
    var meta = metaOf(state.fen);
    state.past.push(state.fen);
    if (state.past.length > 100) state.past.shift();
    state.future = [];
    loadFen(newPlacement + (meta ? ' ' + meta : ''), true);
    saveHistory(state.fen, 'drag');
  }

  function onFenInput(value) {
    var v = String(value || '').trim();
    if (fenDebounceTimer) clearTimeout(fenDebounceTimer);
    if (!v) {
      state.error = '';
      renderError();
      return;
    }
    fenDebounceTimer = setTimeout(function () {
      var result = validateFenDetailed(v);
      if (!result.isValid) {
        state.error = result.errorMessage;
        renderError();
        return;
      }
      state.error = '';
      clearSelection();
      loadFen(v, false);
      renderAll();
    }, 300);
  }

  function onFenKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      els.fenInput.blur();
    }
  }

  function onFenBlur() {
    if (fenDebounceTimer) {
      clearTimeout(fenDebounceTimer);
      fenDebounceTimer = null;
    }
    var v = String(els.fenInput.value || '').trim();
    var result = validateFenDetailed(v);
    if (!result.isValid) {
      state.error = result.errorMessage;
      renderError();
      return;
    }
    state.error = '';
    if (v !== state.fen) {
      clearSelection();
      loadFen(v, false);
    }
    saveHistory(state.fen, 'manual');
    renderAll();
  }

  function clearSelection() {
    state.held = null;
    state.palettePiece = null;
    cancelDrag();
    syncSelection();
  }

  // --- keyboard navigation (ported from React useBoardKeyboard) ---

  function squareNameOf(dr, dc) {
    return FILES[dc] + (8 - dr);
  }

  function pieceNameOf(piece) {
    var up = String(piece || '').toUpperCase();
    return (piece === up ? 'White ' : 'Black ') + (PIECE_NAMES[up] || 'Piece');
  }

  function announce(msg) {
    if (!els.announce) return;
    els.announce.textContent = msg;
  }

  function moveCursor(dRow, dCol) {
    if (!state.cursor) {
      state.cursor = [state.flipped ? 7 : 0, state.flipped ? 7 : 0];
    } else {
      var dispRow = state.flipped ? 7 - state.cursor[0] : state.cursor[0];
      var dispCol = state.flipped ? 7 - state.cursor[1] : state.cursor[1];
      var nextDispRow = Math.min(7, Math.max(0, dispRow + dRow));
      var nextDispCol = Math.min(7, Math.max(0, dispCol + dCol));
      state.cursor = state.flipped
        ? [7 - nextDispRow, 7 - nextDispCol]
        : [nextDispRow, nextDispCol];
    }
    var r = state.cursor[0];
    var c = state.cursor[1];
    var piece = state.squares[r][c] || '';
    announce((piece ? pieceNameOf(piece) + ', ' : '') + squareNameOf(r, c));
    renderCursor();
    syncSelection();
  }

  function activateCursor() {
    var cur = state.cursor;
    if (!cur) return;
    var r = cur[0];
    var c = cur[1];
    if (state.keyHeld) {
      var kh = state.keyHeld;
      var b1 = state.squares.map(function (row) {
        return row.slice();
      });
      b1[r][c] = kh.piece;
      if (kh.from) {
        b1[kh.from[0]][kh.from[1]] = '';
      }
      state.keyHeld = null;
      commit(serialize(b1));
      announce(pieceNameOf(kh.piece) + ' placed on ' + squareNameOf(r, c));
      renderAll();
      return;
    }
    var piece = state.squares[r][c] || '';
    if (!piece) {
      announce(squareNameOf(r, c) + ' is empty, nothing to pick up');
      return;
    }
    state.keyHeld = { piece: piece, from: [r, c] };
    announce(
      pieceNameOf(piece) + ' picked up from ' + squareNameOf(r, c) +
        '. Move with arrow keys, press Enter to place, Escape to cancel.'
    );
  }

  function cancelCursorHeld() {
    if (!state.keyHeld) return;
    state.keyHeld = null;
    announce('Cancelled');
  }

  function removeAtCursor() {
    var cur = state.cursor;
    if (!cur) return;
    var r = cur[0];
    var c = cur[1];
    var piece = state.squares[r][c] || '';
    if (!piece) return;
    var b = state.squares.map(function (row) {
      return row.slice();
    });
    b[r][c] = '';
    commit(serialize(b));
    announce(pieceNameOf(piece) + ' removed from ' + squareNameOf(r, c));
    renderAll();
  }

  function renderCursor() {
    if (!els.boardGrid) return;
    var dispR = state.cursor ? (state.flipped ? 7 - state.cursor[0] : state.cursor[0]) : -1;
    var dispC = state.cursor ? (state.flipped ? 7 - state.cursor[1] : state.cursor[1]) : -1;
    var btns = els.boardGrid.querySelectorAll('[data-r]');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var isCursor =
        Number(btn.getAttribute('data-r')) === dispR &&
        Number(btn.getAttribute('data-c')) === dispC;
      btn.classList.toggle('board-square-cursor', isCursor);
    }
  }

  function undo() {
    var prev = state.past.pop();
    if (prev === undefined) return;
    state.future.push(state.fen);
    clearSelection();
    loadFen(prev, true);
    renderAll();
  }

  function redo() {
    var next = state.future.pop();
    if (next === undefined) return;
    state.past.push(state.fen);
    clearSelection();
    loadFen(next, true);
    renderAll();
  }

  function flip() {
    state.flipped = !state.flipped;
    persistOptions();
    clearSelection();
    renderAll();
  }

  function clickSquare(dr, dc) {
    var a = actual(dr, dc);
    var r = a[0];
    var c = a[1];
    if (state.palettePiece) {
      var b1 = state.squares.map(function (row) {
        return row.slice();
      });
      b1[r][c] = pieceChar(state.palettePiece);
      commit(serialize(b1));
      renderAll();
      return;
    }
    if (state.held) {
      var hr = state.held[0];
      var hc = state.held[1];
      if (hr === r && hc === c) {
        state.held = null;
        renderAll();
        return;
      }
      var b2 = state.squares.map(function (row) {
        return row.slice();
      });
      b2[r][c] = b2[hr][hc];
      b2[hr][hc] = '';
      state.held = null;
      commit(serialize(b2));
      renderAll();
      return;
    }
    state.held = state.squares[r][c] ? [r, c] : null;
    renderAll();
  }

  function selectPalette(key) {
    if (state.palettePiece === key) {
      state.palettePiece = null;
      renderAll();
      return;
    }
    state.palettePiece = key;
    state.held = null;
    notify('info', 'Placing ' + pieceNameForKey(key) + '. Click a square to place it.');
    renderAll();
  }

  function removeHeld() {
    if (!state.held) {
      notify('info', 'Select a piece on the board first.');
      return;
    }
    var r = state.held[0];
    var c = state.held[1];
    var b = state.squares.map(function (row) {
      return row.slice();
    });
    b[r][c] = '';
    state.held = null;
    commit(serialize(b));
    renderAll();
  }

  function paste() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      notify('error', 'Clipboard access is not supported here.');
      return;
    }
    navigator.clipboard
      .readText()
      .then(function (text) {
        var v = String(text || '').trim();
        if (!v) return;
        var pastedFen = v.length > MAX_LEN ? v.slice(0, MAX_LEN) : v;
        onFenInput(pastedFen);
        if (v.length > MAX_LEN) {
          notify('warning', 'FEN too long — truncated to 80 chars');
        } else {
          notify('success', 'FEN pasted successfully');
        }
      })
      .catch(function () {});
  }

  function copyFen() {
    navigator.clipboard
      .writeText(state.fen)
      .then(function () {
        notify('success', 'FEN copied to clipboard.');
      })
      .catch(function () {
        notify('error', 'Could not copy FEN.');
      });
  }

  function reset() {
    onFenInput(START_FEN);
    notify('info', 'Board reset to the starting position.');
  }

  function clearBoard() {
    onFenInput(EMPTY_FEN);
    notify('info', 'Board cleared.');
  }

  function share() {
    var url =
      location.origin + location.pathname + '?fen=' + encodeURIComponent(state.fen);
    state.shareUrl = url;
    state.shareOpen = true;
    els.shareUrlInput.textContent = url;
    els.shareFen.textContent = state.fen;
    renderShare();
    if (navigator.share) {
      navigator
        .share({ title: 'Chess position', url: url })
        .then(function () {
          closeShare();
        })
        .catch(function () {});
    } else {
      setTimeout(function () {
        els.shareCopy.focus();
      }, 0);
    }
  }

  function closeShare() {
    if (!state.shareOpen) return;
    state.shareOpen = false;
    renderShare();
  }

  function copyShareUrl() {
    navigator.clipboard
      .writeText(state.shareUrl)
      .then(function () {
        notify('success', 'Share link copied to clipboard.');
      })
      .catch(function () {
        notify('error', 'Could not copy the share link.');
      });
  }

  function toggleFavorite() {
    var v = String(state.fen || '').trim();
    if (!v) {
      notify('error', 'FEN is empty');
      return;
    }
    if (!validateFenDetailed(v).isValid) {
      notify('error', 'Invalid FEN - cannot favorite');
      return;
    }
    var isFav = !!state.favorites[v];
    if (isFav) delete state.favorites[v];
    else state.favorites[v] = true;
    try {
      localStorage.setItem('favoriteFens', JSON.stringify(state.favorites));
    } catch (e) {}
    state.isFavorite = !isFav;
    notify('success', isFav ? 'Removed from favorites' : 'Added to favorites');
    renderFavorite();
  }

  function addToBatch() {
    var v = String(state.fen || '').trim();
    if (!v) {
      notify('error', 'FEN is empty');
      return;
    }
    if (!validateFenDetailed(v).isValid) {
      notify('error', 'Invalid FEN - cannot add to batch');
      return;
    }
    var batch = [];
    try {
      batch = JSON.parse(localStorage.getItem('fenBatchList') || '[]') || [];
    } catch (e) {}
    if (!Array.isArray(batch)) batch = [];
    if (batch.some(function (f) { return String(f).trim() === v; })) {
      notify('warning', 'FEN already in batch');
      return;
    }
    if (batch.length >= 10) {
      notify('error', 'Maximum limit of 10 FENs reached');
      return;
    }
    batch.push(v);
    try {
      localStorage.setItem('fenBatchList', JSON.stringify(batch));
    } catch (e) {}
    notify('success', 'Added to batch');
  }

  function exportImage() {
    saveHistory(state.fen, 'export');
    try {
      sessionStorage.setItem(
        'cv_export_config',
        JSON.stringify({
          fen: state.fen,
          pieceStyle: state.pieceStyle,
          showCoords: state.showCoords,
          showCoordinateBorder: state.showCoordinateBorder,
          showThinFrame: state.showThinFrame,
          lightSquare: state.lightColor,
          darkSquare: state.darkColor,
          exportQuality: state.exportQuality,
          boardSize: state.boardSize,
          flipped: state.flipped,
          fileName: state.fileName
        })
      );
    } catch (e) {}
    window.location.href = '/export?fen=' + encodeURIComponent(state.fen);
  }

  // --- persistence ---

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function saveFen() {
    try {
      localStorage.setItem('chess-fen', state.fen);
    } catch (e) {}
  }

  function persistOptions() {
    try {
      localStorage.setItem('chess-show-coords', String(state.showCoords));
      localStorage.setItem('chess-show-thin-frame', String(state.showThinFrame));
      localStorage.setItem('chess-flipped', String(state.flipped));
    } catch (e) {}
  }

  function loadPrefs() {
    try {
      var style = localStorage.getItem('chess-piece-style');
      if (style) state.pieceStyle = style;
      var coords = localStorage.getItem('chess-show-coords');
      if (coords !== null) state.showCoords = coords !== 'false';
      var coordBorder = localStorage.getItem('chess-show-coordinate-border');
      if (coordBorder !== null) state.showCoordinateBorder = coordBorder !== 'false';
      var frame = localStorage.getItem('chess-show-thin-frame');
      if (frame !== null) state.showThinFrame = frame === 'true';
      var flip = localStorage.getItem('chess-flipped');
      if (flip === 'true') state.flipped = true;
      var light = localStorage.getItem('chess-light-square');
      if (light) state.lightColor = light;
      var dark = localStorage.getItem('chess-dark-square');
      if (dark) state.darkColor = dark;
      var size = localStorage.getItem('chess-board-size');
      if (size !== null) state.boardSize = Number(size) || 4;
      var fname = localStorage.getItem('chess-file-name');
      if (fname) state.fileName = fname;
      var quality = localStorage.getItem('chess-export-quality');
      if (quality !== null) state.exportQuality = Number(quality) || 16;
    } catch (e) {}
  }

  function loadFavorites() {
    try {
      var raw = localStorage.getItem('favoriteFens');
      state.favorites = raw ? JSON.parse(raw) : {};
      if (!state.favorites || typeof state.favorites !== 'object') state.favorites = {};
    } catch (e) {
      state.favorites = {};
    }
  }

  function loadHistory() {
    try {
      var raw = localStorage.getItem('fen-history');
      state.history = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(state.history)) state.history = [];
    } catch (e) {
      state.history = [];
    }
  }

  function saveHistory(fen, source) {
    var p = placement(fen);
    if (!p || !validPlacement(p)) return;
    var now = Date.now();
    var newEntry = {
      id: now,
      fen: fen,
      isFavorite: !!state.favorites[p],
      lastActiveAt: now,
      createdAt: now,
      source: source || 'manual'
    };
    var updated = [newEntry].concat(
      state.history.filter(function (e) {
        return e.fen !== fen;
      })
    );
    if (updated.length > 200) updated = updated.slice(0, 200);
    state.history = updated;
    try {
      localStorage.setItem('fen-history', JSON.stringify(updated));
    } catch (e) {}
  }

  function syncFavorite() {
    state.isFavorite = !!state.favorites[state.fen];
  }

  // --- drag and drop ---

  function dragPieceKey(dragData) {
    if (dragData.isFromPalette) return dragData.pieceKey;
    var piece = dragData.piece;
    return (piece === piece.toUpperCase() ? 'w' : 'b') + piece.toUpperCase();
  }

  function startDrag(dragData, clientX, clientY) {
    if (state.dragData) return;
    state.dragData = dragData;
    var ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.style.pointerEvents = 'none';
    ghost.style.position = 'fixed';
    ghost.style.zIndex = '9999';
    ghost.style.transform = 'translate(' + (clientX - 24) + 'px,' + (clientY - 24) + 'px)';
    ghost.style.width = '48px';
    ghost.style.height = '48px';
    ghost.style.borderRadius = '4px';
    ghost.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    ghost.style.opacity = '0.9';
    ghost.style.backgroundImage = 'url(/piece/' + state.pieceStyle + '/' + dragPieceKey(dragData) + '.svg)';
    ghost.style.backgroundSize = 'cover';
    ghost.style.backgroundRepeat = 'no-repeat';
    ghost.style.backgroundPosition = 'center';
    document.body.appendChild(ghost);
    state.dragGhost = ghost;
    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', onDragEnd);
    document.addEventListener('pointercancel', onDragEnd);
  }

  function cancelDrag() {
    if (state.dragGhost) {
      state.dragGhost.remove();
      state.dragGhost = null;
    }
    state.dragData = null;
    state.dragOver = null;
    if (els.boardGrid) els.boardGrid.classList.remove('drag-over');
    if (els.trash) els.trash.classList.remove('drag-over');
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragEnd);
    document.removeEventListener('pointercancel', onDragEnd);
  }

  function dragElementFromPoint(x, y) {
    var el = document.elementFromPoint(x, y);
    if (!el) return null;
    var square = el.closest('[data-r]');
    if (square) {
      return {
        kind: 'square',
        square: square,
        row: Number(square.getAttribute('data-r')),
        col: Number(square.getAttribute('data-c'))
      };
    }
    if (els.trash && els.trash.contains(el)) return { kind: 'trash' };
    return null;
  }

  function setDragOver(overId) {
    if (overId === state.dragOver) return;
    state.dragOver = overId;
    els.boardGrid.classList.toggle('drag-over', overId === 'board');
    els.trash.classList.toggle('drag-over', overId === 'trash');
  }

  function onDragMove(e) {
    if (!state.dragGhost) return;
    state.dragGhost.style.transform =
      'translate(' + (e.clientX - 24) + 'px,' + (e.clientY - 24) + 'px)';
    var hit = dragElementFromPoint(e.clientX, e.clientY);
    if (!hit) {
      setDragOver(null);
      return;
    }
    if (hit.kind === 'trash') {
      setDragOver('trash');
      return;
    }
    setDragOver('board');
    var a = actual(hit.row, hit.col);
    state.dragData.toRow = a[0];
    state.dragData.toCol = a[1];
  }

  function onDragEnd(e) {
    var overId = state.dragOver;
    var dragData = state.dragData;
    cancelDrag();
    if (!dragData || !overId) return;
    if (overId === 'trash') {
      if (!dragData.isFromPalette && dragData.fromRow !== undefined && dragData.fromCol !== undefined) {
        var b1 = state.squares.map(function (row) {
          return row.slice();
        });
        b1[dragData.fromRow][dragData.fromCol] = '';
        state.suppressClick = true;
        commit(serialize(b1));
        renderAll();
      }
      return;
    }
    if (
      overId === 'board' &&
      dragData.toRow !== undefined &&
      dragData.toCol !== undefined &&
      (dragData.toRow !== dragData.fromRow || dragData.toCol !== dragData.fromCol)
    ) {
      var b2 = state.squares.map(function (row) {
        return row.slice();
      });
      if (dragData.isFromPalette) {
        b2[dragData.toRow][dragData.toCol] = dragData.piece;
      } else if (dragData.fromRow !== undefined && dragData.fromCol !== undefined) {
        b2[dragData.toRow][dragData.toCol] = b2[dragData.fromRow][dragData.fromCol];
        b2[dragData.fromRow][dragData.fromCol] = '';
      }
      state.suppressClick = true;
      commit(serialize(b2));
      renderAll();
    }
  }

  function startDragBoard(dr, dc, e) {
    var a = actual(dr, dc);
    var r = a[0];
    var c = a[1];
    var piece = state.squares[r][c];
    if (!piece) return;
    e.preventDefault();
    startDrag(
      {
        piece: piece,
        pieceKey: (piece === piece.toUpperCase() ? 'w' : 'b') + piece.toUpperCase(),
        fromRow: r,
        fromCol: c,
        toRow: r,
        toCol: c,
        isFromPalette: false
      },
      e.clientX,
      e.clientY
    );
  }

  function startDragPalette(key, e) {
    e.preventDefault();
    startDrag(
      {
        piece: key[0] === 'w' ? key[1].toUpperCase() : key[1].toLowerCase(),
        pieceKey: key,
        fromRow: undefined,
        fromCol: undefined,
        toRow: undefined,
        toCol: undefined,
        isFromPalette: true
      },
      e.clientX,
      e.clientY
    );
  }

  // --- events ---

  function onBoardPointerDown(e) {
    var btn = e.target.closest('[data-r]');
    if (!btn || state.dragData) return;
    startDragBoard(Number(btn.getAttribute('data-r')), Number(btn.getAttribute('data-c')), e);
  }

  function onBoardClick(e) {
    var btn = e.target.closest('[data-r]');
    if (!btn) return;
    if (state.suppressClick) {
      state.suppressClick = false;
      return;
    }
    clickSquare(Number(btn.getAttribute('data-r')), Number(btn.getAttribute('data-c')));
  }

  function onPalettePointerDown(e) {
    var btn = e.target.closest('[data-palette]');
    if (!btn || state.dragData) return;
    startDragPalette(btn.getAttribute('data-palette'), e);
  }

  function onPaletteClick(e) {
    var btn = e.target.closest('[data-palette]');
    if (!btn) return;
    if (state.suppressClick) {
      state.suppressClick = false;
      return;
    }
    selectPalette(btn.getAttribute('data-palette'));
  }

  function onActionClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    switch (btn.getAttribute('data-action')) {
      case 'undo':
        undo();
        break;
      case 'redo':
        redo();
        break;
      case 'flip':
        flip();
        break;
      case 'remove':
        removeHeld();
        break;
      case 'copy-fen':
        copyFen();
        break;
      case 'share':
        share();
        break;
      case 'paste':
        paste();
        break;
      case 'favorite':
        toggleFavorite();
        break;
      case 'batch':
        addToBatch();
        break;
      case 'reset':
        reset();
        break;
      case 'clear':
        clearBoard();
        break;
    }
  }

  function onFenInputEvent() {
    onFenInput(els.fenInput.value);
  }

  function onKeydown(e) {
    var isTyping = document.activeElement === els.fenInput;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
      return;
    }
    if (isTyping) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveCursor(-1, 0);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveCursor(1, 0);
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      moveCursor(0, -1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveCursor(0, 1);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      activateCursor();
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (state.cursor) {
        e.preventDefault();
        removeAtCursor();
        return;
      }
      removeHeld();
      return;
    }
    if (e.key === 'Escape') {
      if (state.keyHeld) {
        e.preventDefault();
        cancelCursorHeld();
        return;
      }
      clearSelection();
      closeShare();
      return;
    }
    if (e.key.toLowerCase() === 'f') {
      flip();
    }
  }

  function onShareBackdrop(e) {
    if (e.target === els.shareDialog) closeShare();
  }

  function onOptionChange(e) {
    var opt = e.target.getAttribute('data-option');
    if (opt === 'showCoords') state.showCoords = e.target.checked;
    if (opt === 'showThinFrame') state.showThinFrame = e.target.checked;
    persistOptions();
    syncBoard();
    renderFrame();
  }

  function bindEvents() {
    els.boardGrid.addEventListener('pointerdown', onBoardPointerDown);
    els.boardGrid.addEventListener('click', onBoardClick);
    els.palette.forEach(function (section) {
      section.addEventListener('pointerdown', onPalettePointerDown);
      section.addEventListener('click', onPaletteClick);
    });
    document.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', onActionClick);
    });
    els.fenInput.addEventListener('input', onFenInputEvent);
    els.fenInput.addEventListener('keydown', onFenKeydown);
    els.fenInput.addEventListener('blur', onFenBlur);
    document.addEventListener('keydown', onKeydown);
    els.shareDialog.addEventListener('click', onShareBackdrop);
    els.shareCopy.addEventListener('click', copyShareUrl);
    els.coordsOpt.addEventListener('change', onOptionChange);
    els.frameOpt.addEventListener('change', onOptionChange);
    els.dbRows.forEach(function (a) {
      a.addEventListener('click', onDbRowClick);
    });
  }

  function init() {
    els.root = document.querySelector('[data-editor]');
    if (!els.root) return;
    els.boardWrap = els.root.querySelector('[data-board-wrap]');
    els.fenWrap = els.root.querySelector('[data-fen-wrap]');
    els.fenInput = els.root.querySelector('#fen-input');
    els.fenError = els.root.querySelector('#fen-error');
    els.fenErrorText = els.root.querySelector('[data-fen-error-text]');
    els.favBtn = els.root.querySelector('[data-favorite-btn]');
    els.favLabel = els.root.querySelector('[data-fav-label]');
    els.undoBtn = els.root.querySelector('[data-action="undo"]');
    els.redoBtn = els.root.querySelector('[data-action="redo"]');
    els.dbRows = els.root.querySelectorAll('[data-provider]');
    els.palette = els.root.querySelectorAll('.palette-card');
    els.paletteBtns = els.root.querySelectorAll('[data-palette]');
    els.paletteHint = els.root.querySelector('#palette-hint');
    els.trash = els.root.querySelector('#trash-zone');
    els.trashEmpty = els.root.querySelector('[data-trash-empty]');
    els.trashHeld = els.root.querySelector('[data-trash-held]');
    els.shareDialog = els.root.querySelector('#share-dialog');
    els.shareUrlInput = els.root.querySelector('#share-url');
    els.shareFen = els.root.querySelector('#share-fen');
    els.shareCopy = els.root.querySelector('#share-copy');
    els.coordsOpt = els.root.querySelector('[data-option="showCoords"]');
    els.frameOpt = els.root.querySelector('[data-option="showThinFrame"]');
    if (
      !els.boardWrap || !els.fenInput || !els.shareDialog || !els.coordsOpt || !els.frameOpt
    ) {
      return;
    }
    els.paletteStyle = els.root.querySelector('[data-palette-style]');

    var announce = document.createElement('div');
    announce.className = 'sr-only';
    announce.setAttribute('aria-live', 'polite');
    announce.id = 'board-live-region';
    document.body.appendChild(announce);
    els.announce = announce;

    loadPrefs();
    loadFavorites();
    loadHistory();

    var initial = START_FEN;
    var queryFen = els.root.getAttribute('data-fen') || '';
    if (queryFen && validPlacement(placement(queryFen))) {
      initial = queryFen;
      try {
        history.replaceState(null, '', location.pathname);
      } catch (e) {}
    } else {
      var saved = readStorage('chess-fen');
      if (saved && validPlacement(placement(saved))) initial = saved;
    }
    state.fen = initial;
    state.squares = parse(placement(initial));

    if (typeof window.ChessViewer === 'undefined') return;
    state.board = ChessViewer.createBoard(els.boardWrap, {
      fen: initial,
      orientation: state.flipped ? 'black' : 'white',
      coordinates: state.showCoords,
      pieceStyle: state.pieceStyle,
      lightSquare: state.lightColor,
      darkSquare: state.darkColor
    });
    els.boardGrid = state.board.getGrid();

    bindEvents();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

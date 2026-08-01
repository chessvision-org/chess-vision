(function () {
  'use strict';

  function sanitizeFileName(name) {
    return (
      String(name || 'chessboard')
        .trim()
        .replace(/[^a-z0-9._-]+/gi, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^[.-]+|[.-]+$/g, '')
        .slice(0, 80) || 'chessboard'
    );
  }

  function parseSmartNaming(input, totalCount) {
    var names = [];
    for (var i = 0; i < totalCount; i++) names.push('');
    if (!input || !input.trim()) return names;
    var tokens = input.split(',').map(function (t) {
      return t.trim();
    });
    var lastRangeBaseName = '';
    var hasRangeToken = false;
    for (var ti = 0; ti < tokens.length; ti++) {
      var token = tokens[ti];
      var open = token.lastIndexOf('[');
      var close = token.lastIndexOf(']');
      if (open <= 0 || close !== token.length - 1) continue;
      var rangePart = token.slice(open + 1, close);
      var dash = rangePart.indexOf('-');
      if (dash <= 0 || dash >= rangePart.length - 1) continue;
      var baseName = token.slice(0, open).trim();
      if (baseName) lastRangeBaseName = baseName;
      var startNum = Number(rangePart.slice(0, dash));
      var endNum = Number(rangePart.slice(dash + 1));
      if (!isFinite(startNum) || !isFinite(endNum)) continue;
      hasRangeToken = true;
      var start = Math.min(startNum, endNum);
      var end = Math.max(startNum, endNum);
      var counter = 1;
      for (var i2 = start; i2 <= end && i2 <= totalCount; i2++) {
        if (i2 < 1) continue;
        names[i2 - 1] = baseName + '-' + counter;
        counter++;
      }
    }
    if (!hasRangeToken) {
      var base = input.trim();
      for (var j = 0; j < totalCount; j++)
        names[j] = base + '-' + (j + 1);
      return names;
    }
    var fallback = lastRangeBaseName || 'Position';
    for (var k = 0; k < totalCount; k++) {
      if (!names[k]) names[k] = fallback + '-' + (k + 1);
    }
    return names;
  }

  function svgUrl(cfg) {
    var params = {
      fen: cfg.fen,
      style: cfg.pieceStyle,
      light: cfg.lightSquare,
      dark: cfg.darkSquare,
      coords: cfg.showCoords ? '1' : '0',
      border: cfg.showCoordinateBorder ? '1' : '0',
      frame: cfg.showThinFrame ? '1' : '0',
      flipped: cfg.flipped ? '1' : '0',
      size: String(cfg.boardSize || 8),
      quality: String(cfg.exportQuality || 2)
    };
    var parts = [];
    for (var p in params) {
      if (Object.prototype.hasOwnProperty.call(params, p)) {
        parts.push(p + '=' + encodeURIComponent(params[p]));
      }
    }
    return '/export/svg?' + parts.join('&');
  }

  function saveBlob(blob, fileName, extension) {
    var safeName = sanitizeFileName(fileName);
    var safeExt = String(extension || '')
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase();
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = safeExt ? safeName + '.' + safeExt : safeName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 100);
  }

  function parseFenLine(line) {
    var fen = line.trim();
    var parts = fen.split(' ').filter(Boolean);
    var board = parts[0] || '';
    if (board.indexOf('/') === -1 || board.length > 80) {
      return { fen: fen, valid: false, error: 'Invalid FEN' };
    }
    var ranks = board.split('/');
    if (ranks.length !== 8) {
      return { fen: fen, valid: false, error: 'Need 8 ranks' };
    }
    for (var r = 0; r < ranks.length; r++) {
      var rank = ranks[r];
      var count = 0;
      for (var c = 0; c < rank.length; c++) {
        var ch = rank[c];
        if (ch >= '1' && ch <= '8') count += Number(ch);
        else if (/[kqrbnpKQRBNP]/.test(ch)) count++;
        else return { fen: fen, valid: false, error: 'Invalid piece' };
      }
      if (count !== 8) {
        return { fen: fen, valid: false, error: 'Rank width ≠ 8' };
      }
    }
    return { fen: fen, valid: true };
  }

  var state = {
    text: '',
    positions: [],
    fileName: 'chessboard',
    exporting: false,
    exportProgress: 0
  };

  var els = {};

  function notify(type, message) {
    try {
      window.CV.notify.push({ type: type, message: message });
    } catch (e) {}
  }

  function validPositions() {
    return state.positions.filter(function (p) { return p.valid; });
  }

  function renderList() {
    var has = state.positions.length > 0;
    els.list.hidden = !has;
    var html = '';
    for (var i = 0; i < state.positions.length; i++) {
      var pos = state.positions[i];
      html +=
        '<div class="adv-item' + (pos.valid ? '' : ' invalid') + '">' +
        '<span class="adv-index">' + (i + 1) + '</span>' +
        '<span class="adv-fen">' + escapeHtml(pos.fen) + '</span>' +
        (pos.valid ? '' : '<span class="adv-status">' + escapeHtml(pos.error || 'Invalid FEN') + '</span>') +
        '<button type="button" class="btn-icon-sm" data-remove="' + i + '" aria-label="Remove position">&times;</button>' +
        '</div>';
    }
    els.list.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m];
    });
  }

  function render() {
    var validCount = validPositions().length;
    var invalidCount = state.positions.length - validCount;
    els.statPositions.textContent = String(state.positions.length);
    els.statValid.textContent = String(validCount);
    els.statInvalid.textContent = String(invalidCount);
    els.statInvalidWrap.hidden = invalidCount === 0;
    els.hintRange.textContent = validCount > 0 ? '-1, -2…' : '';
    els.exportBtn.disabled = validCount === 0 || state.exporting;
    els.exportCount.textContent = String(validCount);
    els.clearBtn.disabled = state.positions.length === 0;
    els.progress.hidden = !state.exporting;
    els.progressFill.style.width = state.exportProgress + '%';
    els.progressText.textContent = state.exportProgress + '%';
    renderList();
  }

  function parseFens() {
    state.positions = state.text
      .split('\n')
      .filter(function (line) {
        return line.trim();
      })
      .map(parseFenLine);
    render();
  }

  function remove(i) {
    state.positions.splice(i, 1);
    render();
  }

  function clearAll() {
    state.text = '';
    els.textarea.value = '';
    state.positions = [];
    state.exportProgress = 0;
    render();
  }

  function exportAll() {
    if (state.exporting) return;
    var valid = validPositions();
    if (valid.length === 0) return;
    var names = parseSmartNaming(state.fileName, valid.length);
    state.exporting = true;
    state.exportProgress = 0;
    render();

    var i = 0;
    function runNext() {
      if (i >= valid.length) {
        state.exporting = false;
        state.exportProgress = 100;
        render();
        notify('success', valid.length + ' SVGs exported');
        return;
      }
      var pos = valid[i];
      var cfg = {
        fen: pos.fen,
        pieceStyle: 'cburnett',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863',
        showCoords: true,
        showCoordinateBorder: true,
        showThinFrame: false,
        flipped: false,
        boardSize: 8,
        exportQuality: 2
      };
      fetch(svgUrl(cfg), { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) {
            return res.text().then(function (t) {
              throw new Error(t || 'SVG fetch failed');
            });
          }
          return res.text();
        })
        .then(function (svgString) {
          var blob = new Blob([svgString], {
            type: 'image/svg+xml;charset=utf-8'
          });
          saveBlob(
            blob,
            names[i] || 'chessboard-' + (i + 1),
            'svg'
          );
          i += 1;
          state.exportProgress = Math.round(
            (i / valid.length) * 100
          );
          render();
          runNext();
        })
        .catch(function () {
          i += 1;
          runNext();
        });
    }
    runNext();
  }

  function init() {
    var root = document.querySelector('[data-adv-root]');
    if (!root) return;
    els.textarea = root.querySelector('[data-adv-text]');
    els.statPositions = root.querySelector('[data-stat-positions]');
    els.statValid = root.querySelector('[data-stat-valid]');
    els.statInvalid = root.querySelector('[data-stat-invalid]');
    els.statInvalidWrap = root.querySelector('[data-stat-invalid-wrap]');
    els.hintRange = root.querySelector('[data-hint-range]');
    els.fileName = root.querySelector('[data-file-name]');
    els.progress = root.querySelector('[data-adv-progress]');
    els.progressFill = root.querySelector('[data-adv-progress-fill]');
    els.progressText = root.querySelector('[data-adv-progress-text]');
    els.exportBtn = root.querySelector('[data-export-all]');
    els.exportCount = root.querySelector('[data-export-count]');
    els.clearBtn = root.querySelector('[data-clear-all]');
    els.list = root.querySelector('[data-adv-list]');
    if (!els.textarea || !els.exportBtn || !els.list) return;

    els.fileName.value = state.fileName;
    els.textarea.addEventListener('input', function (e) {
      state.text = e.target.value;
      parseFens();
    });
    els.fileName.addEventListener('input', function (e) {
      state.fileName = e.target.value;
    });
    els.exportBtn.addEventListener('click', exportAll);
    els.clearBtn.addEventListener('click', clearAll);
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-remove]');
      if (btn) remove(Number(btn.getAttribute('data-remove')));
    });
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

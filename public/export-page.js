(function () {
  'use strict';

  var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  var DEFAULT_FILE_NAME = 'chessboard';
  var FORMAT_ORDER = ['jpeg', 'png', 'svg'];
  var WIZARD_KEY = 'cv_export_wizard';
  var CONFIG_KEY = 'cv_export_config';
  var PRESETS_KEY = 'custom-theme-presets';
  var BOARD_SIZE_MIN = 4;
  var BOARD_SIZE_MAX = 8;
  var MAX_NAME_LEN = 10;

  var BOARD_THEMES = {
    classic: { name: 'Classic', light: '#f0d9b5', dark: '#b58863' },
    brown: { name: 'Brown', light: '#f0d9b5', dark: '#946f51' },
    wood: { name: 'Wood', light: '#d4af7a', dark: '#8b4513' },
    sand: { name: 'Sand', light: '#f5deb3', dark: '#d2b48c' },
    slate: { name: 'Slate', light: '#d0d0d0', dark: '#4a4a4a' },
    marble: { name: 'Marble', light: '#e3e6e8', dark: '#6e7a8a' },
    blue: { name: 'Blue', light: '#dee3e6', dark: '#8ca2ad' },
    ocean: { name: 'Ocean', light: '#c9e4f5', dark: '#4a90a4' },
    green: { name: 'Green', light: '#ffffdd', dark: '#86a666' },
    forest: { name: 'Forest', light: '#d4e8d4', dark: '#2d6930' },
    mint: { name: 'Mint', light: '#e0f5e9', dark: '#6fb98f' },
    purple: { name: 'Purple', light: '#e8d5c7', dark: '#9f7ab9' },
    lavender: { name: 'Lavender', light: '#e6e6fa', dark: '#9370db' },
    red: { name: 'Red', light: '#ffe0c5', dark: '#c97866' },
    coral: { name: 'Coral', light: '#ffebcd', dark: '#ff7f50' },
    sunset: { name: 'Sunset', light: '#ffe4b5', dark: '#ff8c42' },
    pink: { name: 'Pink', light: '#ffd7e0', dark: '#d87093' },
    burgundy: { name: 'Burgundy', light: '#e8d0d0', dark: '#8b3a3a' },
    navy: { name: 'Navy', light: '#d9e3f0', dark: '#405d7f' },
    ice: { name: 'Ice', light: '#e8f4f8', dark: '#7eb8da' }
  };
  var BUILTIN_THEME_KEYS = [
    'classic', 'brown', 'wood', 'sand', 'slate', 'marble', 'blue', 'ocean',
    'green', 'forest', 'mint', 'purple', 'lavender', 'red', 'coral', 'sunset',
    'pink', 'burgundy', 'navy', 'ice'
  ];

  var PIECE_SETS = [
    { id: 'cburnett', name: 'Classic (CBurnett)' },
    { id: 'merida', name: 'Merida' },
    { id: 'staunty', name: 'Staunty' },
    { id: 'maestro', name: 'Maestro' },
    { id: 'horsey', name: 'Horsey' },
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'leipzig', name: 'Leipzig' },
    { id: 'pixel', name: 'Pixel' },
    { id: 'gioco', name: 'Gioco' },
    { id: 'governor', name: 'Governor' },
    { id: 'tatiana', name: 'Tatiana' },
    { id: 'dubrovny', name: 'Dubrovny' },
    { id: 'fresca', name: 'Fresca' },
    { id: 'cardinal', name: 'Cardinal' },
    { id: 'icpieces', name: 'IC Pieces' },
    { id: 'companion', name: 'Companion' },
    { id: 'california', name: 'California' },
    { id: 'pirouetti', name: 'Pirouetti' },
    { id: 'kosal', name: 'Kosal' },
    { id: 'spatial', name: 'Spatial' }
  ];

  var state = {
    tab: 'board-style',
    fen: START_FEN,
    pieceStyle: 'cburnett',
    showCoords: true,
    showThinFrame: false,
    flipped: false,
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    showCoordinateBorder: false,
    exportQuality: 2,
    boardSizePreset: 8,
    customBoardSizeInput: '8',
    customBoardSizeValue: 8,
    selectedFormats: ['jpeg', 'png'],
    fileNamesInput: '',
    fileNameError: null,
    isExporting: false,
    isPaused: false,
    exportProgress: 0,
    displayProgress: 0,
    currentFormat: null,
    previewUrl: '',
    previewLoading: false,
    previewError: false,
    themeTab: 'main',
    customPresets: [],
    themePage: 0,
    themeCols: 6,
    saveTarget: null,
    pickerName: '',
    pickerId: null,
    pickerLight: '#f0d9b5',
    pickerDark: '#b58863',
    pickerActive: 'light',
    pickerH: 0,
    pickerS: 1,
    pickerV: 1,
    satDragging: false,
    pieceSort: 'popular',
    piecePage: 0,
    pieceCols: 4,
    rows: 2,
    _progressTimer: null,
    _previewSeq: 0,
    _previewTimer: null
  };

  var els = {};
  var exp = { cancelled: false, paused: false };

  function notify(type, message) {
    try {
      window.CV.notify.push({ type: type, message: message });
    } catch (e) {}
  }

  // --- helpers ---

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  function parseNames(v) {
    var s = String(v || '').trim();
    if (!s) return [];
    return s
      .split(',')
      .map(function (n) { return n.trim(); })
      .filter(Boolean);
  }

  function getBoardSizeError(input) {
    var s = String(input || '').trim();
    if (!s) return null;
    var parsed = Number(s);
    if (!isFinite(parsed)) return 'Board size must be a valid number.';
    if (parsed < BOARD_SIZE_MIN || parsed > BOARD_SIZE_MAX) {
      return 'Board size must be between ' + BOARD_SIZE_MIN + 'cm and ' + BOARD_SIZE_MAX + 'cm.';
    }
    return null;
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed !== null && parsed !== undefined ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function readLocal(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function writeLocal(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function readSession(key) {
    try {
      var raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeSession(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function isValidHex(v) {
    return typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v);
  }

  function sanitizeHex(v, fb) {
    return isValidHex(v) ? v : fb;
  }

  // --- color conversions ---

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!result) return { r: 0, g: 0, b: 0 };
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (x) {
      var hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function rgbToHsv(r, g, b) {
    var rn = r / 255, gn = g / 255, bn = b / 255;
    var max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    var d = max - min;
    var h = 0;
    var s = max === 0 ? 0 : d / max;
    var v = max;
    if (max !== min) {
      if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
      else if (max === gn) h = (bn - rn) / d + 2;
      else h = (rn - gn) / d + 4;
      h /= 6;
    }
    return { h: h, s: s, v: v };
  }

  function hsvToRgb(h, s, v) {
    var r = 0, g = 0, b = 0;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  // --- export sizing ---

  function shouldForceCoordinateBorder(quality) {
    return quality === 3 || quality === 4;
  }

  function getMaxCanvasSize() {
    try {
      var ua = navigator.userAgent;
      if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 16384;
      if (window.innerWidth <= 768 && (window.devicePixelRatio || 1) >= 2) return 8192;
      return 32767;
    } catch (e) {
      return 16384;
    }
  }

  function calcSurface(boardSizeCm, showCoords, exportQuality, showThinFrame) {
    var safeQ = isFinite(exportQuality) && exportQuality > 0 ? exportQuality : 1;
    var maxCanvas = getMaxCanvasSize();
    var rawBoard = Math.round((boardSizeCm / 2.54) * 300 * safeQ);
    var borderSize = showCoords
      ? Math.round(Math.max(18, Math.min(800, rawBoard * 0.05)))
      : 0;
    var rawW = Math.round(borderSize + rawBoard);
    var rawH = Math.round(rawBoard + borderSize);
    var w = rawW, h = rawH, sf = 1;
    if (rawW > maxCanvas || rawH > maxCanvas) {
      var md = Math.max(rawW, rawH);
      sf = maxCanvas / md;
      w = Math.round(rawW * sf);
      h = Math.round(rawH * sf);
    }
    var boardPx = Math.round(rawBoard * sf);
    var border = Math.round(borderSize * sf);
    var frame = showThinFrame ? Math.max(2, Math.round(boardPx * 0.003)) : 0;
    var framePad = showThinFrame ? frame * 2 : 0;
    var cw = Math.round(border + boardPx + framePad);
    var ch = Math.round(boardPx + border + framePad);
    var effDPI = Math.round(300 * safeQ * sf);
    return { canvasWidth: cw, canvasHeight: ch, effectiveDPI: effDPI, scaleFactor: sf };
  }

  function checkCancellation() {
    if (exp.cancelled) throw new Error('Export cancelled');
  }

  function waitIfPaused() {
    if (!exp.paused) return Promise.resolve();
    return new Promise(function (resolve) {
      var timer = setInterval(function () {
        if (!exp.paused) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }

  // --- DPI ---

  var crcTable = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      t[n] = c;
    }
    return t;
  })();

  function changePngDPI(blob, dpi) {
    return blob.arrayBuffer().then(function (buffer) {
      var bytes = new Uint8Array(buffer);
      var ppm = Math.round(dpi * 39.3701);
      var phys = new Uint8Array(21);
      phys.set([0, 0, 0, 9, 112, 72, 89, 115]);
      var dv = new DataView(phys.buffer);
      dv.setUint32(8, ppm);
      dv.setUint32(12, ppm);
      phys[16] = 1;
      var crc = 4294967295;
      for (var i = 4; i < 17; i++) crc = crcTable[(crc ^ phys[i]) & 255] ^ crc >>> 8;
      dv.setUint32(17, crc ^ 4294967295);
      var chunks = [bytes.slice(0, 8)];
      var pos = 8, inserted = false;
      while (pos < bytes.length) {
        var length = new DataView(bytes.buffer).getUint32(pos);
        var type = String.fromCharCode.apply(null, Array.from(bytes.slice(pos + 4, pos + 8)));
        if (!inserted && (type === 'IDAT' || type === 'PLTE')) {
          chunks.push(phys);
          inserted = true;
        }
        if (type !== 'pHYs') chunks.push(bytes.slice(pos, pos + 12 + length));
        pos += 12 + length;
      }
      if (!inserted) chunks.splice(chunks.length - 1, 0, phys);
      return new Blob(chunks, { type: 'image/png' });
    });
  }

  function changeJpegDPI(blob, dpi) {
    dpi = clamp(Math.round(dpi), 1, 65535);
    return blob.arrayBuffer().then(function (buffer) {
      var bytes = new Uint8Array(buffer);
      if (bytes[0] !== 255 || bytes[1] !== 216) return blob;
      var pos = 2;
      while (pos < bytes.length) {
        if (bytes[pos] !== 255) break;
        var marker = bytes[pos + 1];
        var l1 = bytes[pos + 2], l2 = bytes[pos + 3];
        if (l1 === undefined || l2 === undefined) break;
        var length = (l1 << 8) + l2;
        if (marker === 224 && length >= 16) {
          var jfif = bytes.slice(pos, pos + 2 + length);
          jfif[13] = 1;
          jfif[14] = dpi >> 8 & 255;
          jfif[15] = dpi & 255;
          jfif[16] = dpi >> 8 & 255;
          jfif[17] = dpi & 255;
          var out2 = new Uint8Array(bytes.length);
          out2.set(bytes.slice(0, pos));
          out2.set(jfif, pos);
          out2.set(bytes.slice(pos + 2 + length), pos + 2 + length);
          return new Blob([out2], { type: 'image/jpeg' });
        }
        if (marker === 218) break;
        pos += 2 + length;
      }
      var header = new Uint8Array([
        255, 224, 0, 16, 74, 70, 73, 70, 0, 1, 1, 1,
        dpi >> 8 & 255, dpi & 255, dpi >> 8 & 255, dpi & 255, 0, 0
      ]);
      var out = new Uint8Array(bytes.length + header.length);
      out.set(bytes.slice(0, 2));
      out.set(header, 2);
      out.set(bytes.slice(2), 2 + header.length);
      return new Blob([out], { type: 'image/jpeg' });
    });
  }

  function changeDPI(blob, dpi, format) {
    return format === 'png' ? changePngDPI(blob, dpi) : changeJpegDPI(blob, dpi);
  }

  // --- save blob ---

  function sanitizeFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') return 'chess-position';
    var s = fileName.replace(/[\\/:*?"<>|&]/g, '-');
    s = s.replace(/\s+/g, '_');
    s = s.replace(/^\.+/, '').replace(/\.+$/, '').trim();
    if (s.length > 100) s = s.substring(0, 100);
    return s || 'chess-position';
  }

  function saveBlob(blob, fileName, extension) {
    var safeName = sanitizeFileName(fileName);
    var safeExt = String(extension || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = safeExt ? safeName + '.' + safeExt : safeName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 100);
  }

  // --- svg fetch + raster ---

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
    for (var k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k)) {
        parts.push(k + '=' + encodeURIComponent(params[k]));
      }
    }
    return '/export/svg?' + parts.join('&');
  }

  function fetchSvg(cfg) {
    return fetch(svgUrl(cfg), { cache: 'no-store' }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          throw new Error(t || 'SVG fetch failed');
        });
      }
      return res.text();
    });
  }

  function rasterize(svgString, width, height, format) {
    return new Promise(function (resolve, reject) {
      var svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(svgBlob);
      var img = new Image();
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          var ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error('No canvas context'));
            return;
          }
          if (format === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(function (blob) {
            URL.revokeObjectURL(url);
            if (blob) resolve(blob);
            else reject(new Error('Canvas.toBlob returned null'));
          }, format === 'jpeg' ? 'image/jpeg' : 'image/png', 0.92);
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to decode SVG'));
      };
      img.src = url;
    });
  }

  // --- derived state ---

  function activeBoardSize() {
    return state.boardSizePreset === 'custom'
      ? state.customBoardSizeValue
      : state.boardSizePreset;
  }

  function customBoardSizeError() {
    return getBoardSizeError(state.customBoardSizeInput);
  }

  function resolvedFileNames() {
    var names = parseNames(state.fileNamesInput);
    var mapped = {
      jpeg: DEFAULT_FILE_NAME,
      png: DEFAULT_FILE_NAME,
      svg: DEFAULT_FILE_NAME
    };
    for (var i = 0; i < state.selectedFormats.length; i++) {
      var f = state.selectedFormats[i];
      mapped[f] = names[i] || DEFAULT_FILE_NAME;
    }
    return mapped;
  }

  function themePerPage() {
    return state.themeCols * 3;
  }

  function themeTiles() {
    var tiles = [];
    for (var i = 0; i < BUILTIN_THEME_KEYS.length; i++) {
      var key = BUILTIN_THEME_KEYS[i];
      var t = BOARD_THEMES[key];
      tiles.push({ key: 'b-' + key, name: t.name, light: t.light, dark: t.dark, custom: null });
    }
    for (var j = 0; j < state.customPresets.length; j++) {
      var p = state.customPresets[j];
      tiles.push({ key: 'c-' + p.id, name: p.name, light: p.light, dark: p.dark, custom: p.id });
    }
    return tiles;
  }

  function themePages() {
    return Math.max(1, Math.ceil(themeTiles().length / themePerPage()));
  }

  function showThemeAdd() {
    return state.themePage >= themePages() - 1;
  }

  function visibleThemes() {
    var tiles = themeTiles();
    var per = themePerPage();
    if (state.themePage >= Math.ceil(tiles.length / per) && tiles.length > 0) {
      state.themePage = Math.max(0, Math.ceil(tiles.length / per) - 1);
    }
    var start = state.themePage * per;
    return tiles.slice(start, start + per);
  }

  function themeIsSelected(light, dark) {
    return (
      String(state.lightSquare).toLowerCase() === String(light).toLowerCase() &&
      String(state.darkSquare).toLowerCase() === String(dark).toLowerCase()
    );
  }

  function piecePerPage() {
    return state.pieceCols * state.rows;
  }

  function piecePages() {
    return Math.max(1, Math.ceil(PIECE_SETS.length / piecePerPage()));
  }

  function pieceSetsSorted() {
    var copy = PIECE_SETS.slice();
    if (state.pieceSort === 'name') {
      copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
    }
    return copy;
  }

  function visiblePieceSets() {
    var per = piecePerPage();
    if (state.piecePage >= Math.ceil(PIECE_SETS.length / per)) {
      state.piecePage = Math.max(0, Math.ceil(PIECE_SETS.length / per) - 1);
    }
    var start = state.piecePage * per;
    return pieceSetsSorted().slice(start, start + per);
  }

  function pickerHex() {
    return state.pickerActive === 'light' ? state.pickerLight : state.pickerDark;
  }

  function pickerHueHex() {
    var rgb = hsvToRgb(state.pickerH, 1, 1);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // --- rendering ---

  function themeTileHtml(tile) {
    var selected = themeIsSelected(tile.light, tile.dark);
    var check = selected
      ? '<span class="theme-swatch-check" aria-hidden="true"><svg class="theme-swatch-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>'
      : '';
    var actions = '';
    if (tile.custom !== null) {
      actions =
        '<div class="theme-tile-actions">' +
        '<button type="button" class="theme-action-btn" data-edit-theme="' + tile.custom + '" aria-label="Edit ' + tile.name + '">' +
        '<svg class="theme-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>' +
        '</button>' +
        '<button type="button" class="theme-action-btn theme-action-btn-danger" data-delete-theme="' + tile.custom + '" aria-label="Delete ' + tile.name + '">' +
        '<svg class="theme-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>' +
        '</button>' +
        '</div>';
    }
    return (
      '<li class="theme-tile">' +
      '<button type="button" class="theme-swatch' + (selected ? ' theme-swatch-selected' : '') +
      '" data-theme-light="' + tile.light + '" data-theme-dark="' + tile.dark + '"' +
      ' title="' + tile.name + '" aria-label="Apply ' + tile.name + ' theme"' +
      ' aria-pressed="' + selected + '">' +
      '<span class="theme-swatch-half" style="background-color:' + tile.light + '"></span>' +
      '<span class="theme-swatch-half" style="background-color:' + tile.dark + '"></span>' +
      check +
      '</button>' +
      actions +
      '<span class="theme-tile-name">' + tile.name + '</span>' +
      '</li>'
    );
  }

  function renderThemeGrid() {
    var tiles = visibleThemes();
    var html = '';
    for (var i = 0; i < tiles.length; i++) {
      html += themeTileHtml(tiles[i]);
    }
    if (showThemeAdd()) {
      html +=
        '<li class="theme-tile">' +
        '<button type="button" class="theme-add" data-theme-add aria-label="Create a custom theme">' +
        '<svg class="theme-add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>' +
        '</button>' +
        '<span class="theme-tile-name">Add</span>' +
        '</li>';
    }
    els.themeGrid.innerHTML = html;
    els.themeGrid.style.gridTemplateColumns =
      'repeat(' + Math.max(1, state.themeCols || 5) + ', minmax(0, 1fr))';
  }

  function renderThemePager() {
    var pages = themePages();
    els.themePager.hidden = pages <= 1;
    els.themePageLabel.textContent = (state.themePage + 1) + ' / ' + pages;
    els.themePrev.disabled = state.themePage === 0;
    els.themeNext.disabled = state.themePage >= pages - 1;
  }

  function renderPieceGrid() {
    var sets = visiblePieceSets();
    var html = '';
    for (var i = 0; i < sets.length; i++) {
      var set = sets[i];
      var active = state.pieceStyle === set.id;
      html +=
        '<button type="button" class="piece-tile' + (active ? ' piece-tile-active' : '') +
        '" data-piece="' + set.id + '" aria-pressed="' + active + '" aria-label="' + set.name + '">' +
        '<img class="piece-tile-img" src="/piece/' + set.id + '/wN.svg" alt="' + set.name + '" width="44" height="44" loading="lazy" />' +
        '<span class="piece-tile-name">' + set.name + '</span>' +
        '</button>';
    }
    els.pieceGrid.innerHTML = html;
    els.pieceGrid.style.gridTemplateColumns =
      'repeat(' + Math.max(1, state.pieceCols || 4) + ', minmax(0, 1fr))';
  }

  function renderPiecePager() {
    var pages = piecePages();
    els.piecePager.hidden = pages <= 1;
    els.piecePageLabel.textContent = (state.piecePage + 1) + ' / ' + pages;
    els.piecePrev.disabled = state.piecePage === 0;
    els.pieceNext.disabled = state.piecePage >= pages - 1;
  }

  function renderThemeTabs() {
    var mainPanel = els.root.querySelector('[data-theme-panel="main"]');
    var customPanel = els.root.querySelector('[data-theme-panel="custom"]');
    var isCustom = state.themeTab === 'custom';
    mainPanel.hidden = isCustom;
    customPanel.hidden = !isCustom;
    els.themeTabs.forEach(function (btn) {
      var active = btn.getAttribute('data-theme-tab') === state.themeTab;
      btn.classList.toggle('theme-tab-active', active);
      btn.classList.toggle('theme-tab-inactive', !active);
      btn.setAttribute('aria-selected', String(active));
    });
  }

  function renderPicker() {
    els.pickerTitle.textContent = state.pickerId !== null ? 'Edit theme' : 'New theme';
    els.pickerLightPreview.style.backgroundColor = state.pickerLight;
    els.pickerDarkPreview.style.backgroundColor = state.pickerDark;
    els.pickerLightHex.textContent = state.pickerLight;
    els.pickerDarkHex.textContent = state.pickerDark;
    els.pickerName.value = state.pickerName;
    els.satField.style.backgroundColor = pickerHueHex();
    els.satCursor.style.left = (state.pickerS * 100) + '%';
    els.satCursor.style.top = ((1 - state.pickerV) * 100) + '%';
    els.hueInput.value = String(Math.round(state.pickerH * 360));
    els.pickerSideBtns.forEach(function (btn) {
      var active = btn.getAttribute('data-picker-side') === state.pickerActive;
      btn.classList.toggle('square-btn-active', active);
      btn.classList.toggle('square-btn-inactive', !active);
    });
  }

  function renderTab() {
    els.tabBtns.forEach(function (btn) {
      var active = btn.getAttribute('data-tab-btn') === state.tab;
      btn.classList.toggle('tab-btn-active', active);
      btn.classList.toggle('tab-btn-inactive', !active);
      btn.setAttribute('aria-selected', String(active));
      var indicator = btn.querySelector('.tab-indicator');
      if (indicator) {
        indicator.classList.toggle('tab-indicator-active', active);
        indicator.classList.toggle('tab-indicator-inactive', !active);
      }
    });
    els.steps.forEach(function (step) {
      step.hidden = step.getAttribute('data-step') !== state.tab;
    });
  }

  function renderPreview() {
    els.previewImg.classList.toggle('board-preview-img-loading', state.previewLoading);
    els.previewLoadingEl.hidden = !state.previewLoading;
    els.previewErrorEl.hidden = !(!state.previewLoading && state.previewError);
    if (state.previewUrl && els.previewImg.getAttribute('src') !== state.previewUrl) {
      els.previewImg.src = state.previewUrl;
    }
  }

  function renderOptions() {
    els.coordsOpt.checked = state.showCoords;
    els.frameOpt.checked = state.showThinFrame;
  }

  function renderFormats() {
    els.formatBtns.forEach(function (btn) {
      var format = btn.getAttribute('data-format');
      var active = state.selectedFormats.indexOf(format) !== -1;
      btn.classList.toggle('format-option-active', active);
      btn.setAttribute('aria-pressed', String(active));
      var check = btn.querySelector('[data-format-check]');
      if (check) check.classList.toggle('format-check-active', active);
      var icon = btn.querySelector('[data-format-check-icon]');
      if (icon) icon.hidden = !active;
    });
  }

  function renderQuality() {
    els.qualityBtns.forEach(function (btn) {
      var active = Number(btn.getAttribute('data-quality')) === state.exportQuality;
      btn.classList.toggle('settings-btn-active', active);
      btn.classList.toggle('settings-btn-inactive', !active);
    });
  }

  function renderBoardSize() {
    els.sizeBtns.forEach(function (btn) {
      var active = Number(btn.getAttribute('data-size')) === state.boardSizePreset;
      btn.classList.toggle('settings-btn-active', active);
      btn.classList.toggle('settings-btn-inactive', !active);
    });
    var customActive = state.boardSizePreset === 'custom';
    els.sizeCustom.classList.toggle('board-size-input-active', customActive);
    if (document.activeElement !== els.sizeCustom) els.sizeCustom.value = state.customBoardSizeInput;
    var err = customBoardSizeError();
    els.customSizeError.textContent = err || '';
    els.customSizeError.hidden = !err;
    els.sizeCustom.setAttribute('aria-invalid', err ? 'true' : 'false');
  }

  function renderFileNames() {
    if (document.activeElement !== els.fileNames) els.fileNames.value = state.fileNamesInput;
    var err = state.fileNameError;
    els.fileNameError.textContent = err || '';
    els.fileNameError.hidden = !err;
    els.fileNames.setAttribute('aria-invalid', err ? 'true' : 'false');
  }

  function renderProgress() {
    els.progressModal.dataset.state = state.isExporting ? 'open' : 'closed';
    document.body.classList.toggle('modal-open', state.isExporting);
    els.exportStatus.textContent = state.isPaused ? 'Paused' : 'Creating image...';
    els.exportFormat.textContent = state.currentFormat
      ? String(state.currentFormat).toUpperCase()
      : '';
    els.progressFill.style.width = state.displayProgress + '%';
    els.progressBar.setAttribute('aria-valuenow', String(Math.round(state.displayProgress)));
    els.progressPercent.textContent = Math.round(state.displayProgress) + '% complete';
    els.pauseState.hidden = state.isPaused;
    els.resumeState.hidden = !state.isPaused;
    els.pauseBtn.setAttribute('aria-label', state.isPaused ? 'Resume export' : 'Pause export');
    renderProgressDetails();
  }

  function renderProgressDetails() {
    if (!els.progressDetails) return;
    if (!state.isExporting || state.currentFormat === 'svg') {
      els.progressDetails.hidden = true;
      return;
    }
    var cfg = getExportConfig();
    var surface = calcSurface(
      cfg.boardSize,
      cfg.showCoords,
      cfg.exportQuality,
      cfg.showThinFrame
    );
    var canvasPixels = surface.canvasWidth * surface.canvasHeight;
    var memoryMB = Math.round((canvasPixels * 4) / (1024 * 1024));
    els.progressResolution.textContent =
      'Resolution: ' + surface.canvasWidth + ' × ' + surface.canvasHeight + ' px (' + surface.effectiveDPI + ' DPI)';
    els.progressFileSize.textContent = 'File size estimate: ~' + estimateFileSize(canvasPixels, state.currentFormat);
    var isLarge = memoryMB >= 200;
    els.progressWarning.hidden = !isLarge;
    if (isLarge) {
      els.progressWarning.textContent =
        'Large export (RAM: ' + memoryMB + ' MB). May take longer.';
    }
    els.progressDetails.hidden = false;
  }

  function estimateFileSize(canvasPixels, format) {
    var bytesPerPixel = format === 'jpeg' ? 1.2 : format === 'png' ? 2.5 : 4;
    var bytes = canvasPixels * bytesPerPixel;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function renderAll() {
    renderTab();
    renderThemeTabs();
    renderThemeGrid();
    renderThemePager();
    renderPieceGrid();
    renderPiecePager();
    renderPicker();
    renderPreview();
    renderOptions();
    renderFormats();
    renderQuality();
    renderBoardSize();
    renderFileNames();
    renderProgress();
  }

  // --- actions ---

  function setTab(tab) {
    state.tab = tab === 'export-settings' ? 'export-settings' : 'board-style';
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('tab', state.tab);
      window.history.replaceState(null, '', url.toString());
    } catch (e) {}
    renderTab();
  }

  function computeCols() {
    try {
      if (window.matchMedia('(min-width: 1200px)').matches) state.themeCols = 10;
      else if (window.matchMedia('(min-width: 1000px)').matches) state.themeCols = 9;
      else if (window.matchMedia('(min-width: 800px)').matches) state.themeCols = 8;
      else if (window.matchMedia('(min-width: 640px)').matches) state.themeCols = 7;
      else if (window.matchMedia('(min-width: 480px)').matches) state.themeCols = 6;
      else state.themeCols = 5;
      if (window.matchMedia('(min-width: 1024px)').matches) state.pieceCols = 8;
      else if (window.matchMedia('(min-width: 640px)').matches) state.pieceCols = 6;
      else state.pieceCols = 4;
    } catch (e) {}
  }

  function applyTheme(light, dark) {
    state.lightSquare = sanitizeHex(light, '#f0d9b5');
    state.darkSquare = sanitizeHex(dark, '#b58863');
    writeLocal('chess-light-square', state.lightSquare);
    writeLocal('chess-dark-square', state.darkSquare);
    schedulePreview();
  }

  function openPicker(entry) {
    state.pickerId = entry.id;
    state.pickerName = entry.name;
    state.pickerLight = sanitizeHex(entry.light, '#f0d9b5');
    state.pickerDark = sanitizeHex(entry.dark, '#b58863');
    state.pickerActive = 'light';
    syncPickerHsv();
    state.themeTab = 'custom';
    renderThemeTabs();
    renderPicker();
  }

  function openLivePicker() {
    state.saveTarget = null;
    state.pickerLight = state.lightSquare;
    state.pickerDark = state.darkSquare;
    state.pickerActive = 'light';
    syncPickerHsv();
    state.themeTab = 'custom';
    renderThemeTabs();
    renderPicker();
  }

  function closePicker() {
    state.themeTab = 'main';
    renderThemeTabs();
    renderThemeGrid();
    renderThemePager();
  }

  function syncPickerHsv() {
    var rgb = hexToRgb(pickerHex());
    var hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    state.pickerH = hsv.h;
    state.pickerS = hsv.s;
    state.pickerV = hsv.v;
  }

  function pickerSetSide(side) {
    state.pickerActive = side;
    syncPickerHsv();
    renderPicker();
  }

  function pickerSetHsv(h, s, v) {
    var rgb = hsvToRgb(clamp(h, 0, 1), clamp(s, 0, 1), clamp(v, 0, 1));
    var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    if (state.pickerActive === 'light') state.pickerLight = hex;
    else state.pickerDark = hex;
    state.pickerH = clamp(h, 0, 1);
    state.pickerS = clamp(s, 0, 1);
    state.pickerV = clamp(v, 0, 1);
    if (!state.saveTarget) {
      applyTheme(state.pickerLight, state.pickerDark);
    }
    renderPicker();
  }

  function hueInput(value) {
    var h = Number(value || 0) / 360;
    pickerSetHsv(h, state.pickerS, state.pickerV);
  }

  function satPos(clientX, clientY) {
    var rect = els.satField.getBoundingClientRect();
    var s = clamp((clientX - rect.left) / rect.width, 0, 1);
    var v = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
    pickerSetHsv(state.pickerH, s, v);
  }

  function deleteTheme(id) {
    state.customPresets = state.customPresets.filter(function (p) { return p.id !== id; });
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(state.customPresets));
    } catch (e) {}
    notify('info', 'Custom theme deleted.');
    renderThemeGrid();
    renderThemePager();
  }

  function saveCustomTheme() {
    var name = String(state.pickerName || '').trim().slice(0, MAX_NAME_LEN);
    var light = state.pickerLight.toLowerCase();
    var dark = state.pickerDark.toLowerCase();
    var isEdit = state.pickerId !== null;

    if (!isEdit) {
      for (var i = 0; i < BUILTIN_THEME_KEYS.length; i++) {
        var bt = BOARD_THEMES[BUILTIN_THEME_KEYS[i]];
        if (bt.light.toLowerCase() === light && bt.dark.toLowerCase() === dark) {
          notify('info', 'This color pair already exists: "' + bt.name + '"');
          return;
        }
      }
      for (var j = 0; j < state.customPresets.length; j++) {
        var cp = state.customPresets[j];
        if (cp.light.toLowerCase() === light && cp.dark.toLowerCase() === dark) {
          notify('info', 'This color pair already exists: "' + cp.name + '"');
          return;
        }
      }
    }

    if (!name) {
      var used = {};
      for (var k = 0; k < state.customPresets.length; k++) {
        used[String(state.customPresets[k].name || '').toLowerCase()] = true;
      }
      var n = state.customPresets.length + 1;
      while (used['custom ' + n]) n += 1;
      name = ('Custom ' + n).slice(0, MAX_NAME_LEN);
    }

    if (isEdit) {
      state.customPresets = state.customPresets.map(function (p) {
        return p.id === state.pickerId
          ? { id: p.id, name: name, light: p.light, dark: p.dark, timestamp: p.timestamp }
          : p;
      });
    } else {
      state.customPresets = state.customPresets.concat([{
        id: Date.now(),
        name: name,
        light: state.pickerLight,
        dark: state.pickerDark,
        timestamp: Date.now()
      }]);
    }

    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(state.customPresets));
    } catch (e) {}

    applyTheme(state.pickerLight, state.pickerDark);
    notify('success', isEdit ? 'Theme updated.' : 'Theme saved.');
    state.themeTab = 'main';
    renderThemeTabs();
    renderThemeGrid();
    renderThemePager();
  }

  function setPieceStyle(id) {
    var valid = false;
    for (var i = 0; i < PIECE_SETS.length; i++) {
      if (PIECE_SETS[i].id === id) { valid = true; break; }
    }
    if (!valid) return;
    state.pieceStyle = id;
    writeLocal('chess-piece-style', id);
    schedulePreview();
    renderPieceGrid();
  }

  function setShowCoords(v) {
    state.showCoords = v;
    writeLocal('chess-show-coords', String(v));
    schedulePreview();
  }

  function setShowThinFrame(v) {
    state.showThinFrame = v;
    writeLocal('chess-show-thin-frame', String(v));
    schedulePreview();
  }

  function toggleFormat(format) {
    var includes = state.selectedFormats.indexOf(format) !== -1;
    if (includes && state.selectedFormats.length === 1) return;
    var next = includes
      ? state.selectedFormats.filter(function (f) { return f !== format; })
      : state.selectedFormats.concat([format]);
    var ordered = FORMAT_ORDER.filter(function (f) { return next.indexOf(f) !== -1; });
    var names = parseNames(state.fileNamesInput);
    if (names.length > ordered.length) {
      state.fileNamesInput = names.slice(0, ordered.length).join(', ');
    }
    state.selectedFormats = ordered;
    state.fileNameError = null;
    persistWizard();
    renderFormats();
    renderFileNames();
  }

  function setResolutionValue(r) {
    state.exportQuality = r;
    persistWizard();
    schedulePreview();
    renderQuality();
  }

  function selectBoardSizePreset(preset) {
    state.boardSizePreset = preset;
    persistWizard();
    renderBoardSize();
  }

  function updateCustomBoardSize(value) {
    var nextValue = String(value || '').trim();
    if (nextValue === '') {
      state.customBoardSizeInput = '';
      persistWizard();
      renderBoardSize();
      return;
    }
    if (!/^\d*\.?\d*$/.test(nextValue)) return;
    var parsed = Number(nextValue);
    if (!isFinite(parsed)) return;
    state.customBoardSizeInput = String(value || '');
    state.customBoardSizeValue = clamp(parsed, BOARD_SIZE_MIN, BOARD_SIZE_MAX);
    persistWizard();
    renderBoardSize();
  }

  function updateFileNames(value) {
    var parsedNames = parseNames(value);
    if (parsedNames.length > state.selectedFormats.length) {
      state.fileNameError =
        'Too many names for selected formats. Remove extra names or select more formats.';
    } else {
      state.fileNameError = null;
    }
    state.fileNamesInput = String(value || '');
    persistWizard();
    renderFileNames();
  }

  function persistWizard() {
    writeSession(WIZARD_KEY, {
      selectedFormats: state.selectedFormats,
      resolution: state.exportQuality,
      boardSizePreset: state.boardSizePreset,
      customBoardSizeInput: state.customBoardSizeInput,
      customBoardSizeValue: state.customBoardSizeValue,
      fileNamesInput: state.fileNamesInput
    });
  }

  function getExportConfig(overrides) {
    var q = overrides && overrides.exportQuality != null
      ? overrides.exportQuality
      : state.exportQuality;
    var size = overrides && overrides.boardSize != null
      ? overrides.boardSize
      : activeBoardSize();
    var border = shouldForceCoordinateBorder(q) || state.showCoordinateBorder;
    return {
      fen: state.fen,
      pieceStyle: state.pieceStyle,
      showCoords: state.showCoords,
      showCoordinateBorder: border,
      showThinFrame: state.showThinFrame,
      flipped: state.flipped,
      lightSquare: state.lightSquare,
      darkSquare: state.darkSquare,
      boardSize: size,
      exportQuality: q
    };
  }

  function schedulePreview() {
    if (state._previewTimer) clearTimeout(state._previewTimer);
    state._previewTimer = setTimeout(function () { refreshPreview(); }, 150);
  }

  function refreshPreview() {
    var cfg = getExportConfig({
      boardSize: activeBoardSize(),
      exportQuality: state.exportQuality
    });
    var seq = ++state._previewSeq;
    state.previewLoading = true;
    state.previewError = false;
    renderPreview();
    fetchSvg(cfg).then(function (svg) {
      if (seq !== state._previewSeq) return;
      var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      if (state.previewUrl) {
        try { URL.revokeObjectURL(state.previewUrl); } catch (e) {}
      }
      state.previewUrl = url;
      state.previewLoading = false;
      renderPreview();
    }, function () {
      if (seq !== state._previewSeq) return;
      state.previewLoading = false;
      state.previewError = true;
      renderPreview();
    });
  }

  function runFormatExport(format, cfg, name) {
    return waitIfPaused()
      .then(function () {
        return fetchSvg(cfg);
      })
      .then(function (svgString) {
        checkCancellation();
        if (format === 'svg') {
          var svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          saveBlob(svgBlob, name, 'svg');
          return;
        }
        var surface = calcSurface(
          cfg.boardSize,
          cfg.showCoords,
          cfg.exportQuality,
          cfg.showThinFrame
        );
        return waitIfPaused()
          .then(function () {
            return rasterize(svgString, surface.canvasWidth, surface.canvasHeight, format);
          })
          .then(function (blob) {
            return changeDPI(blob, surface.effectiveDPI, format);
          })
          .then(function (finalBlob) {
            checkCancellation();
            saveBlob(finalBlob, name, format === 'jpeg' ? 'jpg' : 'png');
          });
      });
  }

  function download() {
    if (state.isExporting) return;
    var formats = state.selectedFormats.slice();
    if (formats.length === 0) {
      notify('error', 'Select at least one format.');
      return;
    }
    var names = resolvedFileNames();
    var overrides = { boardSize: activeBoardSize(), exportQuality: state.exportQuality };
    state.isExporting = true;
    state.isPaused = false;
    state.exportProgress = 0;
    state.displayProgress = 0;
    state.currentFormat = formats[0] || 'png';
    renderProgress();

      var i = 0;
      var total = formats.length;

      var runNext = function () {
      if (i >= total) {
        state.isExporting = false;
        state.isPaused = false;
        state.exportProgress = 100;
        state.displayProgress = 100;
        state.currentFormat = null;
        notify('success', total + ' formats downloaded');
        renderProgress();
        return;
      }
      var format = formats[i];
      var name = names[format] || DEFAULT_FILE_NAME;
      var cfg = getExportConfig(overrides);
      state.currentFormat = format;
      state.exportProgress = (i / total) * 100;
      exp.cancelled = false;
      exp.paused = false;
      renderProgress();

      runFormatExport(format, cfg, name).then(function () {
        if (exp.cancelled) return;
        i += 1;
        state.exportProgress = (i / total) * 100;
        runNext();
      }, function (err) {
        state.isExporting = false;
        state.isPaused = false;
        state.exportProgress = 0;
        state.displayProgress = 0;
        state.currentFormat = null;
        renderProgress();
        if (err && err.message === 'Export cancelled') {
          notify('info', 'Export cancelled');
        } else {
          var label = String(format).toUpperCase();
          notify('error', label + ' export failed');
        }
      });
    };
    runNext();
  }

  function pauseExport() {
    if (!state.isExporting) return;
    exp.paused = true;
    state.isPaused = true;
    notify('info', 'Export paused');
    renderProgress();
  }

  function resumeExport() {
    exp.paused = false;
    state.isPaused = false;
    notify('info', 'Export resumed');
    renderProgress();
  }

  function cancelExport() {
    exp.cancelled = true;
    exp.paused = false;
    state.isExporting = false;
    state.isPaused = false;
    state.exportProgress = 0;
    state.displayProgress = 0;
    state.currentFormat = null;
    notify('info', 'Export cancelled');
    renderProgress();
  }

  // --- events ---

  function onClick(e) {
    var target = e.target;
    var btn = target.closest('[data-format]');
    if (btn) { toggleFormat(btn.getAttribute('data-format')); return; }
    btn = target.closest('[data-quality]');
    if (btn) { setResolutionValue(Number(btn.getAttribute('data-quality'))); return; }
    btn = target.closest('[data-size]');
    if (btn) { selectBoardSizePreset(Number(btn.getAttribute('data-size'))); return; }
    btn = target.closest('[data-tab-btn]');
    if (btn) { setTab(btn.getAttribute('data-tab-btn')); return; }
    btn = target.closest('[data-theme-tab]');
    if (btn) {
      if (btn.getAttribute('data-theme-tab') === 'custom') openLivePicker();
      else closePicker();
      return;
    }
    btn = target.closest('[data-theme-add]');
    if (btn) {
      openPicker({ id: null, name: '', light: state.lightSquare, dark: state.darkSquare });
      return;
    }
    btn = target.closest('[data-edit-theme]');
    if (btn) {
      var editId = btn.getAttribute('data-edit-theme');
      for (var ei = 0; ei < state.customPresets.length; ei++) {
        var ep = state.customPresets[ei];
        if (String(ep.id) === String(editId)) {
          openPicker({ id: ep.id, name: ep.name, light: ep.light, dark: ep.dark });
          return;
        }
      }
      return;
    }
    btn = target.closest('[data-delete-theme]');
    if (btn) { deleteTheme(btn.getAttribute('data-delete-theme')); return; }
    btn = target.closest('[data-theme-light]');
    if (btn) {
      applyTheme(btn.getAttribute('data-theme-light'), btn.getAttribute('data-theme-dark'));
      renderThemeGrid();
      return;
    }
    btn = target.closest('[data-piece]');
    if (btn) { setPieceStyle(btn.getAttribute('data-piece')); return; }
    btn = target.closest('[data-theme-prev]');
    if (btn) { state.themePage = clamp(state.themePage - 1, 0, themePages() - 1); renderThemeGrid(); renderThemePager(); return; }
    btn = target.closest('[data-theme-next]');
    if (btn) { state.themePage = clamp(state.themePage + 1, 0, themePages() - 1); renderThemeGrid(); renderThemePager(); return; }
    btn = target.closest('[data-piece-prev]');
    if (btn) { state.piecePage = clamp(state.piecePage - 1, 0, piecePages() - 1); renderPieceGrid(); renderPiecePager(); return; }
    btn = target.closest('[data-piece-next]');
    if (btn) { state.piecePage = clamp(state.piecePage + 1, 0, piecePages() - 1); renderPieceGrid(); renderPiecePager(); return; }
    btn = target.closest('[data-picker-side]');
    if (btn) { pickerSetSide(btn.getAttribute('data-picker-side')); return; }
    btn = target.closest('[data-picker-close]');
    if (btn) { closePicker(); return; }
    btn = target.closest('[data-save-theme]');
    if (btn) { saveCustomTheme(); return; }
    btn = target.closest('[data-pause-btn]');
    if (btn) {
      if (state.isPaused) resumeExport();
      else pauseExport();
      return;
    }
    btn = target.closest('[data-cancel-export]');
    if (btn) { cancelExport(); return; }
    btn = target.closest('[data-download]');
    if (btn) { download(); return; }
  }

  function onSatPointerDown(e) {
    state.satDragging = true;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    satPos(e.clientX, e.clientY);
  }

  function onSatPointerMove(e) {
    if (state.satDragging) satPos(e.clientX, e.clientY);
  }

  function onSatPointerUp(e) {
    state.satDragging = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
  }

  function onSatKey(e) {
    var step = 0.04;
    if (e.key === 'ArrowLeft') pickerSetHsv(state.pickerH, Math.max(0, state.pickerS - step), state.pickerV);
    else if (e.key === 'ArrowRight') pickerSetHsv(state.pickerH, Math.min(1, state.pickerS + step), state.pickerV);
    else if (e.key === 'ArrowUp') pickerSetHsv(state.pickerH, state.pickerS, Math.min(1, state.pickerV + step));
    else if (e.key === 'ArrowDown') pickerSetHsv(state.pickerH, state.pickerS, Math.max(0, state.pickerV - step));
    else return;
    e.preventDefault();
  }

  function onGridKey(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var grid = e.currentTarget;
    var isTheme = grid === els.themeGrid;
    var pages = isTheme ? themePages() : piecePages();
    if (pages <= 1) return;
    e.preventDefault();
    if (e.key === 'ArrowLeft') {
      if (isTheme) {
        state.themePage = clamp(state.themePage - 1, 0, pages - 1);
        renderThemeGrid();
        renderThemePager();
      } else {
        state.piecePage = clamp(state.piecePage - 1, 0, pages - 1);
        renderPieceGrid();
        renderPiecePager();
      }
    } else {
      if (isTheme) {
        state.themePage = clamp(state.themePage + 1, 0, pages - 1);
        renderThemeGrid();
        renderThemePager();
      } else {
        state.piecePage = clamp(state.piecePage + 1, 0, pages - 1);
        renderPieceGrid();
        renderPiecePager();
      }
    }
  }

  var _swipe = null;
  function onGridTouchStart(e) {
    _swipe = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onGridTouchEnd(e) {
    if (!_swipe) return;
    var dx = e.changedTouches[0].clientX - _swipe.x;
    var dy = e.changedTouches[0].clientY - _swipe.y;
    _swipe = null;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
    var grid = e.currentTarget;
    var isTheme = grid === els.themeGrid;
    var pages = isTheme ? themePages() : piecePages();
    if (pages <= 1) return;
    if (dx < 0) {
      if (isTheme) {
        state.themePage = clamp(state.themePage + 1, 0, pages - 1);
        renderThemeGrid();
        renderThemePager();
      } else {
        state.piecePage = clamp(state.piecePage + 1, 0, pages - 1);
        renderPieceGrid();
        renderPiecePager();
      }
    } else {
      if (isTheme) {
        state.themePage = clamp(state.themePage - 1, 0, pages - 1);
        renderThemeGrid();
        renderThemePager();
      } else {
        state.piecePage = clamp(state.piecePage - 1, 0, pages - 1);
        renderPieceGrid();
        renderPiecePager();
      }
    }
  }

  function bindEvents() {
    els.root.addEventListener('click', onClick);
    els.pieceSort.addEventListener('change', function (e) {
      state.pieceSort = e.target.value;
      state.piecePage = 0;
      renderPieceGrid();
      renderPiecePager();
    });
    els.coordsOpt.addEventListener('change', function (e) { setShowCoords(e.target.checked); });
    els.frameOpt.addEventListener('change', function (e) { setShowThinFrame(e.target.checked); });
    els.sizeCustom.addEventListener('focus', function () { selectBoardSizePreset('custom'); });
    els.sizeCustom.addEventListener('input', function (e) { updateCustomBoardSize(e.target.value); });
    els.fileNames.addEventListener('input', function (e) { updateFileNames(e.target.value); });
    els.hueInput.addEventListener('input', function (e) { hueInput(e.target.value); });
    els.pickerName.addEventListener('input', function (e) { state.pickerName = e.target.value; });
    els.satField.addEventListener('pointerdown', onSatPointerDown);
    els.satField.addEventListener('pointermove', onSatPointerMove);
    els.satField.addEventListener('pointerup', onSatPointerUp);
    els.satField.addEventListener('pointercancel', onSatPointerUp);
    els.satField.addEventListener('keydown', onSatKey);
    els.themeGrid.addEventListener('keydown', onGridKey);
    els.pieceGrid.addEventListener('keydown', onGridKey);
    els.themeGrid.addEventListener('touchstart', onGridTouchStart, { passive: true });
    els.themeGrid.addEventListener('touchend', onGridTouchEnd, { passive: true });
    els.pieceGrid.addEventListener('touchstart', onGridTouchStart, { passive: true });
    els.pieceGrid.addEventListener('touchend', onGridTouchEnd, { passive: true });
    window.addEventListener('resize', function () {
      computeCols();
      renderThemeGrid();
      renderThemePager();
      renderPieceGrid();
      renderPiecePager();
    });
  }

  function init() {
    els.root = document.querySelector('[data-export-page]');
    if (!els.root) return;

    var params = new URLSearchParams(window.location.search);
    var cfg = readSession(CONFIG_KEY);
    var queryFen = params.get('fen');
    var attrFen = els.root.getAttribute('data-fen') || '';

    var fen = (cfg && cfg.fen) || queryFen || attrFen || readLocal('chess-fen');
    if (!fen || !String(fen).trim()) {
      els.root.querySelector('[data-export-empty]').hidden = false;
      els.root.querySelector('[data-export-content]').hidden = true;
      return;
    }
    state.fen = String(fen).trim();
    state.tab = params.get('tab') === 'export-settings' ? 'export-settings' : 'board-style';

    var style = readLocal('chess-piece-style');
    if (style) state.pieceStyle = style;
    if (cfg && typeof cfg.pieceStyle === 'string' && cfg.pieceStyle) state.pieceStyle = cfg.pieceStyle;

    var coords = readLocal('chess-show-coords');
    if (coords !== null) state.showCoords = coords !== 'false';
    if (cfg && typeof cfg.showCoords === 'boolean') state.showCoords = cfg.showCoords;

    var frame = readLocal('chess-show-thin-frame');
    if (frame !== null) state.showThinFrame = frame === 'true';
    if (cfg && typeof cfg.showThinFrame === 'boolean') state.showThinFrame = cfg.showThinFrame;

    if (cfg && typeof cfg.showCoordinateBorder === 'boolean') {
      state.showCoordinateBorder = cfg.showCoordinateBorder;
    }
    if (cfg && typeof cfg.exportQuality === 'number' && cfg.exportQuality > 0) {
      state.exportQuality = cfg.exportQuality;
    }
    if (cfg && cfg.boardSize !== undefined) {
      var bs = Number(cfg.boardSize);
      if (bs === 4 || bs === 6 || bs === 8) state.boardSizePreset = bs;
      else if (isFinite(bs) && bs > 0) {
        state.boardSizePreset = 'custom';
        state.customBoardSizeValue = bs;
        state.customBoardSizeInput = String(bs);
      }
    }
    if (cfg && typeof cfg.fileName === 'string' && cfg.fileName.trim()) {
      state.fileNamesInput = cfg.fileName;
    }

    var flip = readLocal('chess-flipped');
    if (flip === 'true') state.flipped = true;
    if (cfg && typeof cfg.flipped === 'boolean') state.flipped = cfg.flipped;

    var light = readLocal('chess-light-square');
    if (light) state.lightSquare = sanitizeHex(light, '#f0d9b5');

    var dark = readLocal('chess-dark-square');
    if (dark) state.darkSquare = sanitizeHex(dark, '#b58863');

    var wizard = readSession(WIZARD_KEY);
    if (wizard) {
      if (Array.isArray(wizard.selectedFormats) && wizard.selectedFormats.length) {
        var next = FORMAT_ORDER.filter(function (f) { return wizard.selectedFormats.indexOf(f) !== -1; });
        if (next.length) state.selectedFormats = next;
      }
      if (typeof wizard.resolution === 'number') state.exportQuality = wizard.resolution;
      if (wizard.boardSizePreset !== undefined) state.boardSizePreset = wizard.boardSizePreset;
      if (typeof wizard.customBoardSizeInput === 'string') state.customBoardSizeInput = wizard.customBoardSizeInput;
      if (typeof wizard.customBoardSizeValue === 'number') state.customBoardSizeValue = wizard.customBoardSizeValue;
      if (typeof wizard.fileNamesInput === 'string') state.fileNamesInput = wizard.fileNamesInput;
    }

    var presets = readJson(PRESETS_KEY, []);
    if (Array.isArray(presets)) state.customPresets = presets;

    els.exportEmpty = els.root.querySelector('[data-export-empty]');
    els.exportContent = els.root.querySelector('[data-export-content]');
    els.steps = els.root.querySelectorAll('[data-step]');
    els.tabBtns = els.root.querySelectorAll('[data-tab-btn]');
    els.themeGrid = els.root.querySelector('[data-theme-grid]');
    els.themePager = els.root.querySelector('[data-theme-pager]');
    els.themePageLabel = els.root.querySelector('[data-theme-page-label]');
    els.themePrev = els.root.querySelector('[data-theme-prev]');
    els.themeNext = els.root.querySelector('[data-theme-next]');
    els.themeTabs = els.root.querySelectorAll('[data-theme-tab]');
    els.pickerTitle = els.root.querySelector('[data-picker-title]');
    els.pickerLightPreview = els.root.querySelector('[data-picker-light-preview]');
    els.pickerDarkPreview = els.root.querySelector('[data-picker-dark-preview]');
    els.pickerLightHex = els.root.querySelector('[data-picker-light]');
    els.pickerDarkHex = els.root.querySelector('[data-picker-dark]');
    els.pickerName = els.root.querySelector('[data-picker-name]');
    els.pickerSideBtns = els.root.querySelectorAll('[data-picker-side]');
    els.satField = els.root.querySelector('[data-sat-field]');
    els.satCursor = els.root.querySelector('[data-sat-cursor]');
    els.hueInput = els.root.querySelector('[data-hue-input]');
    els.pieceSort = els.root.querySelector('[data-piece-sort]');
    els.pieceGrid = els.root.querySelector('[data-piece-grid]');
    els.piecePager = els.root.querySelector('[data-piece-pager]');
    els.piecePageLabel = els.root.querySelector('[data-piece-page-label]');
    els.piecePrev = els.root.querySelector('[data-piece-prev]');
    els.pieceNext = els.root.querySelector('[data-piece-next]');
    els.previewImg = els.root.querySelector('[data-preview-img]');
    els.previewLoadingEl = els.root.querySelector('[data-preview-loading]');
    els.previewErrorEl = els.root.querySelector('[data-preview-error]');
    els.coordsOpt = els.root.querySelector('[data-option="showCoords"]');
    els.frameOpt = els.root.querySelector('[data-option="showThinFrame"]');
    els.formatBtns = els.root.querySelectorAll('[data-format]');
    els.qualityBtns = els.root.querySelectorAll('[data-quality]');
    els.sizeBtns = els.root.querySelectorAll('[data-size]');
    els.sizeCustom = els.root.querySelector('[data-size-custom]');
    els.customSizeError = els.root.querySelector('[data-custom-size-error]');
    els.fileNames = els.root.querySelector('[data-file-names]');
    els.fileNameError = els.root.querySelector('[data-file-name-error]');
    els.progressModal = els.root.querySelector('#export-progress');
    els.exportStatus = els.root.querySelector('[data-export-status]');
    els.exportFormat = els.root.querySelector('[data-export-format]');
    els.progressFill = els.root.querySelector('[data-progress-fill]');
    els.progressBar = els.root.querySelector('[data-progress-bar]');
    els.progressPercent = els.root.querySelector('[data-progress-percent]');
    els.progressDetails = els.root.querySelector('[data-progress-details]');
    els.progressResolution = els.root.querySelector('[data-progress-resolution]');
    els.progressFileSize = els.root.querySelector('[data-progress-filesize]');
    els.progressWarning = els.root.querySelector('[data-progress-warning]');
    els.pauseBtn = els.root.querySelector('[data-pause-btn]');
    els.pauseState = els.root.querySelector('[data-pause-state]');
    els.resumeState = els.root.querySelector('[data-resume-state]');
    if (
      !els.themeGrid || !els.pieceGrid || !els.previewImg || !els.progressModal ||
      !els.satField || !els.coordsOpt || !els.frameOpt
    ) {
      return;
    }

    bindEvents();
    computeCols();

    state._progressTimer = setInterval(function () {
      if (!state.isExporting || state.isPaused) return;
      var target = state.exportProgress;
      var cur = state.displayProgress;
      if (cur >= target) {
        state.displayProgress = target;
        return;
      }
      var diff = target - cur;
      state.displayProgress = Math.min(
        target,
        cur + Math.max(2, Math.min(10, diff / 3))
      );
      renderProgress();
    }, 50);

    renderAll();
    schedulePreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

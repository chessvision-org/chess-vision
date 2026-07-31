export function exportPageScript(): string {
  const script = String.raw`<script>
(function () {
  'use strict';
  document.addEventListener('alpine:init', function () {
    Alpine.data('exportPage', function (opts) {
      opts = opts || {};
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

      // --- export state ---
      var exp = { cancelled: false, paused: false };

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

      return {
        hasConfig: true,
        tab: opts.tab === 'export-settings' ? 'export-settings' : 'board-style',
        fen: opts.fen || START_FEN,
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
        _exportIndex: 0,
        _exportTotal: 0,
        _progressTimer: null,
        previewUrl: '',
        previewLoading: false,
        previewError: false,
        _previewSeq: 0,
        _previewTimer: null,
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

        init: function () {
          var params = new URLSearchParams(window.location.search);
          var cfg = readSession(CONFIG_KEY);
          var queryFen = params.get('fen');

          var fen = (cfg && cfg.fen) || queryFen || readLocal('chess-fen');
          if (!fen || !String(fen).trim()) {
            this.hasConfig = false;
            return;
          }
          this.hasConfig = true;
          this.fen = String(fen).trim();

          var style = readLocal('chess-piece-style');
          if (style) this.pieceStyle = style;

          var coords = readLocal('chess-show-coords');
          if (coords !== null) this.showCoords = coords !== 'false';

          var frame = readLocal('chess-show-thin-frame');
          if (frame !== null) this.showThinFrame = frame === 'true';

          var flip = readLocal('chess-flipped');
          if (flip === 'true') this.flipped = true;

          var light = readLocal('chess-light-square');
          if (light) this.lightSquare = sanitizeHex(light, '#f0d9b5');

          var dark = readLocal('chess-dark-square');
          if (dark) this.darkSquare = sanitizeHex(dark, '#b58863');

          var wizard = readSession(WIZARD_KEY);
          if (wizard) {
            if (Array.isArray(wizard.selectedFormats) && wizard.selectedFormats.length) {
              var next = FORMAT_ORDER.filter(function (f) { return wizard.selectedFormats.indexOf(f) !== -1; });
              if (next.length) this.selectedFormats = next;
            }
            if (typeof wizard.resolution === 'number') this.exportQuality = wizard.resolution;
            if (wizard.boardSizePreset !== undefined) this.boardSizePreset = wizard.boardSizePreset;
            if (typeof wizard.customBoardSizeInput === 'string') this.customBoardSizeInput = wizard.customBoardSizeInput;
            if (typeof wizard.customBoardSizeValue === 'number') this.customBoardSizeValue = wizard.customBoardSizeValue;
            if (typeof wizard.fileNamesInput === 'string') this.fileNamesInput = wizard.fileNamesInput;
          }

          var presets = readJson(PRESETS_KEY, []);
          if (Array.isArray(presets)) this.customPresets = presets;

          var self = this;
          this._progressTimer = setInterval(function () {
            if (!self.isExporting || self.isPaused) return;
            var target = self.exportProgress;
            var cur = self.displayProgress;
            if (cur >= target) {
              self.displayProgress = target;
              return;
            }
            var diff = target - cur;
            self.displayProgress = Math.min(
              target,
              cur + Math.max(2, Math.min(10, diff / 3))
            );
          }, 50);

          this.computeCols();
          this.schedulePreview();
        },

        setTab: function (tab) {
          this.tab = tab === 'export-settings' ? 'export-settings' : 'board-style';
          try {
            var url = new URL(window.location.href);
            url.searchParams.set('tab', this.tab);
            window.history.replaceState(null, '', url.toString());
          } catch (e) {}
        },

        computeCols: function () {
          try {
            if (window.matchMedia('(min-width: 1200px)').matches) this.themeCols = 10;
            else if (window.matchMedia('(min-width: 1000px)').matches) this.themeCols = 9;
            else if (window.matchMedia('(min-width: 800px)').matches) this.themeCols = 8;
            else if (window.matchMedia('(min-width: 640px)').matches) this.themeCols = 7;
            else if (window.matchMedia('(min-width: 480px)').matches) this.themeCols = 6;
            else this.themeCols = 5;
            if (window.matchMedia('(min-width: 1024px)').matches) this.pieceCols = 8;
            else if (window.matchMedia('(min-width: 640px)').matches) this.pieceCols = 6;
            else this.pieceCols = 4;
          } catch (e) {}
        },

        get activeBoardSize() {
          return this.boardSizePreset === 'custom'
            ? this.customBoardSizeValue
            : this.boardSizePreset;
        },

        get customBoardSizeError() {
          return getBoardSizeError(this.customBoardSizeInput);
        },

        get resolvedFileNames() {
          var names = parseNames(this.fileNamesInput);
          var mapped = {
            jpeg: DEFAULT_FILE_NAME,
            png: DEFAULT_FILE_NAME,
            svg: DEFAULT_FILE_NAME
          };
          for (var i = 0; i < this.selectedFormats.length; i++) {
            var f = this.selectedFormats[i];
            mapped[f] = names[i] || DEFAULT_FILE_NAME;
          }
          return mapped;
        },

        get themePerPage() {
          return this.themeCols * 3;
        },

        themeTiles: function () {
          var tiles = [];
          for (var i = 0; i < BUILTIN_THEME_KEYS.length; i++) {
            var key = BUILTIN_THEME_KEYS[i];
            var t = BOARD_THEMES[key];
            tiles.push({ key: 'b-' + key, name: t.name, light: t.light, dark: t.dark, custom: null });
          }
          for (var j = 0; j < this.customPresets.length; j++) {
            var p = this.customPresets[j];
            tiles.push({ key: 'c-' + p.id, name: p.name, light: p.light, dark: p.dark, custom: p.id });
          }
          return tiles;
        },

        get themePages() {
          return Math.max(1, Math.ceil(this.themeTiles().length / this.themePerPage));
        },

        get showThemeAdd() {
          return this.themePage >= this.themePages - 1;
        },

        visibleThemes: function () {
          var tiles = this.themeTiles();
          var per = this.themePerPage;
          if (this.themePage >= Math.ceil(tiles.length / per) && tiles.length > 0) {
            this.themePage = Math.max(0, Math.ceil(tiles.length / per) - 1);
          }
          var start = this.themePage * per;
          return tiles.slice(start, start + per);
        },

        themeIsSelected: function (light, dark) {
          return (
            String(this.lightSquare).toLowerCase() === String(light).toLowerCase() &&
            String(this.darkSquare).toLowerCase() === String(dark).toLowerCase()
          );
        },

        themeGo: function (page) {
          this.themePage = clamp(page, 0, this.themePages - 1);
        },
        themePrev: function () {
          this.themeGo(this.themePage - 1);
        },
        themeNext: function () {
          this.themeGo(this.themePage + 1);
        },

        applyTheme: function (light, dark) {
          var safeLight = sanitizeHex(light, '#f0d9b5');
          var safeDark = sanitizeHex(dark, '#b58863');
          this.lightSquare = safeLight;
          this.darkSquare = safeDark;
          writeLocal('chess-light-square', safeLight);
          writeLocal('chess-dark-square', safeDark);
          this.schedulePreview();
        },

        startAdd: function () {
          this.openPicker({ id: null, name: '', light: this.lightSquare, dark: this.darkSquare });
        },

        startEdit: function (tile) {
          this.openPicker({ id: tile.custom, name: tile.name, light: tile.light, dark: tile.dark });
        },

        openPicker: function (entry) {
          this.pickerId = entry.id;
          this.pickerName = entry.name;
          this.pickerLight = sanitizeHex(entry.light, '#f0d9b5');
          this.pickerDark = sanitizeHex(entry.dark, '#b58863');
          this.pickerActive = 'light';
          this.syncPickerHsv();
          this.themeTab = 'custom';
        },

        openLivePicker: function () {
          this.saveTarget = null;
          this.pickerLight = this.lightSquare;
          this.pickerDark = this.darkSquare;
          this.pickerActive = 'light';
          this.syncPickerHsv();
          this.themeTab = 'custom';
        },

        closePicker: function () {
          this.themeTab = 'main';
        },

        get pickerHex() {
          return this.pickerActive === 'light' ? this.pickerLight : this.pickerDark;
        },

        get pickerHueHex() {
          var rgb = hsvToRgb(this.pickerH, 1, 1);
          return rgbToHex(rgb.r, rgb.g, rgb.b);
        },

        syncPickerHsv: function () {
          var rgb = hexToRgb(this.pickerHex);
          var hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
          this.pickerH = hsv.h;
          this.pickerS = hsv.s;
          this.pickerV = hsv.v;
        },

        pickerSetSide: function (side) {
          this.pickerActive = side;
          this.syncPickerHsv();
        },

        pickerSetHex: function (hex) {
          var safe = sanitizeHex(hex, this.pickerHex);
          if (this.pickerActive === 'light') this.pickerLight = safe;
          else this.pickerDark = safe;
          var rgb = hexToRgb(safe);
          var hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
          this.pickerH = hsv.h;
          this.pickerS = hsv.s;
          this.pickerV = hsv.v;
          if (!this.saveTarget) {
            this.applyTheme(this.pickerLight, this.pickerDark);
          }
        },

        pickerSetHsv: function (h, s, v) {
          var rgb = hsvToRgb(clamp(h, 0, 1), clamp(s, 0, 1), clamp(v, 0, 1));
          var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          if (this.pickerActive === 'light') this.pickerLight = hex;
          else this.pickerDark = hex;
          this.pickerH = clamp(h, 0, 1);
          this.pickerS = clamp(s, 0, 1);
          this.pickerV = clamp(v, 0, 1);
          if (!this.saveTarget) {
            this.applyTheme(this.pickerLight, this.pickerDark);
          }
        },

        hueInput: function (ev) {
          var h = Number((ev && ev.target && ev.target.value) || 0) / 360;
          this.pickerSetHsv(h, this.pickerS, this.pickerV);
        },

        satPos: function (ev) {
          var el = this.$refs.sat;
          if (!el) return;
          var rect = el.getBoundingClientRect();
          var s = clamp((ev.clientX - rect.left) / rect.width, 0, 1);
          var v = 1 - clamp((ev.clientY - rect.top) / rect.height, 0, 1);
          this.pickerSetHsv(this.pickerH, s, v);
        },
        satDown: function (ev) {
          this.satDragging = true;
          try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) {}
          this.satPos(ev);
        },
        satMove: function (ev) {
          if (this.satDragging) this.satPos(ev);
        },
        satUp: function (ev) {
          this.satDragging = false;
          try { ev.currentTarget.releasePointerCapture(ev.pointerId); } catch (e) {}
        },
        satKey: function (ev) {
          var step = 0.04;
          if (ev.key === 'ArrowLeft') this.pickerSetHsv(this.pickerH, Math.max(0, this.pickerS - step), this.pickerV);
          else if (ev.key === 'ArrowRight') this.pickerSetHsv(this.pickerH, Math.min(1, this.pickerS + step), this.pickerV);
          else if (ev.key === 'ArrowUp') this.pickerSetHsv(this.pickerH, this.pickerS, Math.min(1, this.pickerV + step));
          else if (ev.key === 'ArrowDown') this.pickerSetHsv(this.pickerH, this.pickerS, Math.max(0, this.pickerV - step));
          else return;
          ev.preventDefault();
        },

        deleteTheme: function (id) {
          this.customPresets = this.customPresets.filter(function (p) { return p.id !== id; });
          try {
            localStorage.setItem(PRESETS_KEY, JSON.stringify(this.customPresets));
          } catch (e) {}
          this.notify('info', 'Custom theme deleted.');
        },

        saveCustomTheme: function () {
          var name = String(this.pickerName || '').trim().slice(0, MAX_NAME_LEN);
          var light = this.pickerLight.toLowerCase();
          var dark = this.pickerDark.toLowerCase();
          var isEdit = this.pickerId !== null;

          if (!isEdit) {
            for (var i = 0; i < BUILTIN_THEME_KEYS.length; i++) {
              var bt = BOARD_THEMES[BUILTIN_THEME_KEYS[i]];
              if (bt.light.toLowerCase() === light && bt.dark.toLowerCase() === dark) {
                this.notify('info', 'This color pair already exists: "' + bt.name + '"');
                return;
              }
            }
            for (var j = 0; j < this.customPresets.length; j++) {
              var cp = this.customPresets[j];
              if (cp.light.toLowerCase() === light && cp.dark.toLowerCase() === dark) {
                this.notify('info', 'This color pair already exists: "' + cp.name + '"');
                return;
              }
            }
          }

          if (!name) {
            var used = {};
            for (var k = 0; k < this.customPresets.length; k++) {
              used[String(this.customPresets[k].name || '').toLowerCase()] = true;
            }
            var n = this.customPresets.length + 1;
            while (used['custom ' + n]) n += 1;
            name = ('Custom ' + n).slice(0, MAX_NAME_LEN);
          }

          if (isEdit) {
            this.customPresets = this.customPresets.map(function (p) {
              return p.id === this.pickerId
                ? { id: p.id, name: name, light: p.light, dark: p.dark, timestamp: p.timestamp }
                : p;
            }.bind(this));
          } else {
            this.customPresets = this.customPresets.concat([{
              id: Date.now(),
              name: name,
              light: this.pickerLight,
              dark: this.pickerDark,
              timestamp: Date.now()
            }]);
          }

          try {
            localStorage.setItem(PRESETS_KEY, JSON.stringify(this.customPresets));
          } catch (e) {}

          this.applyTheme(this.pickerLight, this.pickerDark);
          this.notify('success', isEdit ? 'Theme updated.' : 'Theme saved.');
          this.themeTab = 'main';
        },

        setPieceStyle: function (id) {
          var valid = false;
          for (var i = 0; i < PIECE_SETS.length; i++) {
            if (PIECE_SETS[i].id === id) { valid = true; break; }
          }
          if (!valid) return;
          this.pieceStyle = id;
          writeLocal('chess-piece-style', id);
          this.schedulePreview();
        },

        pieceSetsSorted: function () {
          var copy = PIECE_SETS.slice();
          if (this.pieceSort === 'name') {
            copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
          }
          return copy;
        },

        get piecePerPage() {
          return this.pieceCols * this.rows;
        },

        get piecePages() {
          return Math.max(1, Math.ceil(PIECE_SETS.length / this.piecePerPage));
        },

        visiblePieceSets: function () {
          var per = this.piecePerPage;
          if (this.piecePage >= Math.ceil(PIECE_SETS.length / per)) {
            this.piecePage = Math.max(0, Math.ceil(PIECE_SETS.length / per) - 1);
          }
          var start = this.piecePage * per;
          return this.pieceSetsSorted().slice(start, start + per);
        },

        pieceGo: function (page) {
          this.piecePage = clamp(page, 0, this.piecePages - 1);
        },
        piecePrev: function () {
          this.pieceGo(this.piecePage - 1);
        },
        pieceNext: function () {
          this.pieceGo(this.piecePage + 1);
        },

        setShowCoords: function (v) {
          this.showCoords = v;
          writeLocal('chess-show-coords', String(v));
          this.schedulePreview();
        },
        setShowThinFrame: function (v) {
          this.showThinFrame = v;
          writeLocal('chess-show-thin-frame', String(v));
          this.schedulePreview();
        },
        flipBoard: function () {
          this.flipped = !this.flipped;
          writeLocal('chess-flipped', String(this.flipped));
          this.schedulePreview();
        },

        toggleFormat: function (format) {
          var includes = this.selectedFormats.indexOf(format) !== -1;
          if (includes && this.selectedFormats.length === 1) return;
          var next = includes
            ? this.selectedFormats.filter(function (f) { return f !== format; })
            : this.selectedFormats.concat([format]);
          var ordered = FORMAT_ORDER.filter(function (f) { return next.indexOf(f) !== -1; });
          var names = parseNames(this.fileNamesInput);
          if (names.length > ordered.length) {
            this.fileNamesInput = names.slice(0, ordered.length).join(', ');
          }
          this.selectedFormats = ordered;
          this.fileNameError = null;
          this.persistWizard();
        },

        setResolutionValue: function (r) {
          this.exportQuality = r;
          this.persistWizard();
          this.schedulePreview();
        },

        selectBoardSizePreset: function (preset) {
          this.boardSizePreset = preset;
          this.persistWizard();
        },

        updateCustomBoardSize: function (ev) {
          var value = String((ev && ev.target && ev.target.value) || '');
          var nextValue = value.trim();
          if (nextValue === '') {
            this.customBoardSizeInput = '';
            this.persistWizard();
            return;
          }
          if (!/^\d*\.?\d*$/.test(nextValue)) return;
          var parsed = Number(nextValue);
          if (!isFinite(parsed)) return;
          this.customBoardSizeInput = value;
          this.customBoardSizeValue = clamp(parsed, BOARD_SIZE_MIN, BOARD_SIZE_MAX);
          this.persistWizard();
        },

        updateFileNames: function (ev) {
          var value = String((ev && ev.target && ev.target.value) || '');
          var parsedNames = parseNames(value);
          if (parsedNames.length > this.selectedFormats.length) {
            this.fileNameError =
              'Too many names for selected formats. Remove extra names or select more formats.';
          } else {
            this.fileNameError = null;
          }
          this.fileNamesInput = value;
          this.persistWizard();
        },

        persistWizard: function () {
          writeSession(WIZARD_KEY, {
            selectedFormats: this.selectedFormats,
            resolution: this.exportQuality,
            boardSizePreset: this.boardSizePreset,
            customBoardSizeInput: this.customBoardSizeInput,
            customBoardSizeValue: this.customBoardSizeValue,
            fileNamesInput: this.fileNamesInput
          });
        },

        getExportConfig: function (overrides) {
          var q = overrides && overrides.exportQuality != null
            ? overrides.exportQuality
            : this.exportQuality;
          var size = overrides && overrides.boardSize != null
            ? overrides.boardSize
            : this.activeBoardSize;
          var border = shouldForceCoordinateBorder(q) || this.showCoordinateBorder;
          return {
            fen: this.fen,
            pieceStyle: this.pieceStyle,
            showCoords: this.showCoords,
            showCoordinateBorder: border,
            showThinFrame: this.showThinFrame,
            flipped: this.flipped,
            lightSquare: this.lightSquare,
            darkSquare: this.darkSquare,
            boardSize: size,
            exportQuality: q
          };
        },

        schedulePreview: function () {
          var self = this;
          if (this._previewTimer) clearTimeout(this._previewTimer);
          this._previewTimer = setTimeout(function () { self.refreshPreview(); }, 150);
        },

        refreshPreview: function () {
          var self = this;
          var cfg = this.getExportConfig({
            boardSize: this.activeBoardSize,
            exportQuality: this.exportQuality
          });
          var seq = ++this._previewSeq;
          this.previewLoading = true;
          this.previewError = false;
          fetchSvg(cfg).then(function (svg) {
            if (seq !== self._previewSeq) return;
            var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
            var url = URL.createObjectURL(blob);
            if (self.previewUrl) {
              try { URL.revokeObjectURL(self.previewUrl); } catch (e) {}
            }
            self.previewUrl = url;
            self.previewLoading = false;
          }, function () {
            if (seq !== self._previewSeq) return;
            self.previewLoading = false;
            self.previewError = true;
          });
        },

        download: function () {
          var self = this;
          if (this.isExporting) return;
          var formats = this.selectedFormats.slice();
          if (formats.length === 0) {
            this.notify('error', 'Select at least one format.');
            return;
          }
          var names = this.resolvedFileNames;
          var overrides = { boardSize: this.activeBoardSize, exportQuality: this.exportQuality };
          this.isExporting = true;
          this.isPaused = false;
          this.exportProgress = 0;
          this.displayProgress = 0;
          this.currentFormat = formats[0] || 'png';

          var i = 0;
          var total = formats.length;
          this._exportIndex = 0;
          this._exportTotal = total;

          var runNext = function () {
            if (i >= total) {
              self.isExporting = false;
              self.isPaused = false;
              self.exportProgress = 100;
              self.displayProgress = 100;
              self.currentFormat = null;
              self.notify('success', total + ' formats downloaded');
              return;
            }
            var format = formats[i];
            var name = names[format] || DEFAULT_FILE_NAME;
            var cfg = self.getExportConfig(overrides);
            self.currentFormat = format;
            self._exportIndex = i;
            self.exportProgress = (i / total) * 100;
            exp.cancelled = false;
            exp.paused = false;

            self.runFormatExport(format, cfg, name).then(function () {
              if (exp.cancelled) return;
              i += 1;
              self.exportProgress = (i / total) * 100;
              runNext();
            }, function (err) {
              self.isExporting = false;
              self.isPaused = false;
              self.exportProgress = 0;
              self.displayProgress = 0;
              self.currentFormat = null;
              if (err && err.message === 'Export cancelled') {
                self.notify('info', 'Export cancelled');
              } else {
                var label = String(format).toUpperCase();
                self.notify('error', label + ' export failed');
              }
            });
          };
          runNext();
        },

        pauseExport: function () {
          if (!this.isExporting) return;
          exp.paused = true;
          this.isPaused = true;
          this.notify('info', 'Export paused');
        },

        resumeExport: function () {
          exp.paused = false;
          this.isPaused = false;
          this.notify('info', 'Export resumed');
        },

        cancelExport: function () {
          exp.cancelled = true;
          exp.paused = false;
          this.isExporting = false;
          this.isPaused = false;
          this.exportProgress = 0;
          this.displayProgress = 0;
          this.currentFormat = null;
          this.notify('info', 'Export cancelled');
        },

        runFormatExport: function (format, cfg, name) {
          var self = this;
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
        },

        notify: function (type, message) {
          if (this.$store && this.$store.notifications) {
            this.$store.notifications.push({ type: type, message: message });
          }
        }
      };
    });
  });
})();
</script>`;

  return script;
}

export function editorStateScript(): string {
  const script = String.raw`<script>
(function () {
  'use strict';
  document.addEventListener('alpine:init', function () {
    Alpine.data('editorState', function (opts) {
      opts = opts || {};
      var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      var MAX_LEN = 80;

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

      function pieceKey(cell) {
        if (!cell) return '';
        return (cell === cell.toUpperCase() ? 'w' : 'b') + cell.toUpperCase();
      }

      function pieceChar(key) {
        if (!key || key.length !== 2) return '';
        return key[0] === 'w' ? key[1].toUpperCase() : key[1].toLowerCase();
      }

      function metaOf(fen) {
        var rest = String(fen || '').trim().split(/\s+/).slice(1).join(' ');
        return rest || 'w - - 0 1';
      }

      function yacB64(s) {
        try {
          return btoa(unescape(encodeURIComponent(s))).replace(/\//g, '*');
        } catch (e) {
          return '';
        }
      }

      function pdbUrl(fen) {
        var map = { K: 'K', Q: 'D', R: 'T', B: 'L', N: 'S', P: 'B' };
        var files = 'abcdefgh';
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
            tokens.push((isWhite ? 'w' : 's') + type + files[fileIdx] + rankNum);
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

      return {
        fen: opts.fen || START_FEN,
        squares: parse(placement(opts.fen || START_FEN)),
        error: '',
        past: [],
        future: [],
        held: null,
        palettePiece: null,
        favorites: [],
        isFavorite: false,
        showCoords: true,
        showThinFrame: false,
        flipped: false,
        pieceStyle: 'cburnett',
        lightColor: '#f0d9b5',
        darkColor: '#b58863',
        shareOpen: false,
        shareUrl: '',
        queryFen: opts.queryFen || null,

        init: function () {
          this.loadPrefs();
          var q =
            this.queryFen && validPlacement(placement(this.queryFen))
              ? this.queryFen
              : null;
          if (q) {
            this.loadFen(q, false);
            try {
              history.replaceState(null, '', location.pathname);
            } catch (e) {}
          } else {
            var saved = this.readStorage('chess-fen');
            if (saved && validPlacement(placement(saved))) {
              this.loadFen(saved, false);
            }
          }
          this.loadFavorites();
          this.syncFavorite();
        },

        get canUndo() {
          return this.past.length > 0;
        },
        get canRedo() {
          return this.future.length > 0;
        },
        get viewRows() {
          if (!this.flipped) return this.squares;
          return this.squares
            .slice()
            .reverse()
            .map(function (row) {
              return row.slice().reverse();
            });
        },

        actual: function (dr, dc) {
          return this.flipped ? [7 - dr, 7 - dc] : [dr, dc];
        },
        squareColor: function (dr, dc) {
          var a = this.actual(dr, dc);
          return (a[0] + a[1]) % 2 === 0 ? this.lightColor : this.darkColor;
        },
        squareLabel: function (dr, dc) {
          var a = this.actual(dr, dc);
          return 'abcdefgh'.charAt(a[1]) + (8 - a[0]);
        },
        isSelected: function (dr, dc) {
          if (!this.held) return false;
          var a = this.actual(dr, dc);
          return a[0] === this.held[0] && a[1] === this.held[1];
        },
        squareClasses: function (dr, dc) {
          return { 'board-square-selected': this.isSelected(dr, dc) };
        },
        pieceSrc: function (cell) {
          return cell
            ? '/piece/' + this.pieceStyle + '/' + pieceKey(cell) + '.svg'
            : '';
        },
        pieceSrcForKey: function (key) {
          return key ? '/piece/' + this.pieceStyle + '/' + key + '.svg' : '';
        },
        pieceNameForKey: function (key) {
          if (!key || key.length !== 2) return 'Piece';
          var names = {
            K: 'King',
            Q: 'Queen',
            R: 'Rook',
            B: 'Bishop',
            N: 'Knight',
            P: 'Pawn'
          };
          return (
            (key[0] === 'w' ? 'White ' : 'Black ') +
            (names[key[1].toUpperCase()] || 'Piece')
          );
        },
        pieceAlt: function (cell) {
          return cell ? this.pieceNameForKey(pieceKey(cell)) : '';
        },
        palettePieceName: function () {
          return this.palettePiece
            ? this.pieceNameForKey(this.palettePiece)
            : '';
        },

        clickSquare: function (dr, dc) {
          var a = this.actual(dr, dc);
          var r = a[0];
          var c = a[1];
          if (this.palettePiece) {
            var b1 = this.squares.map(function (row) {
              return row.slice();
            });
            b1[r][c] = pieceChar(this.palettePiece);
            this.commit(serialize(b1));
            return;
          }
          if (this.held) {
            var hr = this.held[0];
            var hc = this.held[1];
            if (hr === r && hc === c) {
              this.held = null;
              return;
            }
            var b2 = this.squares.map(function (row) {
              return row.slice();
            });
            b2[r][c] = b2[hr][hc];
            b2[hr][hc] = '';
            this.held = null;
            this.commit(serialize(b2));
            return;
          }
          this.held = this.squares[r][c] ? [r, c] : null;
        },
        selectPalette: function (key) {
          if (this.palettePiece === key) {
            this.palettePiece = null;
            return;
          }
          this.palettePiece = key;
          this.held = null;
          this.notify(
            'info',
            'Placing ' + this.pieceNameForKey(key) + '. Click a square to place it.'
          );
        },
        removeHeld: function () {
          if (!this.held) {
            this.notify('info', 'Select a piece on the board first.');
            return;
          }
          var r = this.held[0];
          var c = this.held[1];
          var b = this.squares.map(function (row) {
            return row.slice();
          });
          b[r][c] = '';
          this.held = null;
          this.commit(serialize(b));
        },
        clearSelection: function () {
          this.held = null;
          this.palettePiece = null;
        },

        loadFen: function (fen, fromHistory) {
          var p = placement(fen);
          if (!validPlacement(p)) return;
          this.fen = String(fen || '').trim();
          this.squares = parse(p);
          if (!fromHistory) {
            this.past = [];
            this.future = [];
          }
          this.saveFen();
          this.syncFavorite();
        },
        commit: function (newPlacement) {
          var meta = metaOf(this.fen);
          this.past.push(this.fen);
          if (this.past.length > 100) this.past.shift();
          this.future = [];
          this.loadFen(newPlacement + (meta ? ' ' + meta : ''), true);
        },
        onFenInput: function (ev) {
          var v = String(
            (ev && ev.target && ev.target.value) || this.fen || ''
          ).trim();
          if (v.length > MAX_LEN) {
            this.error = 'FEN too long (max 80 characters).';
            return;
          }
          var p = placement(v);
          if (!validPlacement(p)) {
            this.error = 'Invalid FEN notation.';
            return;
          }
          this.error = '';
          this.clearSelection();
          this.loadFen(v, false);
        },
        undo: function () {
          var prev = this.past.pop();
          if (prev === undefined) return;
          this.future.push(this.fen);
          this.clearSelection();
          this.loadFen(prev, true);
        },
        redo: function () {
          var next = this.future.pop();
          if (next === undefined) return;
          this.past.push(this.fen);
          this.clearSelection();
          this.loadFen(next, true);
        },
        flip: function () {
          this.flipped = !this.flipped;
          this.persistOptions();
        },
        onKeydown: function (e) {
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (e.shiftKey) this.redo();
            else this.undo();
            return;
          }
          if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            this.redo();
            return;
          }
          if (e.key === 'Delete' || e.key === 'Backspace') {
            this.removeHeld();
            return;
          }
          if (e.key === 'Escape') {
            this.clearSelection();
            this.shareOpen = false;
            return;
          }
          if (e.key.toLowerCase() === 'f') {
            this.flip();
          }
        },

        paste: function () {
          var self = this;
          if (!navigator.clipboard || !navigator.clipboard.readText) {
            this.notify('error', 'Clipboard access is not supported here.');
            return;
          }
          navigator.clipboard
            .readText()
            .then(function (text) {
              var v = String(text || '')
                .trim()
                .replace(/\s+/g, ' ')
                .slice(0, MAX_LEN);
              if (!v) return;
              self.fen = v;
              self.onFenInput(null);
              self.notify('success', 'FEN pasted from clipboard.');
            })
            .catch(function () {});
        },
        copyFen: function () {
          var self = this;
          navigator.clipboard
            .writeText(this.fen)
            .then(function () {
              self.notify('success', 'FEN copied to clipboard.');
            })
            .catch(function () {
              self.notify('error', 'Could not copy FEN.');
            });
        },
        reset: function () {
          this.fen = START_FEN;
          this.onFenInput(null);
          this.notify('info', 'Board reset to the starting position.');
        },
        clearBoard: function () {
          this.fen = '8/8/8/8/8/8/8/8 w - - 0 1';
          this.onFenInput(null);
        },
        share: function () {
          var url =
            location.origin +
            location.pathname +
            '?fen=' +
            encodeURIComponent(this.fen);
          if (navigator.share) {
            navigator
              .share({ title: 'Chess position', url: url })
              .catch(function () {});
          } else {
            this.shareUrl = url;
            this.shareOpen = true;
          }
        },
        copyShareUrl: function () {
          var self = this;
          navigator.clipboard
            .writeText(this.shareUrl)
            .then(function () {
              self.notify('success', 'Share link copied to clipboard.');
            })
            .catch(function () {
              self.notify('error', 'Could not copy the share link.');
            });
        },
        exportImage: function () {
          try {
            sessionStorage.setItem(
              'cv_export_config',
              JSON.stringify({
                fen: this.fen,
                pieceStyle: this.pieceStyle
              })
            );
          } catch (e) {}
          window.location.href =
            '/export?fen=' + encodeURIComponent(this.fen);
        },

        toggleFavorite: function () {
          var p = placement(this.fen);
          if (!p) {
            this.notify('error', 'No position to save.');
            return;
          }
          var idx = this.favorites.indexOf(p);
          if (idx !== -1) {
            this.favorites.splice(idx, 1);
            this.notify('info', 'Removed from favorites.');
          } else {
            if (this.favorites.length >= 10) {
              this.notify('error', 'Favorite limit (10) reached.');
              return;
            }
            this.favorites.push(p);
            this.notify('success', 'Position saved to favorites.');
          }
          try {
            localStorage.setItem(
              'chess-favorites',
              JSON.stringify(this.favorites)
            );
          } catch (e) {}
          this.syncFavorite();
        },
        addToBatch: function () {
          var p = placement(this.fen);
          if (!p) {
            this.notify('error', 'No position to add.');
            return;
          }
          var batch = [];
          try {
            batch =
              JSON.parse(localStorage.getItem('chess-fen-batch') || '[]') ||
              [];
          } catch (e) {}
          if (batch.indexOf(p) !== -1) {
            this.notify('info', 'Position is already in your batch.');
            return;
          }
          if (batch.length >= 10) {
            this.notify('error', 'Batch limit (10) reached.');
            return;
          }
          batch.push(p);
          try {
            localStorage.setItem(
              'chess-fen-batch',
              JSON.stringify(batch)
            );
          } catch (e) {}
          this.notify('success', 'Position added to your batch.');
        },
        dbUrl: function (provider) {
          return computeDbUrl(provider, this.fen);
        },

        loadPrefs: function () {
          try {
            var style = localStorage.getItem('chess-piece-style');
            if (style) this.pieceStyle = style;
            var coords = localStorage.getItem('chess-show-coords');
            if (coords !== null) this.showCoords = coords !== 'false';
            var frame = localStorage.getItem('chess-show-thin-frame');
            if (frame !== null) this.showThinFrame = frame === 'true';
            var flip = localStorage.getItem('chess-flipped');
            if (flip === 'true') this.flipped = true;
            var light = localStorage.getItem('chess-light-square');
            if (light) this.lightColor = light;
            var dark = localStorage.getItem('chess-dark-square');
            if (dark) this.darkColor = dark;
          } catch (e) {}
        },
        readStorage: function (key) {
          try {
            return localStorage.getItem(key);
          } catch (e) {
            return null;
          }
        },
        saveFen: function () {
          try {
            localStorage.setItem('chess-fen', this.fen);
          } catch (e) {}
        },
        persistOptions: function () {
          try {
            localStorage.setItem('chess-show-coords', String(this.showCoords));
            localStorage.setItem(
              'chess-show-thin-frame',
              String(this.showThinFrame)
            );
            localStorage.setItem('chess-flipped', String(this.flipped));
          } catch (e) {}
        },
        loadFavorites: function () {
          try {
            this.favorites =
              JSON.parse(localStorage.getItem('chess-favorites') || '[]') || [];
          } catch (e) {
            this.favorites = [];
          }
        },
        syncFavorite: function () {
          var p = placement(this.fen);
          this.isFavorite = this.favorites.indexOf(p) !== -1;
        },
        notify: function (type, message) {
          this.$store.notifications.push({ type: type, message: message });
        }
      };
    });
  });
})();
</script>`;

  return script;
}

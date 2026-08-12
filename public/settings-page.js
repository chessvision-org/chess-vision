(function () {
  'use strict';

  // ===== Constants =====

  var SESSION_KEY = 'sb-chess-vision-auth-token';
  var GUEST_PROFILE_KEY = 'chess_viewer_guest_profile';

  var KEYS = {
    themeMode: 'cv_theme_mode',
    contrast: 'cv_contrast',
    colorVision: 'cv_color_vision',
    reducedMotion: 'cv_reduced_motion',
    confirmDestructive: 'cv_security_confirm_destructive',
    hideSensitive: 'cv_security_hide_sensitive',
    showCoords: 'chess-show-coords',
    showFrame: 'chess-show-thin-frame',
    boardSize: 'chess-board-size',
    lightSquare: 'chess-light-square',
    darkSquare: 'chess-dark-square',
    pieceStyle: 'chess-piece-style',
    pieceSort: 'cv_piece_sort'
  };

  var STORAGE_CATEGORIES = [
    {
      id: 'board',
      label: 'Board & display',
      keys: [
        'chess-fen',
        'chess-piece-style',
        'chess-show-coords',
        'chess-show-coordinate-border',
        'chess-show-thin-frame',
        'chess-light-square',
        'chess-dark-square',
        'chess-board-size',
        'chess-flipped',
        'chess-file-name',
        'chess-export-quality'
      ]
    },
    {
      id: 'history',
      label: 'History & favorites',
      keys: [
        'fen-history',
        'fen-archive',
        'favoriteFens',
        'fenBatchList',
        'advancedFENFavorites',
        'advanced-fen-position-settings'
      ]
    },
    { id: 'themes', label: 'Custom themes', keys: ['custom-theme-presets'] }
  ];

  var PRESET_THEMES = [
    { light: '#F0D9B5', dark: '#B58863', name: 'Classic' },
    { light: '#EEEED2', dark: '#769656', name: 'Green' },
    { light: '#DEB887', dark: '#8B4513', name: 'Wood' },
    { light: '#E8E8E8', dark: '#A0A0A0', name: 'Gray' },
    { light: '#C8C8C8', dark: '#606060', name: 'Dark' },
    { light: '#FFCF9A', dark: '#D08A4E', name: 'Warm' },
    { light: '#EED4D4', dark: '#B48282', name: 'Rosy' },
    { light: '#D9E4F5', dark: '#8FA8CC', name: 'Blue' },
    { light: '#F0F0D5', dark: '#B5B57E', name: 'Olive' },
    { light: '#F5E6D3', dark: '#C89B6C', name: 'Tan' }
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

  var EVENT_LABELS = {
    SECURITY_REFRESH: 'Security re-verified',
    RECOVERY_CODES_GENERATED: 'Recovery codes generated',
    RECOVERY_CODE_SUCCESS: 'Recovery code used',
    RECOVERY_CODE_FAILURE: 'Recovery code failed',
    MFA_ENABLED: 'Two-factor enabled',
    MFA_DISABLED: 'Two-factor disabled',
    LOGIN_SUCCESS: 'Successful sign-in',
    LOGIN_FAILURE: 'Failed sign-in attempt',
    PASSWORD_CHANGE: 'Password changed'
  };

  var CVD_MATRICES = {
    deuteranopia:
      '0.29901 0.58699 0.11400 0 0.29901 0.58699 0.11400 0 0.00000 0.19333 0.80667 0 0 0 0 1 0',
    protanopia:
      '0.10889 0.89111 0.00000 0 0.10889 0.89111 0.00000 0 0.00000 0.25238 0.74762 0 0 0 0 1 0',
    tritanopia:
      '0.96720 0.03280 0.00000 0 0.02138 0.97862 0.00000 0 0.02138 0.52552 0.45310 0 0 0 0 1 0'
  };

  var DEFAULT_LIGHT = '#F0D9B5';
  var DEFAULT_DARK = '#B58863';

  var els = {};
  var state = {
    activeTab: 'profile',
    session: null,
    user: null,
    profile: null,
    mfaStatus: 'loading',
    verifyCode: '',
    backupCodes: [],
    copiedCode: null,
    mfaError: '',
    isSubmitting: false,
    confirmAction: null,
    deletePassword: '',
    deleteMfaCode: ''
  };

  // ===== Storage helpers =====

  function safeJSONParse(text, fallback) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return fallback;
    }
  }

  function readLocal(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v !== null ? v : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeLocal(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function removeLocal(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  function readPreference(key, fallback) {
    var raw = readLocal(key, null);
    if (raw === null) return fallback;
    var parsed = safeJSONParse(raw, raw);
    return typeof parsed === 'string' ? parsed : fallback;
  }

  function writePreference(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function isValidHex(v) {
    return typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v);
  }

  function sanitizeHex(v, fallback) {
    return isValidHex(v) ? v : fallback;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function formatDateTime(iso) {
    if (!iso) return null;
    var ms = Date.parse(iso);
    if (Number.isNaN(ms)) return null;
    return new Date(ms).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatEventTime(iso) {
    var formatted = formatDateTime(iso);
    return formatted || '';
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {});
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {}
    return Promise.resolve();
  }

  function notifySuccess(message) {
    if (window.CV && window.CV.notify) window.CV.notify.success(message);
  }

  function notifyError(message) {
    if (window.CV && window.CV.notify) window.CV.notify.error(message);
  }

  function notifyInfo(message) {
    if (window.CV && window.CV.notify) window.CV.notify.info(message);
  }

  function downloadText(filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Supabase client =====

  var sb = (function () {
    var url = '';
    var anonKey = '';

    function getSession() {
      var stored = readLocal(SESSION_KEY, null);
      if (!stored) return null;
      var session = safeJSONParse(stored, null);
      return session && session.access_token ? session : null;
    }

    function baseHeaders() {
      var session = getSession();
      var headers = { apikey: anonKey, 'Content-Type': 'application/json' };
      if (session && session.access_token) {
        headers.Authorization = 'Bearer ' + session.access_token;
      } else {
        headers.Authorization = 'Bearer ' + anonKey;
      }
      return headers;
    }

    function handleJson(res) {
      if (res.status === 204) {
        return { data: null, error: null };
      }
      return res
        .json()
        .then(function (data) {
          if (!res.ok || data.error) {
            var err = data.error || data;
            var message =
              err.message ||
              err.error_description ||
              err.msg ||
              err.code ||
              err.details ||
              err.hint;
            return {
              data: null,
              error: {
                message: String(
                  message || 'Request failed (' + res.status + ')'
                )
              }
            };
          }
          return { data: data, error: null };
        })
        .catch(function () {
          return {
            data: null,
            error: { message: 'Request failed (' + res.status + ')' }
          };
        });
    }

    function request(path, options) {
      return fetch(url + path, {
        method: options.method || 'GET',
        headers: Object.assign(baseHeaders(), options.headers || {}),
        body:
          options.body !== undefined ? JSON.stringify(options.body) : undefined
      });
    }

    function authRequest(path, options) {
      return request(path, options).then(handleJson);
    }

    return {
      getSession: getSession,

      setConfig: function (supabaseUrl, key) {
        url = supabaseUrl;
        anonKey = key;
      },

      getUser: function () {
        return authRequest('/auth/v1/user', { method: 'GET' });
      },

      updateUser: function (attributes) {
        return authRequest('/auth/v1/user', {
          method: 'PUT',
          body: attributes
        });
      },

      signInWithPassword: function (email, password) {
        return authRequest('/auth/v1/token?grant_type=password', {
          method: 'POST',
          body: { email: email, password: password }
        });
      },

      resetPasswordForEmail: function (email) {
        return authRequest('/auth/v1/recover', {
          method: 'POST',
          headers: {
            'redirect-to': window.location.origin + '/auth/reset-password'
          },
          body: { email: email, gotrue_meta_security: {} }
        });
      },

      signOut: function (scope) {
        return authRequest('/auth/v1/logout', {
          method: 'POST',
          headers: { 'X-Supabase-Api-Version': '20240101' },
          body: { scope: scope || 'local' }
        });
      },

      mfaList: function () {
        return authRequest('/auth/v1/factors', { method: 'GET' });
      },

      mfaEnroll: function (friendlyName) {
        return authRequest('/auth/v1/factors', {
          method: 'POST',
          body: {
            factor_type: 'totp',
            issuer: 'ChessViewer',
            friendly_name: friendlyName
          }
        });
      },

      mfaUnenroll: function (factorId) {
        return request('/auth/v1/factors/' + factorId, {
          method: 'DELETE'
        }).then(function (res) {
          if (res.status === 204 || res.status === 200) {
            return { data: null, error: null };
          }
          return handleJson(res);
        });
      },

      mfaChallenge: function (factorId) {
        return authRequest('/auth/v1/factors/' + factorId + '/challenge', {
          method: 'POST',
          body: {}
        });
      },

      mfaVerify: function (factorId, challengeId, code) {
        return authRequest('/auth/v1/factors/' + factorId + '/verify', {
          method: 'POST',
          body: { challenge_id: challengeId, code: code }
        });
      },

      rpc: function (name, body) {
        return authRequest('/rest/v1/rpc/' + name, {
          method: 'POST',
          body: body || {}
        });
      },

      profileGet: function (userId) {
        return request(
          '/rest/v1/profiles?select=display_name,supporter_until&user_id=eq.' +
            encodeURIComponent(userId),
          { method: 'GET' }
        ).then(handleJson);
      },

      profileUpsert: function (userId, displayName) {
        return request('/rest/v1/profiles?on_conflict=user_id', {
          method: 'POST',
          headers: {
            Prefer: 'resolution=merge-duplicates,return=representation'
          },
          body: [{ user_id: userId, display_name: displayName }]
        }).then(handleJson);
      },

      securityEvents: function (limit) {
        return request(
          '/rest/v1/security_events?select=id,event_type,created_at&order=created_at.desc&limit=' +
            limit,
          { method: 'GET' }
        ).then(handleJson);
      }
    };
  })();

  // ===== Modal helpers =====

  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.dataset.state = 'open';
    document.body.classList.add('modal-open');
  }

  function closeModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.dataset.state = 'closed';
    document.body.classList.remove('modal-open');
  }

  // ===== Tabs =====

  function setActiveTab(tabId, updateUrl) {
    state.activeTab = tabId;
    var panels = els.root.querySelectorAll('[data-settings-panel]');
    for (var i = 0; i < panels.length; i++) {
      panels[i].hidden =
        panels[i].getAttribute('data-settings-panel') !== tabId;
    }
    var tabs = els.root.querySelectorAll('.tab-btn');
    for (var j = 0; j < tabs.length; j++) {
      var link = tabs[j];
      var isActive = link.getAttribute('aria-controls') === 'panel-' + tabId;
      link.setAttribute('aria-selected', String(isActive));
      link.classList.toggle('tab-btn-active', isActive);
      link.classList.toggle('tab-btn-inactive', !isActive);
    }
    if (updateUrl) {
      var url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.pushState({ tab: tabId }, '', url.pathname + url.search);
    }
    window.scrollTo(0, 0);
  }

  function syncTabFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var requested = params.get('tab');
    if (
      requested &&
      els.root.querySelector('[data-settings-panel="' + requested + '"]')
    ) {
      setActiveTab(requested, false);
    } else {
      setActiveTab('profile', false);
    }
  }

  // ===== Appearance =====

  function systemTheme() {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyThemeMode(mode) {
    var resolved = mode === 'system' ? systemTheme() : mode;
    if (resolved !== 'light' && resolved !== 'dark') resolved = 'dark';
    document.documentElement.setAttribute('data-theme', resolved);
    if (window.__INITIAL_THEME__ !== undefined)
      window.__INITIAL_THEME__ = resolved;
  }

  function renderThemeMode() {
    var mode = readPreference(KEYS.themeMode, 'dark');
    applyThemeMode(mode);
    els.themeOptions.forEach(function (btn) {
      var isActive = btn.getAttribute('data-theme-option') === mode;
      btn.setAttribute('aria-checked', String(isActive));
      btn.classList.toggle('settings-theme-option-active', isActive);
    });
    if (els.darkHint) els.darkHint.hidden = mode === 'light';
  }

  function renderContrast() {
    var contrast = readPreference(KEYS.contrast, 'normal');
    if (contrast === 'high') {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
    els.contrastOptions.forEach(function (btn) {
      var isActive = btn.getAttribute('data-contrast-option') === contrast;
      btn.setAttribute('aria-checked', String(isActive));
      btn.classList.toggle('settings-contrast-card-active', isActive);
    });
  }

  // ===== Accessibility =====

  function ensureCvdFilter(type) {
    var filterId = 'cv-cvd-' + type;
    if (document.getElementById(filterId)) return filterId;
    var svg = document.querySelector('#cv-cvd-defs');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('id', 'cv-cvd-defs');
      svg.style.cssText =
        'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
      document.body.prepend(svg);
    }
    var filter = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'filter'
    );
    filter.setAttribute('id', filterId);
    var matrix = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'feColorMatrix'
    );
    matrix.setAttribute('type', 'matrix');
    matrix.setAttribute('values', CVD_MATRICES[type]);
    filter.appendChild(matrix);
    svg.appendChild(filter);
    return filterId;
  }

  function applyColorVision(preference) {
    if (preference === 'none' || !CVD_MATRICES[preference]) {
      document.documentElement.style.removeProperty('filter');
      return;
    }
    document.documentElement.style.filter =
      'url(#' + ensureCvdFilter(preference) + ')';
  }

  function applyReducedMotion(preference) {
    var root = document.documentElement;
    if (preference === 'reduce') {
      root.setAttribute('data-reduced-motion', 'reduce');
    } else if (preference === 'full') {
      root.setAttribute('data-reduced-motion', 'full');
    } else {
      root.removeAttribute('data-reduced-motion');
    }
  }

  function renderAccessibility() {
    var colorVision = readPreference(KEYS.colorVision, 'none');
    var motion = readPreference(KEYS.reducedMotion, 'system');

    els.colorVisionSelect.value = colorVision;
    applyColorVision(colorVision);
    if (els.visionBanner) {
      els.visionBanner.hidden = colorVision === 'none';
      if (colorVision !== 'none' && els.visionBannerText) {
        var labels = {
          deuteranopia: 'green-blind (Deuteranopia)',
          protanopia: 'red-blind (Protanopia)',
          tritanopia: 'blue-blind (Tritanopia)'
        };
        els.visionBannerText.textContent =
          'The interface is being shown with ' +
          (labels[colorVision] || colorVision) +
          ' colours.';
      }
    }

    els.motionSelect.value = motion;
    applyReducedMotion(motion);
    if (els.motionBanner) els.motionBanner.hidden = motion !== 'reduce';
    if (els.osPanel) els.osPanel.hidden = motion !== 'system';
  }

  // ===== Board =====

  function pieceUrl(setId, piece) {
    return '/piece/' + encodeURIComponent(setId) + '/' + piece + '.svg';
  }

  function renderBoardPreview() {
    var canvas = document.createElement('canvas');
    var size = 384;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var light = els.lightInput.value;
    var dark = els.darkInput.value;
    var square = size / 8;
    for (var row = 0; row < 8; row++) {
      for (var col = 0; col < 8; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? light : dark;
        ctx.fillRect(col * square, row * square, square, square);
      }
    }

    var pieces = [
      { rank: 7, file: 1, glyph: '\u2656' },
      { rank: 7, file: 3, glyph: '\u2657' },
      { rank: 7, file: 5, glyph: '\u2655' },
      { rank: 7, file: 7, glyph: '\u2656' },
      { rank: 6, file: 0, glyph: '\u265F' },
      { rank: 6, file: 2, glyph: '\u265F' },
      { rank: 6, file: 4, glyph: '\u265F' },
      { rank: 6, file: 6, glyph: '\u265F' },
      { rank: 1, file: 1, glyph: '\u265C' },
      { rank: 1, file: 3, glyph: '\u265E' },
      { rank: 1, file: 5, glyph: '\u265D' },
      { rank: 1, file: 7, glyph: '\u265C' },
      { rank: 0, file: 0, glyph: '\u265F' },
      { rank: 0, file: 2, glyph: '\u265F' },
      { rank: 0, file: 4, glyph: '\u265F' },
      { rank: 0, file: 6, glyph: '\u265F' }
    ];

    ctx.font = Math.floor(square * 0.72) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      ctx.fillStyle = p.rank >= 6 ? '#FFFFFF' : '#222222';
      ctx.fillText(
        p.glyph,
        (p.file + 0.5) * square,
        (7 - p.rank + 0.5) * square
      );
    }

    try {
      els.boardPreview.src = canvas.toDataURL('image/png');
    } catch (e) {}
  }

  function renderPieceGrid() {
    var sort = readPreference(KEYS.pieceSort, 'popular');
    els.pieceSortSelect.value = sort;
    var sets = PIECE_SETS.slice();
    if (sort === 'name') {
      sets.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    }
    var pieceStyle = readLocal(KEYS.pieceStyle, 'cburnett');
    els.pieceGrid.innerHTML = sets
      .map(function (set) {
        var isActive = set.id === pieceStyle;
        return (
          '<button type="button" class="settings-piece-tile' +
          (isActive ? ' settings-piece-tile-active' : '') +
          '" data-piece-set="' +
          set.id +
          '" aria-pressed="' +
          isActive +
          '">' +
          '<img src="' +
          pieceUrl(set.id, 'wN') +
          '" alt="" width="40" height="40" loading="lazy" />' +
          '<span class="settings-piece-tile-name">' +
          set.name +
          '</span>' +
          '</button>'
        );
      })
      .join('');
  }

  function renderBoardState() {
    var light = readLocal(KEYS.lightSquare, DEFAULT_LIGHT);
    var dark = readLocal(KEYS.darkSquare, DEFAULT_DARK);
    state.lightSquare = sanitizeHex(light, DEFAULT_LIGHT);
    state.darkSquare = sanitizeHex(dark, DEFAULT_DARK);
    els.lightInput.value = state.lightSquare;
    els.darkInput.value = state.darkSquare;

    els.presets.forEach(function (btn) {
      var isActive =
        btn.getAttribute('data-preset-light').toLowerCase() ===
          state.lightSquare.toLowerCase() &&
        btn.getAttribute('data-preset-dark').toLowerCase() ===
          state.darkSquare.toLowerCase();
      btn.classList.toggle('settings-theme-preset-active', isActive);
    });
    renderBoardPreview();
  }

  function setBoardColors(light, dark) {
    state.lightSquare = sanitizeHex(light, DEFAULT_LIGHT);
    state.darkSquare = sanitizeHex(dark, DEFAULT_DARK);
    writeLocal(KEYS.lightSquare, state.lightSquare);
    writeLocal(KEYS.darkSquare, state.darkSquare);
    els.lightInput.value = state.lightSquare;
    els.darkInput.value = state.darkSquare;
    renderBoardState();
  }

  // ===== Data management =====

  function bytesForKeys(keys) {
    var total = 0;
    for (var i = 0; i < keys.length; i++) {
      var value = readLocal(keys[i], null);
      if (value !== null) total += keys[i].length + value.length;
    }
    return total;
  }

  function allStorageKeys() {
    var keys = [];
    for (var i = 0; i < STORAGE_CATEGORIES.length; i++) {
      keys = keys.concat(STORAGE_CATEGORIES[i].keys);
    }
    return keys;
  }

  function renderStorageUsage() {
    var total = 0;
    for (var i = 0; i < STORAGE_CATEGORIES.length; i++) {
      var cat = STORAGE_CATEGORIES[i];
      var bytes = bytesForKeys(cat.keys);
      total += bytes;
      var el = els.root.querySelector('[data-storage-bytes="' + cat.id + '"]');
      var clearBtn = els.root.querySelector(
        '[data-clear-category="' + cat.id + '"]'
      );
      if (el) el.textContent = formatBytes(bytes);
      if (clearBtn) clearBtn.disabled = bytes === 0;
    }
    els.totalBytes.textContent = formatBytes(total);
  }

  function exportData() {
    var data = {};
    var keys = allStorageKeys();
    for (var i = 0; i < keys.length; i++) {
      var value = readLocal(keys[i], null);
      if (value !== null) data[keys[i]] = value;
    }
    downloadText(
      'chessviewer-data.json',
      JSON.stringify(data, null, 2),
      'application/json'
    );
    showDataMessage('Data exported');
  }

  function importFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var text = String(reader.result || '');
      var data = safeJSONParse(text, null);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        notifyError('Invalid backup file format.');
        return;
      }
      var keys = allStorageKeys();
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
        var raw = data[key];
        if (typeof raw !== 'string' || raw.length > 1000000) continue;
        var reparsed = safeJSONParse(raw, null);
        var safeValue = reparsed === null ? raw : JSON.stringify(reparsed);
        writeLocal(key, safeValue);
      }
      renderStorageUsage();
      showDataMessage('Data imported. Refresh the page to see all changes.');
      els.importFile.value = '';
    };
    reader.readAsText(file);
  }

  function confirmDestructive() {
    return readPreference(KEYS.confirmDestructive, true) !== false;
  }

  function askConfirm(title, message, action, modal) {
    if (!confirmDestructive()) {
      action();
      return;
    }
    var target = modal || document.getElementById('data-confirm-modal');
    if (!target) {
      action();
      return;
    }
    state.confirmAction = action;
    var msgEl = target.querySelector('[data-data-confirm-message]');
    var titleEl = target.querySelector('h3');
    if (msgEl) msgEl.textContent = message;
    if (titleEl) titleEl.textContent = title;
    openModal(target.id);
  }

  function runConfirmAction() {
    if (!state.confirmAction) return;
    var action = state.confirmAction;
    state.confirmAction = null;
    closeModal('data-confirm-modal');
    action();
  }

  function cancelConfirm() {
    state.confirmAction = null;
    closeModal('data-confirm-modal');
  }

  function clearCategory(cat) {
    for (var i = 0; i < cat.keys.length; i++) {
      removeLocal(cat.keys[i]);
    }
    renderStorageUsage();
    showDataMessage(cat.label + ' cleared. Refresh the page to see changes.');
  }

  function clearFenHistory() {
    var keys = [
      'fen-history',
      'fen-archive',
      'favoriteFens',
      'fen-history-skip-delete-confirm'
    ];
    for (var i = 0; i < keys.length; i++) {
      removeLocal(keys[i]);
    }
    renderStorageUsage();
    showDataMessage('FEN history cleared.');
  }

  function resetAllData() {
    var keys = allStorageKeys();
    for (var i = 0; i < keys.length; i++) {
      removeLocal(keys[i]);
    }
    renderStorageUsage();
    showDataMessage('Data reset. Refresh the page to start clean.');
  }

  function showDataMessage(message) {
    if (!els.settingsMessage) return;
    els.settingsMessage.hidden = false;
    els.settingsMessageText.textContent = message;
    window.setTimeout(function () {
      els.settingsMessage.hidden = true;
    }, 4000);
  }

  // ===== Account / identity =====

  function readGuestProfile() {
    var raw = readLocal(GUEST_PROFILE_KEY, null);
    if (!raw) return { displayName: 'User', supporterUntil: null };
    var parsed = safeJSONParse(raw, {});
    return {
      displayName:
        typeof parsed.displayName === 'string' ? parsed.displayName : 'User',
      supporterUntil:
        typeof parsed.supporterUntil === 'string' ? parsed.supporterUntil : null
    };
  }

  function membershipLabel() {
    var until = state.profile && state.profile.supporterUntil;
    if (until) {
      var t = Date.parse(until);
      if (!Number.isNaN(t) && t > Date.now()) return 'Gold Supporter';
    }
    return 'Free';
  }

  function displayName() {
    if (state.session) {
      return (state.profile && state.profile.displayName) || 'ChessViewer user';
    }
    var guest = readGuestProfile();
    return guest.displayName || 'Local user';
  }

  function renderIdentity() {
    var signedIn = !!state.session;
    var name = displayName();
    var email = state.user && state.user.email ? state.user.email : null;
    var initial = name ? name.charAt(0).toUpperCase() : '?';

    els.avatarInitial.textContent = initial;
    els.identityName.textContent = name;

    if (signedIn) {
      els.identityBadge.hidden = true;
      if (email) {
        els.identityEmail.textContent = email;
        els.identityEmail.hidden = false;
      } else {
        els.identityEmail.hidden = true;
      }
      els.emailCard.hidden = false;
      if (els.emailInput && email) els.emailInput.value = email;

      var provider = null;
      var identities = state.user && state.user.identities;
      if (Array.isArray(identities) && identities.length > 0) {
        provider = identities[0].provider || null;
      }
      var createdAt = formatDateTime(state.user && state.user.created_at);
      var lastSignIn = formatDateTime(state.user && state.user.last_sign_in_at);

      els.rowProvider.hidden = !provider;
      if (els.providerValue) els.providerValue.textContent = provider || '';

      els.rowCreated.hidden = !createdAt;
      if (els.createdValue) els.createdValue.textContent = createdAt || '';

      els.rowLast.hidden = !lastSignIn;
      if (els.lastValue) els.lastValue.textContent = lastSignIn || '';

      var userId =
        state.user && state.user.id ? state.user.id : 'Local Account';
      els.userIdValue.textContent = userId;
      els.supportIdValue.textContent = userId.slice(0, 8).toUpperCase();

      els.membershipTier.textContent = membershipLabel();
      els.cloudCta.hidden = true;
      els.accountActions.hidden = false;
    } else {
      els.identityBadge.hidden = false;
      els.identityEmail.hidden = true;
      els.emailCard.hidden = true;
      els.rowProvider.hidden = true;
      els.rowCreated.hidden = true;
      els.rowLast.hidden = true;
      els.userIdValue.textContent = 'Local Account';
      els.supportIdValue.textContent = 'Not Applicable';
      els.membershipTier.textContent = 'Free';
      els.cloudCta.hidden = false;
      els.accountActions.hidden = true;
    }

    var authTabs = els.root.querySelectorAll('[data-auth-tab]');
    for (var i = 0; i < authTabs.length; i++) {
      authTabs[i].hidden = !signedIn;
    }

    renderSecurityContent();
  }

  function renderSecurityContent() {
    var signedIn = !!state.session;
    if (els.securitySignedOut) els.securitySignedOut.hidden = signedIn;
    if (els.securitySignedIn) els.securitySignedIn.hidden = !signedIn;
    if (!signedIn) return;

    if (state.user && state.user.last_sign_in_at) {
      els.lastSignin.textContent =
        formatDateTime(state.user.last_sign_in_at) || 'Unknown';
    }

    renderMfa();
    renderActivity();
  }

  // ===== MFA =====

  function verifiedFactor(factors) {
    if (!Array.isArray(factors)) return null;
    for (var i = 0; i < factors.length; i++) {
      if (
        factors[i].factor_type === 'totp' &&
        factors[i].status === 'verified'
      ) {
        return factors[i];
      }
    }
    return null;
  }

  function renderMfa() {
    if (!els.mfaPanel) return;
    var loading = state.mfaStatus === 'loading';
    var setup = state.mfaStatus === 'setup';
    var enroll = state.mfaStatus === 'enroll';
    var enabled = state.mfaStatus === 'enabled';

    if (els.mfaLoading) els.mfaLoading.hidden = !loading;
    if (els.mfaSetup) els.mfaSetup.hidden = !setup;
    if (els.mfaEnroll) els.mfaEnroll.hidden = !enroll;
    if (els.mfaEnabledPanel) els.mfaEnabledPanel.hidden = !enabled;

    if (els.mfaStatusEl) {
      els.mfaStatusEl.textContent = loading
        ? 'Checking…'
        : enabled
          ? 'Enabled'
          : 'Not enabled';
    }
    if (els.mfaStatusIcon) {
      els.mfaStatusIcon.innerHTML = enabled ? shieldCheckSvg() : shieldXSvg();
    }
  }

  function shieldCheckSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-overview-icon-svg settings-mfa-enabled-icon">' +
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>' +
      '<path d="m9 12 2 2 4-4"/>' +
      '</svg>'
    );
  }

  function shieldXSvg() {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-overview-icon-svg">' +
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>' +
      '<path d="m14.5 9.5-5 5"/>' +
      '<path d="m9.5 9.5 5 5"/>' +
      '</svg>'
    );
  }

  function refreshMfaStatus() {
    if (!state.session) return;
    state.mfaStatus = 'loading';
    renderMfa();
    sb.mfaList().then(function (res) {
      if (res.error) {
        state.mfaStatus = 'setup';
        renderMfa();
        return;
      }
      var factors = Array.isArray(res.data) ? res.data : [];
      state.mfaStatus = verifiedFactor(factors) ? 'enabled' : 'setup';
      renderMfa();
    });
  }

  function startMfaEnrollment() {
    if (state.isSubmitting) return;
    state.isSubmitting = true;
    setMfaError('');
    var email = state.user && state.user.email;
    var uniqueId = Math.random().toString(36).substring(2, 8);
    var friendlyName = email
      ? email + ' (' + uniqueId + ')'
      : 'ChessViewer Auth (' + uniqueId + ')';

    sb.mfaEnroll(friendlyName)
      .then(function (res) {
        if (res.error) {
          var message = res.error.message || 'Failed to start setup.';
          if (
            /422|disabled/i.test(String(message)) &&
            !/email/i.test(message)
          ) {
            message =
              '2FA setup failed. Please ensure MFA/TOTP is enabled in your Supabase project settings.';
          }
          setMfaError(message);
          return;
        }
        var data = res.data;
        if (!data || !data.totp) {
          setMfaError('Failed to start setup.');
          return;
        }
        state.mfaStatus = 'enroll';
        state.enrollFactorId = data.id;
        if (els.mfaEnrollStep)
          els.mfaEnrollStep.textContent =
            'Scan this code with your authenticator app';
        if (els.mfaQr) {
          if (data.totp.qr_code) {
            els.mfaQr.hidden = false;
            els.mfaQr.innerHTML =
              '<img src="' +
              data.totp.qr_code +
              '" alt="QR code" width="176" height="176" />';
          } else {
            els.mfaQr.hidden = true;
            els.mfaQr.innerHTML = '';
          }
        }
        if (els.mfaSecretValue)
          els.mfaSecretValue.textContent = data.totp.secret || '';
        if (els.mfaSecret) els.mfaSecret.hidden = false;
        if (els.mfaVerifyRow) els.mfaVerifyRow.hidden = false;
        if (els.mfaVerifyCode) els.mfaVerifyCode.value = '';
        state.backupCodes = [];
        renderMfa();
      })
      .finally(function () {
        state.isSubmitting = false;
      });
  }

  function verifyMfaEnrollment() {
    if (state.isSubmitting) return;
    var code = (els.mfaVerifyCode && els.mfaVerifyCode.value.trim()) || '';
    if (code.length < 6) {
      setMfaError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    state.isSubmitting = true;
    setMfaError('');

    sb.mfaChallenge(state.enrollFactorId)
      .then(function (challengeRes) {
        if (challengeRes.error || !challengeRes.data) {
          throw new Error(
            (challengeRes.error && challengeRes.error.message) ||
              'Challenge failed.'
          );
        }
        return sb
          .mfaVerify(state.enrollFactorId, challengeRes.data.id, code)
          .then(function (verifyRes) {
            if (verifyRes.error) {
              throw new Error('Invalid verification code.');
            }
            return sb.rpc('generate_recovery_codes', {});
          });
      })
      .then(function (codesRes) {
        state.backupCodes = Array.isArray(codesRes.data) ? codesRes.data : [];
        if (els.mfaVerifyRow) els.mfaVerifyRow.hidden = true;
        if (els.mfaBackup) els.mfaBackup.hidden = false;
        if (els.mfaBackupCodes) {
          els.mfaBackupCodes.innerHTML = state.backupCodes
            .map(function (code) {
              return (
                '<button type="button" class="settings-mfa-backup-code" data-mfa-backup-code="' +
                code +
                '">' +
                code +
                '</button>'
              );
            })
            .join('');
        }
        if (els.mfaEnrollStep)
          els.mfaEnrollStep.textContent = 'Backup codes — save them now';
      })
      .catch(function (err) {
        setMfaError(
          err instanceof Error ? err.message : 'Verification failed.'
        );
      })
      .finally(function () {
        state.isSubmitting = false;
      });
  }

  function disableMfa() {
    if (state.isSubmitting) return;
    var factor = state.mfaFactor;
    if (!factor) return;
    state.isSubmitting = true;
    setMfaError('');

    sb.mfaUnenroll(factor.id)
      .then(function (res) {
        if (res.error) {
          setMfaError(
            (res.error && res.error.message) || 'Failed to disable 2FA.'
          );
          return;
        }
        state.mfaFactor = null;
        state.backupCodes = [];
        refreshMfaStatus();
      })
      .finally(function () {
        state.isSubmitting = false;
      });
  }

  function setMfaError(message) {
    state.mfaError = message;
    if (els.mfaError) {
      if (message) {
        els.mfaError.textContent = message;
        els.mfaError.hidden = false;
      } else {
        els.mfaError.hidden = true;
        els.mfaError.textContent = '';
      }
    }
  }

  // ===== Security extras =====

  function changePassword() {
    var password = els.newPassword.value;
    var confirm = els.confirmPassword.value;
    var valid =
      password.length >= 8 && password.length <= 128 && password === confirm;
    if (els.passwordError) {
      els.passwordError.hidden = !(confirm.length > 0 && password !== confirm);
    }
    els.changePasswordBtn.disabled = !valid;
    if (!valid) return;

    state.isSubmitting = true;
    setChangePasswordLabel('Updating…');
    sb.updateUser({ password: password })
      .then(function (res) {
        if (res.error) {
          notifyError(
            'We could not update your password. You may need to re-authenticate, then try again.'
          );
          return;
        }
        els.newPassword.value = '';
        els.confirmPassword.value = '';
        els.changePasswordBtn.disabled = true;
        els.emailResetBtn.disabled = true;
        notifyInfo('Password updated. Use it the next time you sign in.');
        renderActivity();
      })
      .finally(function () {
        state.isSubmitting = false;
        setChangePasswordLabel('Update Password');
      });
  }

  function setChangePasswordLabel(text) {
    if (els.changePasswordLabel) els.changePasswordLabel.textContent = text;
  }

  function sendPasswordReset() {
    if (state.isSubmitting || !state.user || !state.user.email) return;
    state.isSubmitting = true;
    setEmailResetLabel('Sending…');
    sb.resetPasswordForEmail(state.user.email)
      .then(function (res) {
        if (!res.error) {
          notifyInfo(
            'We sent a password reset link to ' + state.user.email + '.'
          );
        }
      })
      .finally(function () {
        state.isSubmitting = false;
        setEmailResetLabel('Email a reset link');
      });
  }

  function setEmailResetLabel(text) {
    if (els.emailResetLabel) els.emailResetLabel.textContent = text;
  }

  function signOutEverywhere() {
    askConfirm(
      'Sign out everywhere',
      'This signs you out on every device and browser where you are logged in. You will need to sign in again. Continue?',
      function () {
        sb.signOut('global').then(function () {
          window.location.href = '/';
        });
      }
    );
  }

  function renderActivity() {
    if (!els.activityList || !state.session) return;
    els.activityList.innerHTML =
      '<p class="text-xs text-text-muted">Loading activity…</p>';
    sb.securityEvents(5).then(function (res) {
      if (res.error) {
        els.activityList.innerHTML =
          '<p class="text-xs text-text-muted">No recent activity to show.</p>';
        return;
      }
      var rows = Array.isArray(res.data) ? res.data : [];
      if (rows.length === 0) {
        els.activityList.innerHTML =
          '<p class="text-xs text-text-muted">No recent activity to show.</p>';
        return;
      }
      els.activityList.innerHTML = rows
        .map(function (row) {
          var label = EVENT_LABELS[row.event_type] || row.event_type || 'Event';
          var time = formatEventTime(row.created_at);
          return (
            '<div class="settings-activity-row">' +
            '<span class="settings-activity-label">' +
            label +
            '</span>' +
            '<span class="settings-activity-time">' +
            time +
            '</span>' +
            '</div>'
          );
        })
        .join('');
    });
  }

  // ===== Delete account =====

  function deleteAccount() {
    if (!state.user || !state.user.email) return;
    var password = els.deletePassword.value;
    var mfaCode = els.deleteMfa.value;
    if (els.deleteError) els.deleteError.hidden = true;

    sb.signInWithPassword(state.user.email, password)
      .then(function (res) {
        if (res.error) {
          throw new Error('Invalid password. Please try again.');
        }
        if (state.mfaFactor) {
          return sb
            .mfaChallenge(state.mfaFactor.id)
            .then(function (challengeRes) {
              if (challengeRes.error || !challengeRes.data) {
                throw new Error('Challenge failed.');
              }
              return sb
                .mfaVerify(state.mfaFactor.id, challengeRes.data.id, mfaCode)
                .then(function (verifyRes) {
                  if (verifyRes.error) {
                    throw new Error('Invalid MFA code.');
                  }
                });
            });
        }
        return null;
      })
      .then(function () {
        return sb.rpc('delete_own_account', {});
      })
      .then(function (res) {
        if (res.error) throw new Error('Deletion failed.');
        localStorage.clear();
        window.location.href = '/';
      })
      .catch(function (err) {
        if (els.deleteError) {
          els.deleteError.textContent =
            err instanceof Error ? err.message : 'Deletion failed.';
          els.deleteError.hidden = false;
        }
      });
  }

  // ===== Auth init =====

  function loadProfile() {
    var userId = state.user && state.user.id;
    if (!userId) return Promise.resolve();
    return sb.profileGet(userId).then(function (res) {
      if (res.error) return;
      var rows = Array.isArray(res.data) ? res.data : [];
      if (rows.length > 0 && rows[0]) {
        state.profile = {
          displayName: rows[0].display_name || 'ChessViewer user',
          supporterUntil: rows[0].supporter_until || null
        };
      } else {
        state.profile = {
          displayName: 'ChessViewer user',
          supporterUntil: null
        };
        sb.profileUpsert(userId, state.profile.displayName);
      }
    });
  }

  function initAuthState() {
    var session = sb.getSession();
    if (!session) {
      state.session = null;
      renderIdentity();
      return;
    }
    state.session = session;
    sb.getUser().then(function (res) {
      if (res.error) {
        state.session = null;
        renderIdentity();
        return;
      }
      state.user = res.data;
      var factors = Array.isArray(res.data.factors) ? res.data.factors : [];
      state.mfaFactor = verifiedFactor(factors);
      return loadProfile().then(function () {
        renderIdentity();
        refreshMfaStatus();
      });
    });
  }

  function saveDisplayName() {
    var name = els.identityInput.value.trim().slice(0, 60);
    if (!name) return;
    var current = displayName();
    if (name === current) {
      els.identityEdit.hidden = true;
      els.identityView.hidden = false;
      return;
    }
    els.identitySave.disabled = true;
    setIdentityError('');

    if (!state.session) {
      var guest = readGuestProfile();
      guest.displayName = name;
      writeLocal(GUEST_PROFILE_KEY, JSON.stringify(guest));
      renderIdentity();
      els.identityEdit.hidden = true;
      els.identityView.hidden = false;
      els.identitySave.disabled = false;
      return;
    }

    var userId = state.user.id;
    sb.profileUpsert(userId, name).then(function (res) {
      if (res.error) {
        setIdentityError('Failed to save. Please try again.');
        els.identitySave.disabled = false;
        return;
      }
      if (state.profile) state.profile.displayName = name;
      renderIdentity();
      els.identityEdit.hidden = true;
      els.identityView.hidden = false;
    });
  }

  function updateEmail() {
    var next = els.emailInput.value.trim().slice(0, 320);
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next);
    var current = state.user && state.user.email ? state.user.email : '';
    if (!valid || next.toLowerCase() === current.toLowerCase()) return;
    state.isSubmitting = true;
    els.emailSave.disabled = true;
    setEmailSaveLabel('Sending…');

    sb.updateUser({ email: next })
      .then(function (res) {
        if (res.error) {
          notifyError(
            'Something went wrong updating your email. Please try again in a moment.'
          );
          els.emailInput.value = current;
          return;
        }
        notifyInfo(
          'We sent a confirmation link to ' +
            next +
            '. Your email changes once you click that link.'
        );
      })
      .finally(function () {
        state.isSubmitting = false;
        els.emailSave.disabled = false;
        setEmailSaveLabel('Update Email');
      });
  }

  function setEmailSaveLabel(text) {
    if (els.emailSaveLabel) els.emailSaveLabel.textContent = text;
  }

  function setIdentityError(message) {
    if (els.identityError) {
      if (message) {
        els.identityError.textContent = message;
        els.identityError.hidden = false;
      } else {
        els.identityError.hidden = true;
        els.identityError.textContent = '';
      }
    }
  }

  // ===== Preferences switches =====

  function renderPreferences() {
    var confirmDestructive =
      readPreference(KEYS.confirmDestructive, true) !== false;
    var hideSensitive = readPreference(KEYS.hideSensitive, false) === true;
    if (els.confirmDestructiveSwitch)
      els.confirmDestructiveSwitch.checked = confirmDestructive;
    if (els.hideSensitiveSwitch)
      els.hideSensitiveSwitch.checked = hideSensitive;
  }

  // ===== Event wiring =====

  function initEvents() {
    els.root.addEventListener('click', function (e) {
      var target = e.target;
      var link = target.closest ? target.closest('.tab-btn') : null;
      if (link && !link.hidden && link.getAttribute('aria-controls')) {
        e.preventDefault();
        setActiveTab(
          link.getAttribute('aria-controls').replace('panel-', ''),
          true
        );
        return;
      }

      var themeBtn = target.closest
        ? target.closest('[data-theme-option]')
        : null;
      if (themeBtn) {
        var mode = themeBtn.getAttribute('data-theme-option');
        writePreference(KEYS.themeMode, mode);
        renderThemeMode();
        return;
      }

      var contrastBtn = target.closest
        ? target.closest('[data-contrast-option]')
        : null;
      if (contrastBtn) {
        writePreference(
          KEYS.contrast,
          contrastBtn.getAttribute('data-contrast-option')
        );
        renderContrast();
        return;
      }

      var preset = target.closest
        ? target.closest('[data-preset-light]')
        : null;
      if (preset) {
        setBoardColors(
          preset.getAttribute('data-preset-light'),
          preset.getAttribute('data-preset-dark')
        );
        return;
      }

      var pieceBtn = target.closest ? target.closest('[data-piece-set]') : null;
      if (pieceBtn) {
        var setId = pieceBtn.getAttribute('data-piece-set');
        writeLocal(KEYS.pieceStyle, setId);
        renderPieceGrid();
        return;
      }

      var copyBtn = target.closest ? target.closest('[data-copy]') : null;
      if (copyBtn) {
        var copyKey = copyBtn.getAttribute('data-copy');
        if (copyKey === 'userId' && els.userIdValue) {
          copyText(els.userIdValue.textContent);
        } else if (copyKey === 'supportId' && els.supportIdValue) {
          copyText(els.supportIdValue.textContent);
        }
        return;
      }

      var secretCopy = target.closest
        ? target.closest('[data-mfa-secret-copy]')
        : null;
      if (secretCopy) {
        copyText(els.mfaSecretValue ? els.mfaSecretValue.textContent : '');
        return;
      }

      var backupCode = target.closest
        ? target.closest('[data-mfa-backup-code]')
        : null;
      if (backupCode) {
        copyText(backupCode.getAttribute('data-mfa-backup-code'));
        return;
      }

      if (e.target.closest('[data-mfa-copy-codes]')) {
        copyText(state.backupCodes.join('\n'));
        return;
      }
      if (e.target.closest('[data-mfa-download-codes]')) {
        downloadText(
          'chessviewer-backup-codes.txt',
          'ChessViewer 2FA Backup Codes\nGenerated on: ' +
            new Date().toLocaleDateString() +
            '\n\nKeep these codes safe! Each code can only be used once.\n\n' +
            state.backupCodes.join('\n'),
          'text/plain'
        );
        return;
      }
      if (e.target.closest('[data-mfa-done]')) {
        state.backupCodes = [];
        refreshMfaStatus();
        return;
      }
      if (e.target.closest('[data-mfa-enable]')) {
        startMfaEnrollment();
        return;
      }
      if (e.target.closest('[data-mfa-disable]')) {
        disableMfa();
        return;
      }
      if (e.target.closest('[data-mfa-verify]')) {
        verifyMfaEnrollment();
        return;
      }

      if (e.target.closest('[data-identity-edit-toggle]')) {
        els.identityInput.value = displayName();
        setIdentityError('');
        els.identityView.hidden = true;
        els.identityEdit.hidden = false;
        els.identitySave.disabled = true;
        window.setTimeout(function () {
          els.identityInput.focus();
        }, 0);
        return;
      }
      if (e.target.closest('[data-identity-save]')) {
        saveDisplayName();
        return;
      }
      if (e.target.closest('[data-identity-cancel]')) {
        els.identityEdit.hidden = true;
        els.identityView.hidden = false;
        return;
      }
      if (e.target.closest('[data-email-save]')) {
        updateEmail();
        return;
      }

      if (e.target.closest('[data-delete-account]')) {
        els.deleteIntro.textContent =
          'This is your last chance. Deleting your account will permanently remove all your saved boards, history, and preferences from the cloud.';
        els.deletePassword.value = '';
        els.deleteMfa.value = '';
        if (els.deleteError) els.deleteError.hidden = true;
        if (els.deleteProgress) els.deleteProgress.hidden = true;
        els.deleteMfaWrap.hidden = !state.mfaFactor;
        openModal('delete-account-modal');
        return;
      }

      var clearCat = target.closest
        ? target.closest('[data-clear-category]')
        : null;
      if (clearCat) {
        var catId = clearCat.getAttribute('data-clear-category');
        for (var i = 0; i < STORAGE_CATEGORIES.length; i++) {
          if (STORAGE_CATEGORIES[i].id === catId) {
            var cat = STORAGE_CATEGORIES[i];
            askConfirm(
              'Clear ' + cat.label,
              'Remove all "' +
                cat.label +
                '" data from this browser? This cannot be undone.',
              function () {
                clearCategory(cat);
              }
            );
            break;
          }
        }
        return;
      }

      var dataAction = target.closest
        ? target.closest('[data-data-action]')
        : null;
      if (dataAction) {
        var action = dataAction.getAttribute('data-data-action');
        if (action === 'export') {
          exportData();
        } else if (action === 'import') {
          els.importFile.click();
        } else if (action === 'clear-history') {
          askConfirm(
            'Clear FEN History',
            'Delete all FEN history and archived positions from this browser? This cannot be undone.',
            clearFenHistory
          );
        } else if (action === 'reset') {
          askConfirm(
            'Reset Data',
            'Reset saved app data on this browser? This will delete all settings and history.',
            resetAllData
          );
        }
        return;
      }

      if (e.target.closest('[data-signout-everywhere]')) {
        signOutEverywhere();
        return;
      }

      if (e.target.closest('[data-change-password]')) {
        changePassword();
        return;
      }
      if (e.target.closest('[data-email-reset]')) {
        sendPasswordReset();
        return;
      }

      if (
        e.target.closest('[data-modal-cancel]') ||
        e.target.closest('[data-modal-close]')
      ) {
        if (e.target.closest('#delete-account-modal')) {
          closeModal('delete-account-modal');
        } else {
          cancelConfirm();
        }
        return;
      }
      if (e.target.closest('[data-modal-confirm]')) {
        if (e.target.closest('#delete-account-modal')) {
          els.deleteProgress.hidden = false;
          deleteAccount();
        } else {
          runConfirmAction();
        }
        return;
      }
      if (target.hasAttribute && target.hasAttribute('data-backdrop-close')) {
        if (target.id === 'delete-account-modal') {
          closeModal('delete-account-modal');
        } else {
          cancelConfirm();
        }
        return;
      }
    });

    els.root.addEventListener('input', function (e) {
      var input = e.target;
      if (input.hasAttribute && input.hasAttribute('data-color-input')) {
        var which = input.getAttribute('data-color-input');
        if (which === 'light') {
          setBoardColors(input.value, els.darkInput.value);
        } else {
          setBoardColors(els.lightInput.value, input.value);
        }
        return;
      }
      if (input.hasAttribute && input.hasAttribute('data-identity-input')) {
        var trimmed = input.value.trim();
        els.identitySave.disabled = !trimmed || trimmed === displayName();
        return;
      }
      if (input.hasAttribute && input.hasAttribute('data-email-input')) {
        var email = input.value.trim();
        var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        var currentEmail =
          state.user && state.user.email ? state.user.email : '';
        els.emailSave.disabled =
          !validEmail || email.toLowerCase() === currentEmail.toLowerCase();
        return;
      }
      if (input.hasAttribute && input.hasAttribute('data-new-password')) {
        updatePasswordButton();
        return;
      }
      if (input.hasAttribute && input.hasAttribute('data-confirm-password')) {
        updatePasswordButton();
        if (els.passwordError) {
          els.passwordError.hidden = !(
            input.value.length > 0 && input.value !== els.newPassword.value
          );
        }
        return;
      }
      if (input.hasAttribute && input.hasAttribute('data-delete-password')) {
        els.deletePassword.value = input.value;
        return;
      }
      if (input.hasAttribute && input.hasAttribute('data-delete-mfa')) {
        els.deleteMfa.value = input.value;
        return;
      }
      if (input.hasAttribute && input.hasAttribute('data-mfa-verify-code')) {
        els.mfaVerifyCode.value = input.value;
        return;
      }
    });

    els.root.addEventListener('change', function (e) {
      var input = e.target;
      if (input.hasAttribute && input.hasAttribute('data-select')) {
        var selectKey = input.getAttribute('data-select');
        var value = input.value;
        if (selectKey === 'colorVision') {
          writePreference(KEYS.colorVision, value);
          renderAccessibility();
        } else if (selectKey === 'motion') {
          writePreference(KEYS.reducedMotion, value);
          renderAccessibility();
        } else if (selectKey === 'pieceSort') {
          writePreference(KEYS.pieceSort, value);
          renderPieceGrid();
        }
        return;
      }
      if (input.hasAttribute && input.hasAttribute('data-switch')) {
        var switchKey = input.getAttribute('data-switch');
        writePreference(
          switchKey === 'confirmDestructive'
            ? KEYS.confirmDestructive
            : KEYS.hideSensitive,
          input.checked
        );
        return;
      }
    });

    els.importFile.addEventListener('change', function () {
      var file = els.importFile.files && els.importFile.files[0];
      importFile(file);
    });
  }

  function updatePasswordButton() {
    var password = els.newPassword.value;
    var confirm = els.confirmPassword.value;
    els.changePasswordBtn.disabled = !(
      password.length >= 8 && password === confirm
    );
  }

  // ===== Init =====

  function init() {
    els.root = document.querySelector('[data-settings-root]');
    if (!els.root) return;

    var supabaseUrl = els.root.getAttribute('data-supabase-url') || '';
    var anonKey = els.root.getAttribute('data-supabase-anon-key') || '';
    sb.setConfig(supabaseUrl, anonKey);

    // Tabs
    els.themeOptions = els.root.querySelectorAll('[data-theme-option]');
    els.darkHint = els.root.querySelector('[data-dark-hint]');
    els.contrastOptions = els.root.querySelectorAll('[data-contrast-option]');

    // Accessibility
    els.colorVisionSelect = els.root.querySelector(
      '[data-select="colorVision"]'
    );
    els.motionSelect = els.root.querySelector('[data-select="motion"]');
    els.visionBanner = els.root.querySelector('[data-vision-banner]');
    els.visionBannerText = els.root.querySelector('[data-vision-banner-text]');
    els.motionBanner = els.root.querySelector('[data-motion-banner]');
    els.osPanel = els.root.querySelector('[data-os-panel]');

    // Board
    els.boardPreview = els.root.querySelector('[data-board-preview]');
    els.presets = els.root.querySelectorAll('[data-preset-light]');
    els.lightInput = els.root.querySelector('[data-color-input="light"]');
    els.darkInput = els.root.querySelector('[data-color-input="dark"]');
    els.pieceSortSelect = els.root.querySelector('[data-select="pieceSort"]');
    els.pieceGrid = els.root.querySelector('[data-piece-grid]');

    // Data
    els.totalBytes = els.root.querySelector('[data-total-bytes]');
    els.importFile = els.root.querySelector('[data-import-file]');
    els.settingsMessage = els.root.querySelector('[data-settings-message]');
    els.settingsMessageText = els.root.querySelector(
      '[data-settings-message-text]'
    );

    // Identity
    els.avatarInitial = els.root.querySelector('[data-avatar-initial]');
    els.identityName = els.root.querySelector('[data-identity-name]');
    els.identityEmail = els.root.querySelector('[data-identity-email]');
    els.identityBadge = els.root.querySelector('[data-identity-badge]');
    els.identityView = els.root.querySelector('[data-identity-view]');
    els.identityEdit = els.root.querySelector('[data-identity-edit]');
    els.identityInput = els.root.querySelector('[data-identity-input]');
    els.identitySave = els.root.querySelector('[data-identity-save]');
    els.identityCancel = els.root.querySelector('[data-identity-cancel]');
    els.identityError = els.root.querySelector('[data-identity-error]');
    els.emailCard = els.root.querySelector('[data-email-card]');
    els.emailInput = els.root.querySelector('[data-email-input]');
    els.emailSave = els.root.querySelector('[data-email-save]');
    els.emailSaveLabel = els.root.querySelector('[data-email-save-label]');
    els.membershipTier = els.root.querySelector('[data-membership-tier]');
    els.rowProvider = els.root.querySelector('[data-row-provider]');
    els.providerValue = els.root.querySelector('[data-provider-value]');
    els.rowCreated = els.root.querySelector('[data-row-created]');
    els.createdValue = els.root.querySelector('[data-created-value]');
    els.rowLast = els.root.querySelector('[data-row-last]');
    els.lastValue = els.root.querySelector('[data-last-value]');
    els.userIdValue = els.root.querySelector(
      '[data-copy="userId"]'
    ).previousElementSibling;
    els.supportIdValue = els.root.querySelector(
      '[data-copy="supportId"]'
    ).previousElementSibling;
    els.cloudCta = els.root.querySelector('[data-cloud-cta]');
    els.accountActions = els.root.querySelector('[data-account-actions]');
    els.deleteIntro = els.root.querySelector('[data-delete-intro]');
    els.deletePassword = els.root.querySelector('[data-delete-password]');
    els.deleteMfa = els.root.querySelector('[data-delete-mfa]');
    els.deleteMfaWrap = els.root.querySelector('[data-delete-mfa-wrap]');
    els.deleteError = els.root.querySelector('[data-delete-error]');
    els.deleteProgress = els.root.querySelector('[data-delete-progress]');

    // Security
    els.securitySignedOut = els.root.querySelector(
      '[data-security-signed-out]'
    );
    els.securitySignedIn = els.root.querySelector('[data-security-signed-in]');
    els.mfaStatusEl = els.root.querySelector('[data-mfa-status]');
    els.mfaStatusIcon = els.root.querySelector('[data-mfa-status-icon]');
    els.lastSignin = els.root.querySelector('[data-last-signin]');
    els.mfaPanel = els.root.querySelector('[data-mfa-panel]');
    els.mfaLoading = els.root.querySelector('[data-mfa-loading]');
    els.mfaSetup = els.root.querySelector('[data-mfa-setup]');
    els.mfaEnroll = els.root.querySelector('[data-mfa-enroll]');
    els.mfaEnrollStep = els.root.querySelector('[data-mfa-enroll-step]');
    els.mfaQr = els.root.querySelector('[data-mfa-qr]');
    els.mfaSecret = els.root.querySelector('[data-mfa-secret]');
    els.mfaSecretValue = els.root.querySelector('[data-mfa-secret-value]');
    els.mfaVerifyRow = els.root.querySelector('[data-mfa-verify-row]');
    els.mfaVerifyCode = els.root.querySelector('[data-mfa-verify-code]');
    els.mfaBackup = els.root.querySelector('[data-mfa-backup]');
    els.mfaBackupCodes = els.root.querySelector('[data-mfa-backup-codes]');
    els.mfaError = els.root.querySelector('[data-mfa-error]');
    els.mfaEnabledPanel = els.root.querySelector('[data-mfa-enabled]');
    els.newPassword = els.root.querySelector('[data-new-password]');
    els.confirmPassword = els.root.querySelector('[data-confirm-password]');
    els.passwordError = els.root.querySelector('[data-password-error]');
    els.changePasswordBtn = els.root.querySelector('[data-change-password]');
    els.changePasswordLabel = els.root.querySelector(
      '[data-change-password-label]'
    );
    els.emailResetBtn = els.root.querySelector('[data-email-reset]');
    els.emailResetLabel = els.root.querySelector('[data-email-reset-label]');
    els.activityList = els.root.querySelector('[data-activity-list]');
    els.confirmDestructiveSwitch = els.root.querySelector(
      '[data-switch="confirmDestructive"]'
    );
    els.hideSensitiveSwitch = els.root.querySelector(
      '[data-switch="hideSensitive"]'
    );

    if (
      !els.lightInput ||
      !els.darkInput ||
      !els.boardPreview ||
      !els.pieceGrid
    )
      return;
    if (!els.identityName || !els.totalBytes) return;

    renderThemeMode();
    renderContrast();
    renderAccessibility();
    renderBoardState();
    renderPieceGrid();
    renderStorageUsage();
    renderPreferences();
    syncTabFromUrl();
    initEvents();
    initAuthState();

    window.addEventListener('popstate', function () {
      syncTabFromUrl();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var openModalEl = document.querySelector(
        '.modal-backdrop[data-state="open"]'
      );
      if (openModalEl) {
        closeModal(openModalEl.id);
        return;
      }
      if (state.activeTab !== 'profile') {
        setActiveTab('profile', true);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

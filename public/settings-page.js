(function () {
  'use strict';

  var KEYS = {
    showCoords: 'chess-show-coords',
    showFrame: 'chess-show-thin-frame',
    boardSize: 'chess-board-size',
    lightSquare: 'chess-light-square',
    darkSquare: 'chess-dark-square'
  };

  var state = {
    showCoords: true,
    showFrame: false,
    boardSize: 10,
    lightSquare: '#F0D9B5',
    darkSquare: '#B58863'
  };

  var els = {};

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

  function isValidHex(v) {
    return typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v);
  }

  function loadPrefs() {
    state.showCoords = readLocal(KEYS.showCoords, 'true') !== 'false';
    state.showFrame = readLocal(KEYS.showFrame, 'false') === 'true';
    var size = Number(readLocal(KEYS.boardSize, '10'));
    state.boardSize = isFinite(size) ? size : 10;
    var light = readLocal(KEYS.lightSquare, '#F0D9B5');
    state.lightSquare = isValidHex(light) ? light : '#F0D9B5';
    var dark = readLocal(KEYS.darkSquare, '#B58863');
    state.darkSquare = isValidHex(dark) ? dark : '#B58863';
  }

  function render() {
    els.coordsToggle.checked = state.showCoords;
    els.frameToggle.checked = state.showFrame;
    els.sizeRange.value = String(state.boardSize);
    els.sizeVal.textContent = state.boardSize + ' cm';
    els.lightInput.value = state.lightSquare;
    els.darkInput.value = state.darkSquare;
    for (var i = 0; i < els.presets.length; i++) {
      var btn = els.presets[i];
      var active =
        btn.getAttribute('data-theme-light').toLowerCase() === state.lightSquare.toLowerCase() &&
        btn.getAttribute('data-theme-dark').toLowerCase() === state.darkSquare.toLowerCase();
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    }
  }

  function setColors(light, dark) {
    state.lightSquare = light;
    state.darkSquare = dark;
    writeLocal(KEYS.lightSquare, light);
    writeLocal(KEYS.darkSquare, dark);
    render();
  }

  function onClick(e) {
    var btn = e.target.closest('[data-theme-light]');
    if (btn) {
      setColors(btn.getAttribute('data-theme-light'), btn.getAttribute('data-theme-dark'));
      return;
    }
  }

  function init() {
    var root = document.querySelector('[data-settings-root]');
    if (!root) return;
    els.coordsToggle = root.querySelector('[data-setting="showCoords"]');
    els.frameToggle = root.querySelector('[data-setting="showFrame"]');
    els.sizeRange = root.querySelector('[data-setting="boardSize"]');
    els.sizeVal = root.querySelector('[data-board-size-val]');
    els.lightInput = root.querySelector('[data-color="light"]');
    els.darkInput = root.querySelector('[data-color="dark"]');
    els.presets = root.querySelectorAll('[data-theme-light]');
    if (!els.coordsToggle || !els.sizeRange || !els.lightInput || !els.darkInput) return;

    loadPrefs();
    render();

    els.coordsToggle.addEventListener('change', function (e) {
      state.showCoords = e.target.checked;
      writeLocal(KEYS.showCoords, String(state.showCoords));
    });
    els.frameToggle.addEventListener('change', function (e) {
      state.showFrame = e.target.checked;
      writeLocal(KEYS.showFrame, String(state.showFrame));
    });
    els.sizeRange.addEventListener('input', function (e) {
      state.boardSize = Number(e.target.value);
      els.sizeVal.textContent = state.boardSize + ' cm';
      writeLocal(KEYS.boardSize, String(state.boardSize));
    });
    els.lightInput.addEventListener('input', function (e) {
      state.lightSquare = e.target.value;
      writeLocal(KEYS.lightSquare, state.lightSquare);
      render();
    });
    els.darkInput.addEventListener('input', function (e) {
      state.darkSquare = e.target.value;
      writeLocal(KEYS.darkSquare, state.darkSquare);
      render();
    });
    root.addEventListener('click', onClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

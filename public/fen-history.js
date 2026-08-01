(function () {
  'use strict';

  var state = {
    activeTab: 'active',
    sort: 'newest',
    deleteTargetId: null,
    history: [],
    archive: [],
    favorites: {},
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    pieceStyle: 'cburnett'
  };

  var els = {};

  function notify(type, message) {
    try {
      window.CV.notify.push({ type: type, message: message });
    } catch (e) {}
  }

  function load() {
    try {
      var rawHist = localStorage.getItem('fen-history');
      state.history = rawHist ? JSON.parse(rawHist) : [];
    } catch (e) { state.history = []; }
    try {
      var rawArch = localStorage.getItem('fen-archive');
      state.archive = rawArch ? JSON.parse(rawArch) : [];
    } catch (e) { state.archive = []; }
    try {
      var rawFav = localStorage.getItem('favoriteFens');
      state.favorites = rawFav ? JSON.parse(rawFav) : {};
    } catch (e) { state.favorites = {}; }
    try {
      state.lightSquare = localStorage.getItem('chess-light-square') || '#f0d9b5';
      state.darkSquare = localStorage.getItem('chess-dark-square') || '#b58863';
      state.pieceStyle = localStorage.getItem('chess-piece-style') || 'cburnett';
    } catch (e) {}
  }

  function saveHistory() {
    try {
      localStorage.setItem('fen-history', JSON.stringify(state.history));
    } catch (e) {}
  }

  function saveArchive() {
    try {
      localStorage.setItem('fen-archive', JSON.stringify(state.archive));
    } catch (e) {}
  }

  function saveFavorites() {
    try {
      localStorage.setItem('favoriteFens', JSON.stringify(state.favorites));
    } catch (e) {}
  }

  function filteredItems() {
    var items = [];
    if (state.activeTab === 'active') {
      items = state.history;
    } else if (state.activeTab === 'favorites') {
      var favFens = Object.keys(state.favorites);
      items = state.history.filter(function (h) { return favFens.indexOf(h.fen) !== -1; });
    } else {
      items = state.archive;
    }
    if (state.sort === 'name') {
      items = items.slice().sort(function (a, b) { return a.fen.localeCompare(b.fen); });
    } else if (state.sort === 'oldest') {
      items = items.slice().reverse();
    }
    return items;
  }

  function emptyMessage() {
    if (state.activeTab === 'active') return 'No positions saved yet.';
    if (state.activeTab === 'favorites') return 'No favorite positions.';
    return 'Archive is empty.';
  }

  function deleteConfirmMessage() {
    if (state.activeTab === 'archive') {
      return 'Permanently delete this position? This cannot be undone.';
    }
    return 'Move this position to the archive?';
  }

  function formatDateTime(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    return (
      d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    );
  }

  function renderMiniBoard(el, fen) {
    var placement = String(fen || '').trim().split(/\s+/)[0] || '';
    if (!placement) return;
    var ranks = placement.split('/');
    var board = [];
    for (var ri = 0; ri < ranks.length; ri++) {
      var row = [];
      for (var ci = 0; ci < ranks[ri].length; ci++) {
        var ch = ranks[ri][ci];
        if (ch >= '1' && ch <= '8') {
          for (var k = 0; k < parseInt(ch, 10); k++) row.push('');
        } else {
          row.push(ch);
        }
      }
      while (row.length < 8) row.push('');
      board.push(row.slice(0, 8));
    }
    var html = '';
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        var cell = board[r][c];
        var isLight = (r + c) % 2 === 0;
        var bg = isLight ? state.lightSquare : state.darkSquare;
        var pieceHtml = '';
        if (cell) {
          var key = (cell === cell.toUpperCase() ? 'w' : 'b') + cell.toUpperCase();
          pieceHtml = '<img src="/piece/' + state.pieceStyle + '/' + key + '.svg" alt="" />';
        }
        html += '<div class="mini-square" style="background:' + bg + '">' + pieceHtml + '</div>';
      }
    }
    el.innerHTML = html;
  }

  var ICON_STAR =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
  var ICON_COPY =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  var ICON_ROTATE =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path><polyline points="23 4 23 10 17 10"></polyline></svg>';
  var ICON_TRASH =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';

  function cardHtml(item) {
    var fenPart = String(item.fen || '').split(' ')[0] || '';
    var fav = !!item.isFavorite;
    var actions = '';
    if (state.activeTab === 'archive') {
      actions +=
        '<button type="button" data-reactivate="' + item.id + '" class="btn-icon-sm" title="Reactivate">' + ICON_ROTATE + '</button>' +
        '<button type="button" data-delete="' + item.id + '" class="btn-icon-sm btn-danger" title="Delete permanently">' + ICON_TRASH + '</button>';
    } else {
      actions +=
        '<button type="button" data-delete="' + item.id + '" class="btn-icon-sm btn-danger" title="Move to archive">' + ICON_ROTATE + '</button>';
    }
    var source = item.source
      ? '<div class="history-source">Source: ' + item.source + '</div>'
      : '';
    return (
      '<div class="history-card' + (fav ? ' favorite' : '') + '">' +
      '<a href="/?fen=' + encodeURIComponent(item.fen) + '" class="history-card-link">' +
      '<div class="history-board"><div class="mini-board"></div></div>' +
      '<div class="history-meta">' +
      '<div class="history-info">' +
      '<code class="history-fen">' + fenPart + '</code>' +
      '<div class="history-timestamp">' + formatDateTime(item.timestamp || item.lastActiveAt) + '</div>' +
      source +
      '</div>' +
      '</div>' +
      '</a>' +
      '<div class="history-actions-cell" style="padding: 0 0.625rem 0.625rem">' +
      '<button type="button" data-fav="' + item.id + '" class="btn-icon-sm fav-btn' + (fav ? ' active' : '') + '"' +
      ' title="' + (fav ? 'Remove from favorites' : 'Add to favorites') + '">' + ICON_STAR + '</button>' +
      '<button type="button" data-copy-fen="' + item.id + '" class="btn-icon-sm" title="Copy FEN">' + ICON_COPY + '</button>' +
      actions +
      '</div>' +
      '</div>'
    );
  }

  function renderGrid() {
    var items = filteredItems();
    els.grid.hidden = items.length === 0;
    els.empty.hidden = items.length > 0;
    els.clearAll.hidden = items.length === 0;
    els.emptyMessage.textContent = emptyMessage();
    var html = '';
    for (var i = 0; i < items.length; i++) {
      html += cardHtml(items[i]);
    }
    els.grid.innerHTML = html;
    var boards = els.grid.querySelectorAll('.mini-board');
    for (var j = 0; j < items.length; j++) {
      renderMiniBoard(boards[j], items[j].fen);
    }
  }

  function renderTabs() {
    var tabs = els.root.querySelectorAll('[data-tab]');
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      var active = tab.getAttribute('data-tab') === state.activeTab;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    }
    var countMap = {
      active: state.history.length,
      favorites: Object.keys(state.favorites).length,
      archive: state.archive.length
    };
    var counts = els.root.querySelectorAll('[data-tab-count]');
    for (var j = 0; j < counts.length; j++) {
      counts[j].textContent = String(countMap[counts[j].getAttribute('data-tab-count')] || 0);
    }
  }

  function toggleFavorite(id) {
    var entry = null;
    for (var i = 0; i < state.history.length; i++) {
      if (state.history[i].id === id) { entry = state.history[i]; break; }
    }
    if (!entry) return;
    var fen = entry.fen;
    if (state.favorites[fen]) {
      delete state.favorites[fen];
      entry.isFavorite = false;
    } else {
      state.favorites[fen] = true;
      entry.isFavorite = true;
    }
    saveFavorites();
    saveHistory();
  }

  function copyFen(fen) {
    navigator.clipboard.writeText(fen).then(function () {
      notify('success', 'FEN copied to clipboard');
    }).catch(function () {
      notify('error', 'Could not copy FEN');
    });
  }

  function deleteWithConfirm(id) {
    state.deleteTargetId = id;
    els.deleteMessage.textContent = deleteConfirmMessage();
    els.confirmModal.dataset.state = 'open';
    document.body.classList.add('modal-open');
  }

  function cancelDelete() {
    state.deleteTargetId = null;
    els.confirmModal.dataset.state = 'closed';
    document.body.classList.remove('modal-open');
  }

  function confirmDelete() {
    if (state.deleteTargetId === null) return;
    if (state.activeTab === 'archive') {
      state.archive = state.archive.filter(function (h) { return h.id !== state.deleteTargetId; });
      saveArchive();
    } else {
      var entry = null;
      for (var i = 0; i < state.history.length; i++) {
        if (state.history[i].id === state.deleteTargetId) { entry = state.history[i]; break; }
      }
      if (entry) {
        if (!entry.isFavorite) {
          var archived = {
            id: entry.id,
            fen: entry.fen,
            isFavorite: entry.isFavorite,
            lastActiveAt: entry.lastActiveAt,
            createdAt: entry.createdAt,
            source: entry.source,
            archivedAt: Date.now(),
            timestamp: entry.createdAt || entry.lastActiveAt
          };
          state.archive.unshift(archived);
          saveArchive();
        }
        state.history = state.history.filter(function (h) { return h.id !== state.deleteTargetId; });
        saveHistory();
      }
    }
    cancelDelete();
    renderGrid();
    renderTabs();
  }

  function reactivate(id) {
    var idx = -1;
    for (var i = 0; i < state.archive.length; i++) {
      if (state.archive[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return;
    var entry = state.archive[idx];
    state.archive.splice(idx, 1);
    entry.archivedAt = undefined;
    entry.lastActiveAt = Date.now();
    state.history.unshift(entry);
    saveArchive();
    saveHistory();
    renderGrid();
    renderTabs();
  }

  function clearAll() {
    if (!confirm('Delete all saved positions in this view?')) return;
    if (state.activeTab === 'archive') {
      state.archive = [];
      saveArchive();
    } else if (state.activeTab === 'favorites') {
      for (var i = 0; i < state.history.length; i++) {
        if (state.history[i].isFavorite) state.history[i].isFavorite = false;
      }
      state.favorites = {};
      saveFavorites();
      saveHistory();
    } else {
      state.history = [];
      saveHistory();
    }
    renderGrid();
    renderTabs();
  }

  function onClick(e) {
    var btn = e.target.closest('[data-tab]');
    if (btn) {
      state.activeTab = btn.getAttribute('data-tab');
      renderTabs();
      renderGrid();
      return;
    }
    btn = e.target.closest('[data-fav]');
    if (btn) {
      toggleFavorite(Number(btn.getAttribute('data-fav')));
      renderGrid();
      renderTabs();
      return;
    }
    btn = e.target.closest('[data-copy-fen]');
    if (btn) {
      var entry = null;
      for (var i = 0; i < state.history.length; i++) {
        if (state.history[i].id === Number(btn.getAttribute('data-copy-fen'))) { entry = state.history[i]; break; }
      }
      if (entry) copyFen(entry.fen);
      return;
    }
    btn = e.target.closest('[data-delete]');
    if (btn) {
      e.preventDefault();
      deleteWithConfirm(Number(btn.getAttribute('data-delete')));
      return;
    }
    btn = e.target.closest('[data-reactivate]');
    if (btn) {
      e.preventDefault();
      reactivate(Number(btn.getAttribute('data-reactivate')));
      return;
    }
    btn = e.target.closest('[data-clear-all]');
    if (btn) { clearAll(); return; }
    if (e.target.closest('[data-modal-cancel]') || e.target.closest('[data-modal-close]')) {
      cancelDelete();
      return;
    }
    if (e.target.closest('[data-modal-confirm]')) {
      confirmDelete();
      return;
    }
    if (e.target.hasAttribute && e.target.hasAttribute('data-backdrop-close')) {
      cancelDelete();
      return;
    }
  }

  function init() {
    els.root = document.querySelector('[data-history-root]');
    if (!els.root) return;
    els.grid = els.root.querySelector('[data-history-grid]');
    els.empty = els.root.querySelector('[data-history-empty]');
    els.emptyMessage = els.root.querySelector('[data-empty-message]');
    els.clearAll = els.root.querySelector('[data-clear-all]');
    els.sort = els.root.querySelector('[data-sort]');
    els.confirmModal = els.root.querySelector('#delete-confirm-modal');
    els.deleteMessage = els.root.querySelector('[data-delete-message]');
    if (!els.grid || !els.confirmModal || !els.deleteMessage) return;

    load();
    els.sort.value = state.sort;
    els.root.addEventListener('click', onClick);
    els.sort.addEventListener('change', function (e) {
      state.sort = e.target.value;
      renderGrid();
    });
    renderTabs();
    renderGrid();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

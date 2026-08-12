(function () {
  'use strict';

  function init() {
    var section = document.querySelector('[data-donate-section]');
    if (!section) return;
    var copyBtn = section.querySelector('[data-copy-wallet]');
    var copiedMsg = section.querySelector('[data-copied-msg]');
    var walletEl = section.querySelector('[data-wallet]');
    if (!copyBtn || !copiedMsg || !walletEl) return;

    var copiedTimer = null;
    copyBtn.addEventListener('click', function () {
      var wallet = (walletEl.textContent || '').trim();
      navigator.clipboard
        .writeText(wallet)
        .then(function () {
          copiedMsg.hidden = false;
          if (copiedTimer) clearTimeout(copiedTimer);
          copiedTimer = setTimeout(function () {
            copiedMsg.hidden = true;
          }, 2000);
        })
        .catch(function () {});
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

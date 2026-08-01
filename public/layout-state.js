(function () {
  'use strict';

  var state = {
    mobileOpen: false,
    desktopOpen: false,
    _scrollY: 0,
    _preventScroll: null,
  };

  var els = {};

  function lockScroll() {
    state._scrollY = window.scrollY;
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + state._scrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    var preventScroll = function (e) {
      e.preventDefault();
    };
    state._preventScroll = preventScroll;
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('wheel', preventScroll, { passive: false });
  }

  function unlockScroll() {
    if (state._preventScroll) {
      document.removeEventListener('touchmove', state._preventScroll);
      document.removeEventListener('wheel', state._preventScroll);
      state._preventScroll = null;
    }
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    window.scrollTo(0, state._scrollY);
  }

  function syncMobile() {
    var open = state.mobileOpen;
    els.mobilePanel.setAttribute('data-state', open ? 'open' : 'closed');
    els.mobileBackdrop.setAttribute('data-state', open ? 'open' : 'closed');
    els.mobileToggle.classList.toggle('toggle-btn-open', open);
    els.mobileToggle.setAttribute('aria-expanded', String(open));
    els.mobileToggle.querySelectorAll('[data-nav-icon]').forEach(function (icon) {
      var isOpen = icon.getAttribute('data-nav-icon') === 'close';
      icon.classList.toggle('hidden', !(open === isOpen));
    });
    if (open) lockScroll();
    else unlockScroll();
  }

  function syncDesktop() {
    var open = state.desktopOpen;
    els.desktopPanel.setAttribute('data-state', open ? 'open' : 'closed');
    els.desktopToggle.classList.toggle('dropdown-toggle-active', open);
    els.desktopToggle.setAttribute('aria-expanded', String(open));
    els.desktopToggle.querySelectorAll('[data-nav-icon]').forEach(function (icon) {
      var isOpen = icon.getAttribute('data-nav-icon') === 'close';
      icon.classList.toggle('hidden', !(open === isOpen));
    });
  }

  function closeAll() {
    if (state.mobileOpen) {
      state.mobileOpen = false;
      syncMobile();
    }
    if (state.desktopOpen) {
      state.desktopOpen = false;
      syncDesktop();
    }
  }

  function init() {
    els.mobileToggle = document.getElementById('mobile-toggle');
    els.mobilePanel = document.getElementById('mobile-panel');
    els.mobileBackdrop = document.getElementById('mobile-backdrop');
    els.desktopToggle = document.getElementById('desktop-dropdown-toggle');
    els.desktopPanel = document.querySelector('.desktop-dropdown-wrap .dropdown-panel');

    if (els.mobileToggle && els.mobilePanel) {
      els.mobileToggle.addEventListener('click', function () {
        state.mobileOpen = !state.mobileOpen;
        state.desktopOpen = false;
        syncMobile();
        syncDesktop();
      });
      els.mobileBackdrop.addEventListener('click', closeAll);
    }

    if (els.desktopToggle && els.desktopPanel) {
      els.desktopToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        state.desktopOpen = !state.desktopOpen;
        state.mobileOpen = false;
        syncDesktop();
        syncMobile();
      });
      document.addEventListener('click', function (e) {
        if (state.desktopOpen && !e.target.closest('#desktop-dropdown-wrap')) {
          state.desktopOpen = false;
          syncDesktop();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });

    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('[data-group-toggle]');
      if (toggle) {
        var group = toggle.closest('[data-collapsible-group]');
        if (!group) return;
        var expanded = group.getAttribute('data-expanded') !== 'true';
        group.setAttribute('data-expanded', String(expanded));
        var items = group.querySelector('[data-group-items]');
        if (items) items.hidden = !expanded;
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.classList.toggle('group-toggle-active', expanded);
        toggle.classList.toggle('group-toggle-inactive', !expanded);
        var openIcon = group.querySelector('[data-chevron-open]');
        var closeIcon = group.querySelector('[data-chevron-close]');
        if (openIcon) openIcon.hidden = !expanded;
        if (closeIcon) closeIcon.hidden = expanded;
        return;
      }
      var faq = e.target.closest('[data-faq-toggle]');
      if (faq) {
        var expanded2 = faq.getAttribute('aria-expanded') === 'true';
        var next = !expanded2;
        faq.setAttribute('aria-expanded', String(next));
        var icon = faq.querySelector('.faq-icon');
        if (icon) icon.classList.toggle('faq-icon-open', next);
        var body = faq.closest('.faq-item')?.querySelector('[data-faq-body]');
        if (body) body.hidden = !next;
      }
    });

    var signOut = document.querySelector('[data-signout]');
    if (signOut) {
      signOut.addEventListener('click', function () {
        fetch('/auth/sign-out', { method: 'POST' })
          .catch(function () {})
          .then(function () {
            window.location.reload();
          });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

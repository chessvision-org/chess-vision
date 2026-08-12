(function () {
  'use strict';

  var MAX_DURATION = 5000;

  var ICONS = {
    success:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check-big h-5 w-5"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>',
    error:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path></svg>',
    warning:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert h-5 w-5"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>'
  };
  var X_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';

  var TITLES = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information'
  };
  var LABELS = {
    success: 'Success notification',
    error: 'Error notification',
    warning: 'Warning notification',
    info: 'Information notification'
  };

  var region = null;
  var toast = null;
  var timeout = null;

  function remove() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (toast) {
      toast.remove();
      toast = null;
    }
  }

  function push(opts) {
    var type = opts.type || 'info';
    var message = opts.message || '';
    var ms = Math.min(Math.max(Number(opts.duration) || 0, 0), MAX_DURATION);

    remove();

    if (!region) {
      region = document.getElementById('notif-region');
      if (!region) return;
    }

    var html =
      '<div role="alert" aria-label="' +
      LABELS[type] +
      '" tabindex="0" class="notif-toast animate-notif-in">' +
      '<div class="notif-icon-wrap notif-icon-' +
      type +
      '"><span>' +
      ICONS[type] +
      '</span></div>' +
      '<div class="notif-body">' +
      '<p class="notif-title notif-title-' +
      type +
      '">' +
      TITLES[type] +
      '</p>' +
      '<p class="notif-message"></p>' +
      '</div>' +
      '<button type="button" class="notif-dismiss" aria-label="Dismiss notification">' +
      X_ICON +
      '</button>' +
      '<div class="notif-edge">' +
      '<div class="notif-corner"></div>' +
      '<div class="notif-corner notif-corner-tone notif-corner-' +
      type +
      '"></div>' +
      (ms > 0
        ? '<div class="notif-progress notif-strip-' +
          type +
          '" style="animation: shrinkX ' +
          ms +
          'ms linear forwards"></div>'
        : '') +
      '</div>' +
      '</div>';

    region.insertAdjacentHTML('beforeend', html);
    toast = region.lastElementChild;
    toast.querySelector('.notif-message').textContent = message;
    toast.querySelector('.notif-dismiss').addEventListener('click', remove);
    if (ms > 0) timeout = setTimeout(remove, ms);
  }

  window.CV = window.CV || {};
  window.CV.notify = {
    push: push,
    success: function (message, duration) {
      push({ type: 'success', message: message, duration: duration });
    },
    error: function (message, duration) {
      push({ type: 'error', message: message, duration: duration });
    },
    warning: function (message, duration) {
      push({ type: 'warning', message: message, duration: duration });
    },
    info: function (message, duration) {
      push({ type: 'info', message: message, duration: duration });
    },
    remove: remove
  };
})();

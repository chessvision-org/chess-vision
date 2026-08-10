(function () {
  'use strict';

  // ANONYMOUS ANALYTICS — PRIVACY-FIRST
  // Counts unique visitors per day and how many used the export feature.
  // No cookies, no identifiers, no IPs stored — the IP is hashed at the
  // Cloudflare edge (workers/analytics) with a daily-rotating salt and
  // discarded after 25 hours. This script must never break the app.

  var ENDPOINT = '/api/analytics/track';
  var sent = { visit: false, export: false };

  function sendBeacon(event) {
    if (sent[event]) return;
    sent[event] = true;

    var payload = JSON.stringify({ event: event });

    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(ENDPOINT, blob);
      } else {
        var req = new XMLHttpRequest();
        req.open('POST', ENDPOINT, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(payload);
      }
    } catch (e) {
      // Analytics must never break the app
    }
  }

  window.cvAnalytics = {
    trackVisit: function () {
      sendBeacon('visit');
    },
    trackExport: function () {
      sendBeacon('export');
    }
  };

  window.cvAnalytics.trackVisit();
})();

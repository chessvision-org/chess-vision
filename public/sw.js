self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            return caches.delete(key);
          })
        );
      }),
      self.registration.unregister()
    ])
  );
});

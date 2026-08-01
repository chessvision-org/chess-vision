(function () {
  var purged = false;
  try {
    purged = localStorage.getItem("cv_sw_purged") === "1";
  } catch (e) {}

  if (purged || !("serviceWorker" in navigator)) return;

  navigator.serviceWorker.getRegistrations().then(function (regs) {
    if (!regs.length) {
      try {
        localStorage.setItem("cv_sw_purged", "1");
      } catch (e) {}
      return;
    }
    Promise.all(
      regs.map(function (reg) {
        return reg.unregister();
      })
    ).then(function () {
      try {
        localStorage.setItem("cv_sw_purged", "1");
      } catch (e) {}
    });
  });
})();

(function () {
  var nav = null;
  var raf = null;

  function measure() {
    if (!nav) nav = document.querySelector(".nav");
    if (!nav) return;

    var height = nav.getBoundingClientRect().height;
    if (height > 0) {
      document.documentElement.style.setProperty("--navbar-height", height + "px");
    }
  }

  function scheduleMeasure() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(measure);
  }

  scheduleMeasure();

  window.addEventListener("resize", scheduleMeasure);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMeasure);
  }

   if (window.ResizeObserver) {
    var ro = new ResizeObserver(scheduleMeasure);
    var attach = function () {
      nav = document.querySelector(".nav");
      if (nav) {
        ro.observe(nav);
      } else {
        requestAnimationFrame(attach);
      }
    };
    attach();
  } else {
    document.addEventListener("DOMContentLoaded", scheduleMeasure);
    window.addEventListener("load", scheduleMeasure);
  }
})();
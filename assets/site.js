/* Theme toggle and scroll reveals. The theme key is shared with the blog at /blog
   so a choice made on either half of the site carries to the other. */
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'kb-theme';

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function current() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var btn = document.getElementById('theme');
  if (btn) {
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }

  /* Follow the system preference while the visitor has not chosen one. */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!stored()) root.removeAttribute('data-theme');
  });

  /* Reveals are decoration, so they fail open: every path below ends with the
     content visible. The .reveal class only hides anything once .js is set. */
  var targets = document.querySelectorAll('.reveal');

  function revealAll() {
    targets.forEach(function (el) { el.classList.add('seen'); });
  }

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealAll();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('seen');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  targets.forEach(function (el) { io.observe(el); });

  /* Failsafe: if the observer never reports (a background tab that is never
     rendered, a bfcache restore, an environment that throttles it), show
     everything rather than leave the page blank. */
  setTimeout(function () {
    if (document.querySelector('.reveal.seen')) return;
    io.disconnect();
    revealAll();
  }, 1600);

  /* Print dialogs do not run the observer; the stylesheet covers the render,
     this covers a print triggered before anything has been revealed. */
  window.addEventListener('beforeprint', revealAll);
})();

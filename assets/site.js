/* Three independent pieces of behaviour, each in its own scope so that an early
   exit in one can never disable another, and so no two share a name. */

/* ---- theme ----
   The key is shared with the blog at /blog, so a choice made on either half of
   the site carries over to the other. */
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'kb-theme';

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function activeTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var btn = document.getElementById('theme');
  if (btn) {
    btn.addEventListener('click', function () {
      var next = activeTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }

  /* Follow the system preference for as long as the visitor has not chosen. */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!stored()) root.removeAttribute('data-theme');
  });
})();

/* ---- scroll reveals ----
   Decoration, so every path through this ends with the content visible. The
   .reveal class only hides anything once .js is on the root element. */
(function () {
  'use strict';

  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  function revealAll() {
    targets.forEach(function (el) { el.classList.add('seen'); });
  }

  /* Print dialogs never run the observer. The stylesheet covers the render;
     this covers a print fired before anything has been revealed. */
  window.addEventListener('beforeprint', revealAll);

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

  /* Failsafe: if the observer never reports (a tab that is never rendered, a
     bfcache restore, an environment that throttles it), show everything rather
     than leave the page blank. */
  setTimeout(function () {
    if (document.querySelector('.reveal.seen')) return;
    io.disconnect();
    revealAll();
  }, 1600);
})();

/* ---- smooth anchor scrolling ----
   Kept off the root scroller on purpose (see site.css): there it also smooths
   wheel and keyboard scrolling, where queued animations fight native momentum
   and suddenly accelerate. Only explicit anchor clicks animate, and never for
   visitors who prefer reduced motion. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', function (ev) {
    if (ev.defaultPrevented || ev.button !== 0 ||
        ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
    if (!a || a.classList.contains('skip')) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    ev.preventDefault();
    target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
    try { history.pushState(null, '', '#' + id); } catch (e) {}
  });
})();

/* ---- sidebar scrollspy ----
   Not an IntersectionObserver: "which section am I in" is a question about a
   single position, and one measurement answers it without ratio bookkeeping.
   Runs at most once per frame. */
(function () {
  'use strict';

  var entries = [].slice
    .call(document.querySelectorAll('.masthead-nav a[href^="#"], .chapters-nav a[href^="#"]'))
    .map(function (a) {
      var id = a.getAttribute('href').slice(1);
      var target = id && document.getElementById(id);
      return target ? { link: a, target: target } : null;
    })
    .filter(Boolean);

  if (entries.length < 2) return;

  var marked = null;
  var queued = false;

  function mark() {
    queued = false;
    /* The last heading whose top has crossed a line a third down the viewport. */
    var line = window.innerHeight * 0.33;
    var found = null;
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].target.getBoundingClientRect().top <= line) found = entries[i];
    }
    /* At the very bottom the final section can never cross that line. */
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      found = entries[entries.length - 1];
    }
    if (found === marked) return;
    if (marked) marked.link.classList.remove('here');
    if (found) found.link.classList.add('here');
    marked = found;
    if (found) keepInView(found.link);
  }

  /* With a long chapter index the active link can sit outside the rail's own
     scroll area. Nudge the rail only, never the page: scrollIntoView would
     move the document too and fight the scroll that triggered this. */
  var rail = document.querySelector('.rail-scroll');
  function keepInView(link) {
    if (!rail || rail.scrollHeight <= rail.clientHeight) return;
    var top = link.offsetTop - rail.offsetTop;
    var bottom = top + link.offsetHeight;
    var pad = 24;
    if (top < rail.scrollTop + pad) {
      rail.scrollTop = Math.max(0, top - pad);
    } else if (bottom > rail.scrollTop + rail.clientHeight - pad) {
      rail.scrollTop = bottom - rail.clientHeight + pad;
    }
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(mark);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  mark();
})();

(function () {
  "use strict";

  /* ---- Scroll progress bar ---- */
  (function () {
    var bar = document.getElementById('progressBar');
    if (!bar) return;
    function update() {
      var s = window.scrollY;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min((s / h) * 100, 100) : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ---- Masthead mobile navigation ---- */
  (function () {
    var btn = document.getElementById('mhToggle');
    var nav = document.getElementById('mobileNav');
    if (!btn || !nav) return;
    function close() {
      nav.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open navigation');
    }
    btn.addEventListener('click', function () {
      if (nav.hidden) {
        nav.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Close navigation');
      } else {
        close();
      }
    });
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      a.addEventListener('click', close);
    });
  })();

  /* ---- Reveal scroll animation ---- */
  (function () {
    var items = document.querySelectorAll('.reveal, .reveal-top');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  })();

  /* ---- Evidence rail auto-advance ---- */
  (function () {
    var track = document.getElementById('evTrack');
    if (!track) return;
    var cards = Array.prototype.slice.call(track.querySelectorAll('.ev-card'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('#evDots .ev-dot'));
    if (!cards.length) return;
    var current = 0;
    var timer = null;
    var visible = false;
    var PAUSE = 2400;

    function setActive() {
      cards.forEach(function (c, i) { c.classList.toggle('ev-active', i === current); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
    }

    function go(i) {
      current = (i + cards.length) % cards.length;
      var card = cards[current];
      if (card.scrollIntoView) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
      setActive();
    }

    function next() { go(current + 1); }

    function start() {
      if (timer || cards.length < 2) return;
      timer = window.setInterval(next, PAUSE);
    }

    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        stop();
        go(parseInt(d.getAttribute('data-go'), 10));
        start();
      });
    });

    track.addEventListener('mouseenter', stop);
    track.addEventListener('mouseleave', start);
    track.addEventListener('touchstart', stop, { passive: true });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { visible = true; start(); }
          else { visible = false; stop(); }
        });
      }, { threshold: 0.3 });
      io.observe(track);
    } else {
      visible = true;
      start();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (visible) start();
    });

    setActive();
  })();

  /* ---- Data center engagement bars ---- */
  (function () {
    var wrap = document.getElementById('dcBars');
    if (!wrap) return;
    var fills = wrap.querySelectorAll('.dc-bar-fill');
    var done = false;
    function run() {
      if (done) return;
      done = true;
      Array.prototype.forEach.call(fills, function (f) {
        f.style.width = f.getAttribute('data-width') || '0%';
      });
    }
    if (!('IntersectionObserver' in window)) { run(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(wrap);
  })();

  /* ---- Search simulation carousel ---- */
  (function () {
    var track = document.getElementById('simTrack');
    if (!track) return;
    var slides = track.children;
    if (!slides.length) return;
    var dots = Array.prototype.slice.call(document.querySelectorAll('#simDots .sim-dot'));
    var counter = document.getElementById('simCounter');
    var prev = document.getElementById('simPrev');
    var next = document.getElementById('simNext');
    var i = 0;

    function go(n) {
      i = Math.max(0, Math.min(slides.length - 1, n));
      track.style.transform = 'translateX(-' + (i * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('active', k === i); });
      if (counter) counter.textContent = (i + 1) + ' / ' + slides.length;
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
    }

    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(parseInt(d.getAttribute('data-go'), 10)); });
    });
    if (prev) prev.addEventListener('click', function () { go(i - 1); });
    if (next) next.addEventListener('click', function () { go(i + 1); });
    go(0);
  })();

  /* ---- Search screenshot lightbox ---- */
  (function () {
    var overlay = document.getElementById('lightbox');
    if (!overlay) return;
    var img = document.getElementById('lightboxImg');
    var caption = document.getElementById('lightboxCaption');
    var closeBtn = overlay.querySelector('.lightbox-close');

    function open(src, alt) {
      img.src = src;
      img.alt = alt;
      caption.textContent = alt.replace(/^Search result for /, '').replace(/\.$/, '');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    Array.prototype.forEach.call(document.querySelectorAll('.sim-zoom'), function (b) {
      b.addEventListener('click', function () {
        open(b.getAttribute('data-img'), b.getAttribute('data-alt'));
      });
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === img || e.target === caption || e.target === closeBtn) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  })();
})();

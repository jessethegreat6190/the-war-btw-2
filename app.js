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
    }, { threshold: 0.01, rootMargin: '0px 0px 60px 0px' });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  })();

  /* ---- Lottie document icon ---- */
  (function () {
    var el = document.getElementById('docIcon');
    if (!el || typeof window.lottie === 'undefined') return;
    window.lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/document-icon.json'
    });
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

  /* ---- Engagement total-views bars ---- */
  (function () {
    var wrap = document.querySelector('.eng-chart');
    if (!wrap) return;
    var bars = wrap.querySelectorAll('.eng-bar');
    if (!bars.length) return;
    var done = false;
    function run() {
      if (done) return;
      done = true;
      Array.prototype.forEach.call(bars, function (b) {
        b.style.width = (parseFloat(b.getAttribute('data-pct')) || 0) + '%';
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
    var prev = document.getElementById('simPrev');
    var next = document.getElementById('simNext');
    var counter = document.getElementById('simCounter');
    var total = slides.length;
    var i = 0;

    function render() {
      track.style.transform = 'translateX(-' + (i * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('active', k === i); });
      if (counter) counter.textContent = (i + 1) + ' / ' + total;
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === total - 1;
    }

    function go(n) {
      i = Math.max(0, Math.min(total - 1, n));
      render();
    }

    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(parseInt(d.getAttribute('data-go'), 10)); });
    });
    if (prev) prev.addEventListener('click', function () { go(i - 1); });
    if (next) next.addEventListener('click', function () { go(i + 1); });
    render();
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
    Array.prototype.forEach.call(document.querySelectorAll('.ops-verb-imgs img'), function (im) {
      im.addEventListener('click', function () {
        open(im.getAttribute('src'), im.getAttribute('alt'));
      });
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === img || e.target === caption || e.target === closeBtn) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  })();

  /* ---- Ops bars animation ---- */
  (function () {
    var bars = document.querySelectorAll('.ops-bar-fill[data-w]');
    if (!bars.length) return;
    var done = false;
    function run() {
      if (done) return;
      done = true;
      Array.prototype.forEach.call(bars, function (f) {
        f.style.width = f.getAttribute('data-w') || '0%';
      });
    }
    if (!('IntersectionObserver' in window)) { run(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(bars[0].closest('.ops-bars') || bars[0].closest('.ops-script') || bars[0].closest('.ops-verbatim') || bars[0].closest('.ops-hashtags') || bars[0].closest('.ops-timeline') || document.body);
  })();

  /* ---- Stats count-up ---- */
  (function () {
    var strip = document.querySelector('.stats-strip');
    if (!strip) return;
    var values = Array.prototype.slice.call(strip.querySelectorAll('.stat-value[data-count]'));
    if (!values.length) return;
    var holds = Array.prototype.slice.call(strip.querySelectorAll('.stats-hold'));
    var big = strip.querySelector('.stats-big');
    var started = false;

    function format(n, el) {
      return n.toLocaleString('en-US') + (el.getAttribute('data-suffix') || '');
    }

    function countTo(el, target, dur, done) {
      var start = performance.now();
      function tick(now) {
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(Math.round(target * eased), el);
        if (p < 1) requestAnimationFrame(tick);
        else if (done) done();
      }
      requestAnimationFrame(tick);
    }

    function runFirst() {
      if (big) {
        big.classList.add('stats-in');
        var bv = big.querySelector('.stat-value[data-count]');
        if (bv) countTo(bv, parseInt(bv.getAttribute('data-count'), 10) || 0, 1400);
      }
      holds.forEach(function (h, i) {
        setTimeout(function () {
          h.classList.add('stats-in');
          var v = h.querySelector('.stat-value[data-count]');
          if (v) countTo(v, parseInt(v.getAttribute('data-count'), 10) || 0, 900);
        }, 260 + i * 150);
      });
    }

    if (!('IntersectionObserver' in window)) {
      holds.forEach(function (h) { h.classList.add('stats-in'); });
      if (big) big.classList.add('stats-in');
      values.forEach(function (v) { v.textContent = format(parseInt(v.getAttribute('data-count'), 10) || 0, v); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !started) {
          started = true;
          io.disconnect();
          runFirst();
        }
      });
    }, { threshold: 0.4 });
    io.observe(strip);
  })();

  /* ---- Curtain image reveal ---- */
  (function () {
    var frames = [];
    Array.prototype.forEach.call(document.querySelectorAll('img'), function (img) {
      if (img.closest('.curtain')) return;
      if (img.id === 'lightboxImg') return;
      if (img.classList.contains('mh-mark-img') || img.classList.contains('ft-mark-img')) return;
      var cs = getComputedStyle(img);
      var frame = document.createElement('span');
      frame.className = 'curtain';
      frame.style.marginTop = cs.marginTop;
      frame.style.marginRight = cs.marginRight;
      frame.style.marginBottom = cs.marginBottom;
      frame.style.marginLeft = cs.marginLeft;
      img.parentNode.insertBefore(frame, img);
      frame.appendChild(img);
      img.style.margin = '0';
      frames.push(frame);
    });
    if (!frames.length) return;
    if (!('IntersectionObserver' in window)) {
      frames.forEach(function (f) { f.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 80px 0px' });
    frames.forEach(function (f) { io.observe(f); });
  })();

})();

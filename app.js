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

  /* ---- Search simulation carousel (auto-advance) ---- */
  (function () {
    var track = document.getElementById('simTrack');
    if (!track) return;
    var slides = track.children;
    if (!slides.length) return;
    var dots = Array.prototype.slice.call(document.querySelectorAll('#simDots .sim-dot'));
    var frame = track.closest('.sim-frame') || track;
    var total = slides.length;
    var i = 0;
    var timer = null;
    var PAUSE = 4200;

    function render() {
      track.style.transform = 'translateX(-' + (i * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('active', k === i); });
    }

    function go(n) {
      i = (n + total) % total;
      render();
    }

    function start() {
      if (timer || total < 2) return;
      timer = window.setInterval(function () { go(i + 1); }, PAUSE);
    }

    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        go(parseInt(d.getAttribute('data-go'), 10));
        stop();
        start();
      });
    });

    frame.addEventListener('mouseenter', stop);
    frame.addEventListener('mouseleave', start);
    frame.addEventListener('touchstart', stop, { passive: true });
    frame.addEventListener('touchend', start, { passive: true });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) start();
          else stop();
        });
      }, { threshold: 0.25 });
      io.observe(frame);
    } else {
      start();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

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

  /* ---- Posts inside #CongolaisTelema donut ---- */
  (function () {
    var donut = document.querySelector('.ops-donut');
    if (!donut) return;
    var nums = Array.prototype.slice.call(donut.querySelectorAll('[data-count]'));
    if (!nums.length) return;
    var done = false;

    function countUp(el, target, dur, delay) {
      var start = null;
      function tick(now) {
        if (start === null) start = now;
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(tick);
      }
      setTimeout(function () { requestAnimationFrame(tick); }, delay || 0);
    }

    function run() {
      if (done) return;
      done = true;
      donut.classList.add('in-view');
      nums.forEach(function (n) {
        var delay = n.getAttribute('data-delay') ? parseInt(n.getAttribute('data-delay'), 10) : 0;
        countUp(n, parseInt(n.getAttribute('data-count'), 10) || 0, 1500, delay);
      });
    }

    if (!('IntersectionObserver' in window)) { run(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(donut);
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

  /* ---- Section scrollspy ---- */
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.mh-nav a, .mh-mobile a'));
    if (!links.length) return;
    var ids = [];
    var sections = [];
    links.forEach(function (a) {
      var id = (a.getAttribute('href') || '').replace(/^#/, '');
      if (!id) return;
      var el = document.getElementById(id);
      if (!el) return;
      ids.push(id);
      sections.push(el);
    });
    if (!sections.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        a.classList.toggle('active', (a.getAttribute('href') || '') === '#' + id);
      });
    }

    function onScroll() {
      var pos = window.scrollY + window.innerHeight * 0.35;
      var current = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= pos) current = ids[i];
      }
      if (current) setActive(current);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  })();

  /* ---- Deconstructed words in the concluding quote ---- */
  (function () {
    var quotes = Array.prototype.slice.call(document.querySelectorAll('.con-quote'));
    if (!quotes.length) return;
    if (!('IntersectionObserver' in window)) {
      quotes.forEach(function (q) { q.classList.add('deconstructed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('deconstructed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    quotes.forEach(function (q) { io.observe(q); });
  })();

})();

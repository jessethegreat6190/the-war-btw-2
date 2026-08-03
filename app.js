(function () {
  "use strict";

  var D = window.TWB;

  /* ---- Cluster animation ---- */
  (function() {
    var canvas = document.getElementById('clusterCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var caption = document.getElementById('clusterCaption');
    var W, H, cx, cy;
    var nodes = [];
    var pulses = [];
    var frame = 0;
    var captionShown = false;
    var animPhase = 0;
    var phaseTimer = 0;

    var C = {
      drc:    { fill: 'rgba(192,57,43,0.85)',  stroke: '#c0392b', label: 'DRC Government',    glow: 'rgba(192,57,43,0.3)' },
      rwanda: { fill: 'rgba(210,140,40,0.85)',  stroke: '#d28c28', label: 'Rwanda / M23',      glow: 'rgba(210,140,40,0.3)' },
      intl:   { fill: 'rgba(46,122,82,0.9)',    stroke: '#2e7a52', label: 'International Actors', glow: 'rgba(46,122,82,0.4)' },
    };

    function clusterCentres() {
      var r = Math.min(W, H) * 0.28;
      return {
        drc:    { x: cx - r * Math.cos(Math.PI / 6), y: cy - r * 0.5 },
        rwanda: { x: cx + r * Math.cos(Math.PI / 6), y: cy - r * 0.5 },
        intl:   { x: cx,                             y: cy + r * 0.45 },
      };
    }

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      cx = W / 2;
      cy = H / 2;
      buildNodes();
    }

    function buildNodes() {
      nodes = [];
      var centres = clusterCentres();
      var nr = Math.min(W, H) * 0.10;
      function scatter(centre, colour, count) {
        for (var i = 0; i < count; i++) {
          var angle = Math.random() * Math.PI * 2;
          var dist  = Math.pow(Math.random(), 0.55) * nr;
          nodes.push({
            x: centre.x + Math.cos(angle) * dist,
            y: centre.y + Math.sin(angle) * dist,
            r: 1.5 + Math.random() * 3,
            colour: colour,
            ox: centre.x + Math.cos(angle) * dist,
            oy: centre.y + Math.sin(angle) * dist,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      scatter(centres.drc,    C.drc,    55);
      scatter(centres.rwanda, C.rwanda, 55);
      scatter(centres.intl,   C.intl,   28);
    }

    function firePulse(from, colour, glow) {
      var centres = clusterCentres();
      var src = centres[from];
      var dst = centres.intl;
      pulses.push({
        sx: src.x, sy: src.y,
        dx: dst.x, dy: dst.y,
        t: 0,
        speed: 0.007 + Math.random() * 0.004,
        colour: colour,
        glow: glow,
        r: 3 + Math.random() * 2,
        done: false,
      });
    }

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var centres = clusterCentres();
      frame++;
      phaseTimer++;

      if (animPhase === 0 && phaseTimer > 80) {
        animPhase = 1; phaseTimer = 0;
      } else if (animPhase === 1) {
        if (phaseTimer % 14 === 0 && phaseTimer < 85) firePulse('drc', C.drc.stroke, C.drc.glow);
        if (phaseTimer > 100) { animPhase = 2; phaseTimer = 0; }
      } else if (animPhase === 2) {
        if (phaseTimer % 14 === 0 && phaseTimer < 85) firePulse('rwanda', C.rwanda.stroke, C.rwanda.glow);
        if (phaseTimer > 100) { animPhase = 3; phaseTimer = 0; }
      } else if (animPhase === 3) {
        if (phaseTimer % 18 === 0) firePulse('drc', C.drc.stroke, C.drc.glow);
        if (phaseTimer % 18 === 9) firePulse('rwanda', C.rwanda.stroke, C.rwanda.glow);
        if (phaseTimer > 200) { animPhase = 1; phaseTimer = 0; }
        if (!captionShown) {
          captionShown = true;
          caption.style.opacity = '1';
        }
      }

      // Connection lines
      var pairs = [[centres.drc, centres.intl], [centres.rwanda, centres.intl]];
      pairs.forEach(function(p) {
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 6]);
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        ctx.lineTo(p[1].x, p[1].y);
        ctx.stroke();
        ctx.restore();
      });

      // Nodes
      nodes.forEach(function(n) {
        n.phase += 0.004;
        n.x = n.ox + Math.sin(n.phase) * 2.5;
        n.y = n.oy + Math.cos(n.phase * 0.7) * 2.5;
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.colour.fill;
        ctx.fill();
        ctx.restore();
      });

      // Cluster glow halos
      var intlGlowAlpha = (animPhase >= 3) ? 0.12 + Math.sin(frame * 0.04) * 0.06 : 0.06;
      [
        { c: centres.drc,    color: C.drc.glow,    a: 0.10, r: Math.min(W, H) * 0.13 },
        { c: centres.rwanda, color: C.rwanda.glow, a: 0.10, r: Math.min(W, H) * 0.13 },
        { c: centres.intl,   color: C.intl.glow,   a: intlGlowAlpha, r: Math.min(W, H) * 0.10 },
      ].forEach(function(item) {
        var grad = ctx.createRadialGradient(item.c.x, item.c.y, 0, item.c.x, item.c.y, item.r);
        grad.addColorStop(0, item.color);
        grad.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalAlpha = item.a;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(item.c.x, item.c.y, item.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Pulses
      pulses = pulses.filter(function(p) { return !p.done; });
      pulses.forEach(function(p) {
        p.t += p.speed;
        if (p.t >= 1) { p.done = true; return; }
        var et = easeInOut(p.t);
        var px = p.sx + (p.dx - p.sx) * et;
        var py = p.sy + (p.dy - p.sy) * et;

        var grad = ctx.createRadialGradient(px, py, 0, px, py, 12);
        grad.addColorStop(0, p.colour);
        grad.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalAlpha = 0.5 * (1 - Math.abs(p.t - 0.5) * 1.2);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.colour;
        ctx.fill();
        ctx.restore();
      });

      // Labels
      var labelSize = Math.max(10, Math.min(13, W * 0.016));
      var nr = Math.min(W, H) * 0.10;
      [
        { c: centres.drc,    col: C.drc,    offset: { x: 0, y: -(nr + 20) } },
        { c: centres.rwanda, col: C.rwanda, offset: { x: 0, y: -(nr + 20) } },
        { c: centres.intl,   col: C.intl,   offset: { x: 0, y:  (nr + 22) } },
      ].forEach(function(item) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.font = '400 ' + labelSize + "px 'Libre Franklin', system-ui, sans-serif";
        ctx.fillStyle = item.col.stroke;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.col.label, item.c.x + item.offset.x, item.c.y + item.offset.y);
        ctx.restore();
      });

      // Active ring
      if (animPhase === 3) {
        var pulse = Math.sin(frame * 0.06) * 0.5 + 0.5;
        ctx.save();
        ctx.globalAlpha = 0.25 * pulse;
        ctx.strokeStyle = C.intl.stroke;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centres.intl.x, centres.intl.y, nr * 1.35 + pulse * 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', function() {
      resize();
      pulses = [];
      frame = 0;
      animPhase = 0;
      phaseTimer = 0;
      captionShown = false;
      if (caption) caption.style.opacity = '0';
    });

    resize();
    draw();
  })();

  /* ---- Chart ---- */
  if (typeof Chart !== 'undefined' && D.chartData) {
    var cd = D.chartData;
    var RED = '#c0392b';
    var AMBER = '#d28c28';
    var BLUE = '#2a5fa8';
    var GREY = '#7a7468';
    var UI_FONT = "'Libre Franklin', system-ui, sans-serif";

    var ctx = document.getElementById('chartTimeline');
    if (ctx) {
      var KEY_EVENTS = [
        { day: 25, label: 'Goma falls' },
        { day: 46, label: 'Bukavu falls' },
        { day: 54, label: 'EU vote postponed' },
        { day: 68, label: 'Minembwe strike' },
        { day: 75, label: 'EU sanctions' },
      ];
      var eventMarkers = {
        id: 'eventMarkers',
        afterDraw: function (chart) {
          var xs = chart.scales.x;
          var ys = chart.scales.y;
          var c = chart.ctx;
          if (!xs || !ys) return;
          c.save();
          c.font = "600 9px 'Libre Franklin', system-ui, sans-serif";
          KEY_EVENTS.forEach(function (ev) {
            var px = xs.getPixelForValue(ev.day - 2);
            c.strokeStyle = 'rgba(245,242,234,0.22)';
            c.setLineDash([3, 3]);
            c.beginPath();
            c.moveTo(px, ys.top + 14);
            c.lineTo(px, ys.bottom);
            c.stroke();
            c.setLineDash([]);
            c.fillStyle = 'rgba(245,242,234,0.6)';
            c.textAlign = 'center';
            c.fillText(ev.label.toUpperCase(), px, ys.top + 9);
          });
          c.restore();
        },
      };

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: cd.dates,
          datasets: [
            {
              label: 'Covert network',
              data: cd.covert,
              borderColor: RED,
              backgroundColor: 'rgba(192,57,43,0.10)',
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 4,
              fill: true,
              tension: 0.3,
            },
            {
              label: 'Anti-Kagame flooder',
              data: cd.flooder,
              borderColor: AMBER,
              borderWidth: 1.5,
              borderDash: [4, 3],
              pointRadius: 0,
              pointHoverRadius: 4,
              fill: false,
              tension: 0.3,
            },
            {
              label: 'CongolaisTelema',
              data: cd.state,
              borderColor: BLUE,
              borderWidth: 1.5,
              pointRadius: 0,
              pointHoverRadius: 4,
              fill: false,
              tension: 0.3,
            },
            {
              label: 'Organic',
              data: cd.organic,
              borderColor: GREY,
              borderWidth: 1.5,
              pointRadius: 0,
              pointHoverRadius: 4,
              fill: false,
              tension: 0.3,
            },
          ],
        },
        plugins: [eventMarkers],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              position: 'bottom',
              labels: { font: { family: UI_FONT, size: 11 }, color: '#f5f2ea', padding: 16, usePointStyle: true, pointStyle: 'line' },
            },
            tooltip: {
              backgroundColor: '#1c1a14',
              borderColor: 'rgba(255,255,255,0.15)',
              borderWidth: 1,
              titleColor: '#f5f2ea',
              bodyColor: 'rgba(245,242,234,0.85)',
              padding: 12,
              cornerRadius: 4,
              titleFont: { family: UI_FONT, size: 12, weight: '600' },
              bodyFont: { family: UI_FONT, size: 12 },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: UI_FONT, size: 10 }, color: 'rgba(245,242,234,0.55)', maxTicksLimit: 12, maxRotation: 45 },
            },
            y: {
              beginAtZero: true,
              max: 150,
              ticks: { stepSize: 50, font: { family: UI_FONT, size: 10 }, color: 'rgba(245,242,234,0.55)' },
              grid: { color: 'rgba(255,255,255,0.08)' },
            },
          },
        },
      });
    }
  }
})();

/* ---- Search result carousel ---- */
(function () {
  var track = document.getElementById('srTrack');
  if (!track) return;
  var slides = track.children;
  var total = slides.length;
  if (total < 2) return;
  var dots = Array.prototype.slice.call(document.querySelectorAll('.search-car-dot'));
  var counter = document.getElementById('srCounter');
  var prev = document.getElementById('srPrev');
  var next = document.getElementById('srNext');
  var cur = 0;

  function go(n) {
    cur = Math.max(0, Math.min(total - 1, n));
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dots.forEach(function (d, i) { d.classList.toggle('active', i === cur); });
    if (counter) counter.textContent = (cur + 1) + ' / ' + total;
    if (prev) prev.disabled = cur === 0;
    if (next) next.disabled = cur === total - 1;
  }

  dots.forEach(function (d) {
    d.addEventListener('click', function () { go(parseInt(d.getAttribute('data-go'), 10)); });
  });
  if (prev) prev.addEventListener('click', function () { go(cur - 1); });
  if (next) next.addEventListener('click', function () { go(cur + 1); });

  window.addEventListener('resize', function () { track.style.transform = 'translateX(-' + (cur * 100) + '%)'; });
})();

/* ---- Data center bar animation ---- */
(function () {
  var bars = document.querySelector('.dc-bars');
  if (!bars) return;
  var fills = bars.querySelectorAll('.dc-bar-fill');
  if (!fills.length) return;
  var done = false;

  function animate() {
    if (done) return;
    done = true;
    fills.forEach(function (fill) {
      var w = parseFloat(fill.getAttribute('data-width'));
      if (!isNaN(w)) fill.style.width = w + '%';
    });
  }

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(); obs.disconnect(); }
      });
    }, { threshold: 0.3 });
    obs.observe(bars);
  } else {
    animate();
  }
})();

/* ---- Operations per year chart (removed: format repurposed to the timeline) ---- */

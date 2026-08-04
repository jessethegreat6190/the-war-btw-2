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

  /* ---- Wave chart (Chart.js slider) ---- */
  if (typeof Chart !== 'undefined' && D.chartData) {
    var cd = D.chartData;
    var DAYS = cd.dates.length;
    var ctx = document.getElementById('waveChart2');
    if (ctx) {
      var keyEventDays = cd.eventDays || [];

      var events = cd.events.map(function (ev) {
        return {
          day: ev.day,
          label: ev.label,
          badge: ev.badge,
          title: ev.title,
          body: ev.body,
          accent: ev.accent || '#b0a99e'
        };
      });

      function dayLabel(i) {
        var d = new Date(2025, 0, 2);
        d.setDate(d.getDate() + i);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      }

      var scrubPlugin = {
        id: 'scrub2',
        afterDraw: function (chart) {
          var slider = document.getElementById('waveSlider2');
          if (!slider) return;
          var idx = parseInt(slider.value, 10);
          var meta = chart.getDatasetMeta(0);
          if (!meta.data[idx]) return;
          var x = meta.data[idx].x;
          var top = chart.chartArea.top;
          var bottom = chart.chartArea.bottom;
          var c = chart.ctx;
          c.save();
          c.beginPath();
          c.setLineDash([3, 3]);
          c.strokeStyle = 'rgba(139,32,32,0.6)';
          c.lineWidth = 1.5;
          c.moveTo(x, top);
          c.lineTo(x, bottom);
          c.stroke();
          c.beginPath();
          c.arc(x, top + 5, 4, 0, Math.PI * 2);
          c.fillStyle = '#8B2020';
          c.fill();
          c.restore();
        }
      };

      var evtPlugin = {
        id: 'evtLines2',
        afterDraw: function (chart) {
          var meta = chart.getDatasetMeta(0);
          var top = chart.chartArea.top;
          var bottom = chart.chartArea.bottom;
          var c = chart.ctx;
          keyEventDays.forEach(function (day) {
            if (!meta.data[day]) return;
            var x = meta.data[day].x;
            c.save();
            c.beginPath();
            c.setLineDash([4, 4]);
            c.strokeStyle = 'rgba(176,169,158,0.5)';
            c.lineWidth = 1;
            c.moveTo(x, top);
            c.lineTo(x, bottom);
            c.stroke();
            c.restore();
          });
        }
      };

      Chart.register(scrubPlugin, evtPlugin);

      var chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: cd.dates,
          datasets: [
            { label: 'Covert network', data: cd.covert, borderColor: '#8B2020', borderWidth: 2.5, pointRadius: 0, tension: 0.3, fill: false },
            { label: 'Flooder', data: cd.flooder, borderColor: '#8a6e1e', borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: false, borderDash: [4, 3] },
            { label: 'State', data: cd.state, borderColor: '#2a5fa8', borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: false },
            { label: 'Organic', data: cd.organic, borderColor: '#7a7468', borderWidth: 1.5, pointRadius: 0, tension: 0.3, fill: false }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { mode: 'none' },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { ticks: { maxTicksLimit: 8, color: '#7a7468', font: { size: 10 }, maxRotation: 0 }, grid: { color: 'rgba(212,207,198,0.3)' } },
            y: { max: 150, min: 0, ticks: { color: '#7a7468', font: { size: 10 }, stepSize: 50 }, grid: { color: 'rgba(212,207,198,0.3)' }, title: { display: true, text: 'Posts per day', color: '#7a7468', font: { size: 10 } } }
          }
        }
      });

      function findEvent(day) {
        var best = null;
        var bestDist = 999;
        events.forEach(function (ev) {
          var dist = Math.abs(ev.day - day);
          if (dist < bestDist) { bestDist = dist; best = ev; }
        });
        return bestDist <= 5 ? best : null;
      }

      function updatePanel(day) {
        var dateLabel = document.getElementById('waveDateLabel2');
        if (dateLabel) dateLabel.textContent = dayLabel(day);
        var panel = document.getElementById('waveEventPanel2');
        if (!panel) return;
        var wepDate = document.getElementById('wep2Date');
        var wepBadge = document.getElementById('wep2Badge');
        var wepTitle = document.getElementById('wep2Title');
        var wepBody = document.getElementById('wep2Body');
        var ev = findEvent(day);
        if (ev) {
          if (wepDate) wepDate.textContent = ev.label;
          if (ev.badge) {
            if (wepBadge) {
              wepBadge.textContent = ev.badge;
              wepBadge.style.display = 'inline-block';
            }
          } else if (wepBadge) {
            wepBadge.style.display = 'none';
          }
          if (wepTitle) wepTitle.textContent = ev.title;
          if (wepBody) wepBody.textContent = ev.body;
          panel.style.borderLeftColor = ev.accent;
        } else {
          if (wepDate) wepDate.textContent = dayLabel(day);
          if (wepBadge) wepBadge.style.display = 'none';
          if (wepTitle) wepTitle.textContent = 'Quiet period';
          if (wepBody) wepBody.textContent = 'The covert network was largely inactive here \u2014 baseline seeding posture, low volume, no institutional targeting. Activity between the waves reflects the cost of maintaining dormant accounts rather than any operational intent.';
          panel.style.borderLeftColor = '#d4cfc6';
        }
        if (chart) chart.update('none');
      }

      var slider = document.getElementById('waveSlider2');
      if (slider) {
        slider.addEventListener('input', function () {
          updatePanel(parseInt(this.value, 10));
        });
        updatePanel(parseInt(slider.value, 10));
      }
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
  var glide = document.getElementById('srGlide');
  var prev = document.getElementById('srPrev');
  var next = document.getElementById('srNext');
  var cur = 0;

  function step() {
    if (!dots.length) return 0;
    return dots[0].offsetWidth + 8;
  }

  function go(n) {
    cur = Math.max(0, Math.min(total - 1, n));
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    dots.forEach(function (d, i) { d.classList.toggle('active', i === cur); });
    if (glide) glide.style.transform = 'translateX(' + (cur * step()) + 'px)';
    if (prev) prev.disabled = cur === 0;
    if (next) next.disabled = cur === total - 1;
  }

  dots.forEach(function (d) {
    d.addEventListener('click', function () { go(parseInt(d.getAttribute('data-go'), 10)); });
  });
  if (prev) prev.addEventListener('click', function () { go(cur - 1); });
  if (next) next.addEventListener('click', function () { go(cur + 1); });

  window.addEventListener('resize', function () {
    track.style.transform = 'translateX(-' + (cur * 100) + '%)';
    if (glide) glide.style.transform = 'translateX(' + (cur * step()) + 'px)';
  });
  go(0);
})();

/* ---- Data center bar animation ---- */
(function () {
  var bars = document.querySelector('.dc-bars');
  if (!bars) return;
  var fills = bars.querySelectorAll('.dc-bar-fill');
  if (!fills.length) return;
  var values = bars.querySelectorAll('.dc-stat-value');
  var done = false;

  function format(n) {
    return n.toLocaleString('en-US');
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var dur = 1400;
    var t0 = null;
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * p));
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = format(target);
      }
    }
    requestAnimationFrame(tick);
  }

  function animate() {
    if (done) return;
    done = true;
    fills.forEach(function (fill) {
      var w = parseFloat(fill.getAttribute('data-width'));
      if (!isNaN(w)) fill.style.width = w + '%';
    });
    values.forEach(countUp);
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

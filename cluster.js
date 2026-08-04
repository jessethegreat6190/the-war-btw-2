/* cluster.js, lightweight cluster-intro canvas animation
   Optimisations over the original:
   - IntersectionObserver: only runs when visible
   - Capped DPR at 1.5 (not devicePixelRatio)
   - Fewer particles: 25+25+15 = 65 (was 138)
   - Simpler glows (globalAlpha, no radialGradient per frame)
   - Pauses on visibilitychange */
(function () {
  'use strict';
  var canvas = document.getElementById('clusterCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var caption = document.getElementById('clusterCaption');
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  var C = {
    drc:    { fill: 'rgba(192,57,43,0.85)', stroke: '#c0392b', glow: 'rgba(192,57,43,0.25)', label: 'DRC Government' },
    rwanda: { fill: 'rgba(210,140,40,0.85)', stroke: '#d28c28', glow: 'rgba(210,140,40,0.25)', label: 'Rwanda / M23' },
    intl:   { fill: 'rgba(46,122,82,0.9)',   stroke: '#2e7a52', glow: 'rgba(46,122,82,0.3)',   label: 'International Actors' }
  };

  var W, H, cx, cy, nr;
  var nodes = [];
  var pulses = [];
  var frame = 0;
  var animPhase = 0;
  var phaseTimer = 0;
  var captionShown = false;
  var visible = false;
  var raf = null;
  canvas.dataset.frames = '0';

  function centres() {
    var r = Math.min(W, H) * 0.28;
    return {
      drc:    { x: cx - r * Math.cos(Math.PI / 6), y: cy - r * 0.5 },
      rwanda: { x: cx + r * Math.cos(Math.PI / 6), y: cy - r * 0.5 },
      intl:   { x: cx,                              y: cy + r * 0.45 }
    };
  }

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H / 2;
    nr = Math.min(W, H) * 0.10;
    buildNodes();
  }

  function buildNodes() {
    nodes = [];
    var c = centres();
    function scatter(centre, colour, count) {
      for (var i = 0; i < count; i++) {
        var a = Math.random() * Math.PI * 2;
        var d = Math.pow(Math.random(), 0.55) * nr;
        nodes.push({
          x: centre.x + Math.cos(a) * d,
          y: centre.y + Math.sin(a) * d,
          r: 1.5 + Math.random() * 2.5,
          fill: colour.fill,
          ox: centre.x + Math.cos(a) * d,
          oy: centre.y + Math.sin(a) * d,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    scatter(c.drc, C.drc, 25);
    scatter(c.rwanda, C.rwanda, 25);
    scatter(c.intl, C.intl, 15);
  }

  function firePulse(from) {
    var c = centres();
    var s = c[from];
    var d = c.intl;
    pulses.push({
      sx: s.x, sy: s.y, dx: d.x, dy: d.y,
      t: 0, speed: 0.008 + Math.random() * 0.004,
      colour: C[from].stroke,
      r: 3 + Math.random() * 2
    });
  }

  function draw() {
    if (!visible) return;
    ctx.clearRect(0, 0, W, H);
    var c = centres();
    frame++;
    phaseTimer++;

    /* phase sequencing, same as original but lighter */
    if (animPhase === 0 && phaseTimer > 40) {
      animPhase = 1; phaseTimer = 0;
    } else if (animPhase === 1) {
      if (phaseTimer % 16 === 0 && phaseTimer < 45) firePulse('drc');
      if (phaseTimer > 60) { animPhase = 2; phaseTimer = 0; }
    } else if (animPhase === 2) {
      if (phaseTimer % 16 === 0 && phaseTimer < 45) firePulse('rwanda');
      if (phaseTimer > 60) { animPhase = 3; phaseTimer = 0; }
    } else if (animPhase === 3) {
      if (phaseTimer % 20 === 0) firePulse('drc');
      if (phaseTimer % 20 === 10) firePulse('rwanda');
      if (!captionShown) { captionShown = true; caption.style.opacity = '1'; }
      if (phaseTimer > 200) { animPhase = 1; phaseTimer = 0; }
    }

    /* dashed lines */
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 6]);
    [[c.drc, c.intl], [c.rwanda, c.intl]].forEach(function (p) {
      ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); ctx.lineTo(p[1].x, p[1].y); ctx.stroke();
    });
    ctx.restore();

    /* cluster glows, simple circles, no radialGradient */
    var glowR = nr * 1.3;
    [[c.drc, C.drc.glow], [c.rwanda, C.rwanda.glow], [c.intl, C.intl.glow]].forEach(function (g) {
      ctx.save();
      ctx.globalAlpha = 0.08 + (g[1] === C.intl.glow ? Math.sin(frame * 0.04) * 0.04 : 0);
      ctx.fillStyle = g[1];
      ctx.beginPath(); ctx.arc(g[0].x, g[0].y, glowR, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    /* nodes */
    nodes.forEach(function (n) {
      n.phase += 0.005;
      n.x = n.ox + Math.sin(n.phase) * 3;
      n.y = n.oy + Math.cos(n.phase * 0.7) * 3;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = n.fill;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    /* pulses */
    pulses.forEach(function (p) {
      p.t += p.speed;
      if (p.t >= 1) { p.done = true; return; }
      var et = p.t < 0.5 ? 2 * p.t * p.t : -1 + (4 - 2 * p.t) * p.t;
      var px = p.sx + (p.dx - p.sx) * et;
      var py = p.sy + (p.dy - p.sy) * et;
      ctx.save();
      ctx.globalAlpha = 0.5 * (1 - Math.abs(p.t - 0.5) * 1.2);
      ctx.fillStyle = p.colour;
      ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    pulses = pulses.filter(function (p) { return !p.done; });

    /* labels */
    var ls = Math.max(10, Math.min(13, W * 0.016));
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.font = '400 ' + ls + "px 'DM Sans',system-ui,sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    [
      { p: c.drc,    s: C.drc,    oy: -(nr + 20) },
      { p: c.rwanda, s: C.rwanda, oy: -(nr + 20) },
      { p: c.intl,   s: C.intl,   oy:  (nr + 22) }
    ].forEach(function (l) {
      ctx.fillStyle = l.s.stroke;
      ctx.fillText(l.s.label, l.p.x, l.p.y + l.oy);
    });
    ctx.restore();

    /* intl ring */
    if (animPhase === 3) {
      var pulse = Math.sin(frame * 0.06) * 0.5 + 0.5;
      ctx.save();
      ctx.globalAlpha = 0.2 * pulse;
      ctx.strokeStyle = C.intl.stroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(c.intl.x, c.intl.y, nr * 1.35 + pulse * 8, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    raf = requestAnimationFrame(draw);
    canvas.dataset.frames = String(frame);
  }

  function start() {
    if (visible) return;
    visible = true;
    resize();
    draw();
  }

  function stop() {
    visible = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  /* IntersectionObserver, start/stop based on viewport */
  var observer;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === canvas.parentElement) {
          if (e.isIntersecting) start(); else stop();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(canvas.parentElement);
  } else {
    /* fallback: just run it */
    start();
  }

  /* pause on hidden tab */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  window.addEventListener('resize', function () {
    if (!visible) return;
    resize();
    pulses = [];
    frame = 0;
    animPhase = 0;
    phaseTimer = 0;
    captionShown = false;
    caption.style.opacity = '0';
  });
})();

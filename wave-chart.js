/* wave-chart.js, Wave chart initialization (deferred) */
(function () {
  'use strict';
  if (typeof Chart === 'undefined') return;
  var startDate = new Date('2025-01-02');
  var DAYS = 88;
  function dayLabel(i) {
    var d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  function zeroArr() { return new Array(DAYS).fill(0); }
  var covert = zeroArr(), flooder = zeroArr(), state = zeroArr(), organic = zeroArr();
  var cd = {31:2,32:4,33:75,34:18,35:16,36:8,37:5,38:3,57:3,58:100,59:15,60:12,72:5,73:121,74:135,75:18,76:12,77:16,78:8,79:5,84:3,85:5,86:3};
  var fd = {31:3,32:5,33:18,34:15,35:12,36:8,37:6,44:3,45:4,46:5,47:4,57:5,58:7,59:8,60:6,70:4,71:5,72:6,73:8,74:10,75:8,76:7,83:12,84:15,85:18,86:20,87:21};
  var sd = {79:2,80:3,81:5,82:8,83:12,84:20,85:35,86:60,87:150};
  var od = {27:2,28:3,31:4,32:5,33:6,44:3,45:5,57:4,58:6,72:8,73:12,74:10,75:8,79:6,80:8,81:12,82:18,83:28,84:38,85:55,86:50,87:140};
  Object.entries(cd).forEach(function(e) { covert[+e[0]] = e[1]; });
  Object.entries(fd).forEach(function(e) { flooder[+e[0]] = e[1]; });
  Object.entries(sd).forEach(function(e) { state[+e[0]] = e[1]; });
  Object.entries(od).forEach(function(e) { organic[+e[0]] = e[1]; });
  var labels = [];
  for (var i = 0; i < DAYS; i++) labels.push(dayLabel(i));
  var events = [
    { day:25, label:'Jan 27', badge:null, badgeBg:null, badgeColor:null, title:'Goma falls, no network surge', body:'M23 and the RDF enter Goma. Global headlines follow. The covert network does not activate, there is no institutional decision to target. Absence here is analytically significant: organic grief or solidarity would have spiked. This operation did not.', accent:'#b0a99e' },
    { day:32, label:'Feb 3–6', badge:'Wave 1', badgeBg:'#f5e3de', badgeColor:'#7D1F1F', title:'#TshisekediFDLR surges', body:'First Lady Denise Nyakeru visits wounded FARDC soldiers at Camp Kokolo. The network reframes the visit as proof of FDLR collaboration, 143 posts, 12 accounts, @DeniseNyakeru tagged 28 times.', accent:'#8B2020' },
    { day:46, label:'Feb 16', badge:null, badgeBg:null, badgeColor:null, title:'Bukavu falls, again no surge', body:'M23 takes Bukavu, capital of South Kivu. The network stays quiet. Military events do not trigger activation. Only open institutional decision windows do.', accent:'#b0a99e' },
    { day:50, label:'Feb 20–21', badge:null, badgeBg:null, badgeColor:null, title:'US sanctions + UNSC Res. 2773', body:'US Treasury sanctions James Kabarebe and Lawrence Kanyuka. The Security Council unanimously adopts Resolution 2773. The network stays quiet, these decisions have already been made. It operates pre-emptively, not reactively.', accent:'#2a5fa8' },
    { day:54, label:'Feb 24', badge:null, badgeBg:null, badgeColor:null, title:'EU sanctions vote postponed', body:'One member state blocks the EU Foreign Affairs Council vote. The decision is rescheduled for March 17. The network now has three more weeks before the next decision point, and Wave 2 fires within days.', accent:'#2a5fa8' },
    { day:58, label:'Feb 28–Mar 1', badge:'Wave 2', badgeBg:'#f5e3de', badgeColor:'#7D1F1F', title:'#TshisekediAgainstPeace', body:'Six accounts activate within a two-hour window. NKOTANYI1_ posts 21 tweets in 30 seconds. 145 posts across 20 accounts invert Resolution 2773\'s logic: "the UN sanctioned the wrong side."', accent:'#8B2020' },
    { day:68, label:'~Mar 10–12', badge:null, badgeBg:null, badgeColor:null, title:'FARDC strikes Minembwe airfield', body:'FARDC strikes Minembwe, held by M23-aligned Twirwaneho. M23 president Bisimwa accuses FARDC of targeting Banyamulenge civilians. This statement becomes the raw material for Wave 3, reproduced almost verbatim but stripped of its military context.', accent:'#b84428' },
    { day:73, label:'Mar 15–16', badge:'Wave 3, largest', badgeBg:'#f5e3de', badgeColor:'#7D1F1F', title:'#TshisekediIsKilling peaks', body:'121 posts on March 15 alone, two days before the EU vote. Nearly every post opens with @UN @EUCouncil. Script line numbers "1." and "45." published accidentally, exposing a centralised master list of at least 45 entries. #CongolaisTelema hijacked at scale.', accent:'#8B2020' },
    { day:75, label:'Mar 17–18', badge:null, badgeBg:null, badgeColor:null, title:'EU sanctions + Doha meeting', body:'EU designates nine Rwandan and M23 figures and the Gasabo Gold Refinery. Rwanda severs diplomatic relations with Belgium the same day. Tshisekedi and Kagame meet in Doha. The network\'s primary target has passed.', accent:'#2a5fa8' },
    { day:78, label:'Mar 19–21', badge:'Wave 4', badgeBg:'#f5e3de', badgeColor:'#7D1F1F', title:'Residual Minembwe narrative', body:'A smaller residual wave continues the Minembwe airstrip narrative. With no live institutional decision point remaining, output collapses to 26 posts across 8 accounts. The network had no interest in the news cycle, only in the windows around decisions.', accent:'#8B2020' },
    { day:85, label:'Mar 22–30', badge:null, badgeBg:null, badgeColor:null, title:'CongolaisTelema peaks', body:'245 posts on March 30 alone. CongolaisTelema reaches 1.5 million views in its peak week. Struggles_23, the covert network\'s most persistent account, continues injecting genocide accusations into #CongolaisTelema through the final day of the dataset.', accent:'#2e7a52' }
  ];
  var keyEventDays = [25, 50, 54, 68, 75];
  var scrubPlugin = {
    id: 'scrub',
    afterDraw: function(chart) {
      var idx = parseInt(document.getElementById('waveSlider').value);
      var meta = chart.getDatasetMeta(0);
      if (!meta.data[idx]) return;
      var x = meta.data[idx].x;
      var top = chart.chartArea.top;
      var bottom = chart.chartArea.bottom;
      var c = chart.ctx;
      c.save();
      c.beginPath();
      c.setLineDash([3,3]);
      c.strokeStyle = 'rgba(139,32,32,0.6)';
      c.lineWidth = 1.5;
      c.moveTo(x, top);
      c.lineTo(x, bottom);
      c.stroke();
      c.beginPath();
      c.arc(x, top+5, 4, 0, Math.PI*2);
      c.fillStyle = '#8B2020';
      c.fill();
      c.restore();
    }
  };
  var evtPlugin = {
    id: 'evtLines',
    afterDraw: function(chart) {
      var meta = chart.getDatasetMeta(0);
      var top = chart.chartArea.top;
      var bottom = chart.chartArea.bottom;
      var c = chart.ctx;
      keyEventDays.forEach(function(day) {
        if (!meta.data[day]) return;
        var x = meta.data[day].x;
        c.save();
        c.beginPath();
        c.setLineDash([4,4]);
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
  var chart = new Chart(document.getElementById('waveChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label:'Covert network', data:covert, borderColor:'#8B2020', borderWidth:2.5, pointRadius:0, tension:0.3, fill:false },
        { label:'Flooder', data:flooder, borderColor:'#8a6e1e', borderWidth:1.5, pointRadius:0, tension:0.3, fill:false, borderDash:[4,3] },
        { label:'State', data:state, borderColor:'#2a5fa8', borderWidth:1.5, pointRadius:0, tension:0.3, fill:false },
        { label:'Organic', data:organic, borderColor:'#7a7468', borderWidth:1.5, pointRadius:0, tension:0.3, fill:false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode:'none' },
      plugins: { legend:{ display:false }, tooltip:{ enabled:false } },
      scales: {
        x: { ticks:{ maxTicksLimit:8, color:'#7a7468', font:{size:10}, maxRotation:0 }, grid:{ color:'rgba(212,207,198,0.3)' } },
        y: { max:150, min:0, ticks:{ color:'#7a7468', font:{size:10}, stepSize:50 }, grid:{ color:'rgba(212,207,198,0.3)' }, title:{ display:true, text:'Posts per day', color:'#7a7468', font:{size:10} } }
      }
    }
  });
  function findEvent(day) {
    var best = null, bestDist = 999;
    events.forEach(function(e) {
      var dist = Math.abs(e.day - day);
      if (dist < bestDist) { bestDist = dist; best = e; }
    });
    return bestDist <= 5 ? best : null;
  }
  function updatePanel(day) {
    document.getElementById('waveDateLabel').textContent = dayLabel(day);
    var ev = findEvent(day);
    var panel = document.getElementById('waveEventPanel');
    if (ev) {
      document.getElementById('wepDate').textContent = ev.label;
      var badge = document.getElementById('wepBadge');
      if (ev.badge) {
        badge.textContent = ev.badge;
        badge.style.display = 'inline-block';
        badge.style.background = ev.badgeBg;
        badge.style.color = ev.badgeColor;
      } else {
        badge.style.display = 'none';
      }
      document.getElementById('wepTitle').textContent = ev.title;
      document.getElementById('wepBody').textContent = ev.body;
      panel.style.borderLeftColor = ev.accent;
    } else {
      document.getElementById('wepDate').textContent = dayLabel(day);
      document.getElementById('wepBadge').style.display = 'none';
      document.getElementById('wepTitle').textContent = 'Quiet period';
      document.getElementById('wepBody').textContent = 'The covert network was largely inactive here, baseline seeding posture, low volume, no institutional targeting. Activity between the waves reflects the cost of maintaining dormant accounts rather than any operational intent.';
      panel.style.borderLeftColor = '#d4cfc6';
    }
    chart.update('none');
  }
  document.getElementById('waveSlider').addEventListener('input', function() {
    updatePanel(parseInt(this.value));
  });
  updatePanel(32);
})();

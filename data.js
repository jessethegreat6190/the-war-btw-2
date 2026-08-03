window.TWB = (function () {
  "use strict";

  var TIMELINE_CATEGORIES = ["Covert network", "Anti-Kagame flooder", "CongolaisTelema", "Organic"];

  var chartData = {
    dates: [
      "Jan 2","Jan 3","Jan 4","Jan 5","Jan 6","Jan 7","Jan 8","Jan 9","Jan 10",
      "Jan 11","Jan 12","Jan 13","Jan 14","Jan 15","Jan 16","Jan 17","Jan 18","Jan 19","Jan 20",
      "Jan 21","Jan 22","Jan 23","Jan 24","Jan 25","Jan 26","Jan 27","Jan 28","Jan 29","Jan 30","Jan 31",
      "Feb 1","Feb 2","Feb 3","Feb 4","Feb 5","Feb 6","Feb 7","Feb 8","Feb 9","Feb 10",
      "Feb 11","Feb 12","Feb 13","Feb 14","Feb 15","Feb 16","Feb 17","Feb 18","Feb 19","Feb 20",
      "Feb 21","Feb 22","Feb 23","Feb 24","Feb 25","Feb 26","Feb 27","Feb 28",
      "Mar 1","Mar 2","Mar 3","Mar 4","Mar 5","Mar 6","Mar 7","Mar 8","Mar 9","Mar 10",
      "Mar 11","Mar 12","Mar 13","Mar 14","Mar 15","Mar 16","Mar 17","Mar 18","Mar 19","Mar 20",
      "Mar 21","Mar 22","Mar 23","Mar 24","Mar 25","Mar 26","Mar 27","Mar 28","Mar 29","Mar 30"
    ],
    covert: [
      0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,
      2,4,75,18,16,8,5,3,0,0,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,3,0,0,3,100,
      15,12,0,0,0,0,0,0,0,0,
      0,0,0,5,121,135,18,12,16,8,
      5,0,0,0,0,3,5,3,0,0
    ],
    flooder: [
      0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,3,5,18,15,
      12,8,6,0,0,0,0,0,0,0,
      0,0,3,4,5,4,3,0,0,0,
      0,0,0,0,0,0,5,7,
      8,6,0,0,0,0,0,0,0,0,
      0,4,5,6,8,10,8,7,0,0,
      0,0,0,0,0,12,15,18,20,21
    ],
    state: [
      0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      2,3,5,8,12,20,35,60,150,0
    ],
    organic: [
      0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,0,0,0,2,3,0,0,0,
      4,5,6,0,0,0,0,0,0,0,
      0,0,0,3,5,0,0,0,0,0,
      0,0,0,0,0,0,4,6,
      0,0,0,0,0,0,0,0,0,0,
      0,0,0,8,12,10,8,0,0,0,
      6,8,12,18,28,38,55,50,140,0
    ],
    events: [
      { day: 25, label: "Jan 27", badge: "", title: "Goma falls \u2014 no network surge",
        body: "M23 and the RDF enter Goma. Global headlines follow. The covert network does not activate \u2014 there is no institutional decision to target." },
      { day: 32, label: "Feb 3\u20136", badge: "Wave 1", title: "#TshisekediFDLR surges",
        body: "First Lady Denise Nyakeru visits wounded FARDC soldiers. The network reframes the visit as proof of FDLR collaboration." },
      { day: 46, label: "Feb 16", badge: "", title: "Bukavu falls \u2014 again no surge",
        body: "M23 takes Bukavu. The network stays quiet. Military events do not trigger activation. Only open institutional decision windows do." },
      { day: 54, label: "Feb 24", badge: "", title: "EU sanctions vote postponed",
        body: "One member state blocks the EU Foreign Affairs Council vote. Rescheduled for March 17. Wave 2 fires within days." },
      { day: 58, label: "Feb 28\u2013Mar 1", badge: "Wave 2", title: "#TshisekediAgainstPeace",
        body: "Six accounts activate within a two-hour window. 145 posts across 20 accounts." },
      { day: 68, label: "~Mar 10\u201312", badge: "", title: "FARDC strikes Minembwe airfield",
        body: "FARDC strikes Minembwe, held by M23-aligned Twirwaneho. This becomes the raw material for Wave 3." },
      { day: 73, label: "Mar 15\u201316", badge: "Wave 3 \u2014 largest", title: "#TshisekediIsKilling peaks",
        body: "121 posts on March 15 alone, two days before the EU vote. Script line numbers \u201c1.\u201d and \u201c45.\u201d published accidentally." },
      { day: 75, label: "Mar 17\u201318", badge: "", title: "EU sanctions + Doha meeting",
        body: "EU designates nine Rwandan and M23 figures and the Gasabo Gold Refinery. Tshisekedi and Kagame meet in Doha." },
      { day: 85, label: "Mar 22\u201330", badge: "", title: "CongolaisTelema peaks",
        body: "245 posts on March 30 alone. 1.5 million views in peak week." }
    ],
    eventDays: [25, 50, 54, 68, 75]
  };

  return { chartData, TIMELINE_CATEGORIES };
})();

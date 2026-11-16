// Shorts datenschutzfreundlich (Zwei-Klick-Lösung): Bis zum Klick wird nur das lokale Vorschaubild gezeigt.
// 1. Klick: Hinweis direkt am Video (Google, IP-Adresse, USA, Google-Konto) mit „Video laden“.
// 2. Klick auf „Video laden“: erst jetzt lädt der Player von youtube-nocookie.com. Nichts wird gespeichert.
// Ohne JavaScript bleibt ein normaler Link zu YouTube.
// Zweisprachig nur auf /formnext/: Sprache steht in html[lang] (de/en), Titel in data-titel-en. Alle anderen Seiten bleiben deutsch.
(function () {
  var fuss = document.querySelector('.fuss a[href*="datenschutz/"]');
  var dsLink = fuss ? fuss.getAttribute("href") : "/datenschutz/index.html";
  var TX = {
    de: {
      text: "Abspielen lädt das Video von YouTube (Google). Dabei werden u. a. deine IP-Adresse und die besuchte Seite an Google übertragen, " +
        "auch in die USA, und Google kann das mit deinem Google-Konto verknüpfen.",
      mehr: "Mehr in der Datenschutzerklärung.", laden: "▶ Video laden", abbruch: "Abbrechen",
      gruppe: "Hinweis zu YouTube", knopf: ": Hinweis zu YouTube anzeigen", kurz: "YouTube-Short"
    },
    en: {
      text: "Playing loads the video from YouTube (Google). Your IP address and this page go to Google, also in the USA, " +
        "and Google may link them to your account.",
      mehr: "Privacy policy (German).", laden: "▶ Load video", abbruch: "Cancel",
      gruppe: "Notice about YouTube", knopf: ": show YouTube notice", kurz: "YouTube short"
    }
  };
  function t() { return TX[document.documentElement.lang === "en" ? "en" : "de"]; }
  var aktualisieren = [];

  document.querySelectorAll(".yt[data-id]").forEach(function (box) {
    var id = box.getAttribute("data-id");
    function titel() {
      return (document.documentElement.lang === "en" && box.getAttribute("data-titel-en")) || box.getAttribute("data-titel") || t().kurz;
    }
    var link = box.querySelector("a.yt-link");
    if (!link) return;
    var knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "yt-start";
    knopf.innerHTML = link.innerHTML;
    link.replaceWith(knopf);

    var frage = document.createElement("div");
    frage.className = "yt-frage";
    frage.hidden = true;
    frage.setAttribute("role", "group");
    var p = document.createElement("p");
    var text = document.createTextNode("");
    var mehr = document.createElement("a");
    mehr.href = dsLink + "#youtube";
    p.appendChild(text); p.appendChild(mehr);
    var laden = document.createElement("button");
    laden.type = "button"; laden.className = "yt-laden";
    var zurueck = document.createElement("button");
    zurueck.type = "button"; zurueck.className = "yt-abbruch";
    frage.appendChild(p); frage.appendChild(laden); frage.appendChild(zurueck);
    box.appendChild(frage);

    function beschriften() {
      var s = t();
      knopf.setAttribute("aria-label", titel() + s.knopf);
      frage.setAttribute("aria-label", s.gruppe);
      text.nodeValue = s.text + " ";
      mehr.textContent = s.mehr;
      laden.textContent = s.laden;
      zurueck.textContent = s.abbruch;
    }
    beschriften();
    aktualisieren.push(beschriften);

    knopf.addEventListener("click", function () { frage.hidden = false; laden.focus(); });
    zurueck.addEventListener("click", function () { frage.hidden = true; knopf.focus(); });
    laden.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&playsinline=1";
      f.title = titel();
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      frage.remove();
      knopf.replaceWith(f);
      aktualisieren.splice(aktualisieren.indexOf(beschriften), 1);
    });
  });
  document.addEventListener("fn-sprache", function () { aktualisieren.forEach(function (f) { f(); }); });
})();

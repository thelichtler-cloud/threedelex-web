// Shorts datenschutzfreundlich (Zwei-Klick-Lösung): Bis zum Klick wird nur das lokale Vorschaubild gezeigt.
// 1. Klick: Hinweis direkt am Video (Google, IP-Adresse, USA, Google-Konto) mit „Video laden“.
// 2. Klick auf „Video laden“: erst jetzt lädt der Player von youtube-nocookie.com. Nichts wird gespeichert.
// Ohne JavaScript bleibt ein normaler Link zu YouTube.
(function () {
  var fuss = document.querySelector('.fuss a[href*="datenschutz/"]');
  var dsLink = fuss ? fuss.getAttribute("href") : "/datenschutz/index.html";
  var TEXT = "Abspielen lädt das Video von YouTube (Google). Dabei werden u. a. deine IP-Adresse und die besuchte Seite an Google übertragen, " +
    "auch in die USA, und Google kann das mit deinem Google-Konto verknüpfen.";

  document.querySelectorAll(".yt[data-id]").forEach(function (box) {
    var id = box.getAttribute("data-id");
    var titel = box.getAttribute("data-titel") || "YouTube-Short";
    var link = box.querySelector("a.yt-link");
    if (!link) return;
    var knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "yt-start";
    knopf.setAttribute("aria-label", titel + ": Hinweis zu YouTube anzeigen");
    knopf.innerHTML = link.innerHTML;
    link.replaceWith(knopf);

    var frage = document.createElement("div");
    frage.className = "yt-frage";
    frage.hidden = true;
    frage.setAttribute("role", "group");
    frage.setAttribute("aria-label", "Hinweis zu YouTube");
    var p = document.createElement("p");
    p.textContent = TEXT + " ";
    var mehr = document.createElement("a");
    mehr.href = dsLink + "#youtube";
    mehr.textContent = "Mehr in der Datenschutzerklärung.";
    p.appendChild(mehr);
    var laden = document.createElement("button");
    laden.type = "button"; laden.className = "yt-laden"; laden.textContent = "▶ Video laden";
    var zurueck = document.createElement("button");
    zurueck.type = "button"; zurueck.className = "yt-abbruch"; zurueck.textContent = "Abbrechen";
    frage.appendChild(p); frage.appendChild(laden); frage.appendChild(zurueck);
    box.appendChild(frage);

    knopf.addEventListener("click", function () { frage.hidden = false; laden.focus(); });
    zurueck.addEventListener("click", function () { frage.hidden = true; knopf.focus(); });
    laden.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&playsinline=1";
      f.title = titel;
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      frage.remove();
      knopf.replaceWith(f);
    });
  });
})();

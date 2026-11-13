// Shorts datenschutzfreundlich: Bis zum Klick wird nur das lokale Vorschaubild gezeigt.
// Erst beim Klick lädt der Player von youtube-nocookie.com. Ohne JavaScript bleibt ein normaler Link zu YouTube.
document.querySelectorAll(".yt[data-id]").forEach(function (box) {
  var id = box.getAttribute("data-id");
  var titel = box.getAttribute("data-titel") || "YouTube-Short";
  var link = box.querySelector("a.yt-link");
  if (!link) return;
  var knopf = document.createElement("button");
  knopf.type = "button";
  knopf.setAttribute("aria-label", titel + " abspielen (lädt YouTube)");
  knopf.innerHTML = link.innerHTML;
  link.replaceWith(knopf);
  knopf.addEventListener("click", function () {
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0&playsinline=1";
    f.title = titel;
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    f.referrerPolicy = "strict-origin-when-cross-origin";
    knopf.replaceWith(f);
  });
});

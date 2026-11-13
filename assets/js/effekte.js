// threedelex – Effekte: Einblenden beim Scrollen, hochzählende Kennzahlen, Slider mit Punkten/Pfeilen/Autoplay.
// Alles ohne Bibliothek. Bei „Bewegung reduzieren“ gibt es kein Autoplay und kein Hochzählen.
(function () {
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Einblenden + Balken füllen, sobald sichtbar
  var ziele = document.querySelectorAll(".einblenden, .stufen, .schritte, [data-zahl]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("sichtbar");
        if (e.target.hasAttribute("data-zahl")) zaehlen(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    ziele.forEach(function (z) { io.observe(z); });
  } else {
    ziele.forEach(function (z) { z.classList.add("sichtbar"); });
  }

  function zaehlen(el) {
    var ziel = parseInt(el.getAttribute("data-zahl"), 10) || 0;
    if (ruhig || ziel === 0) { el.textContent = ziel; return; }
    var dauer = 1200, start = null;
    function schritt(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dauer, 1);
      el.textContent = Math.round(ziel * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(schritt);
    }
    requestAnimationFrame(schritt);
  }

  // Slider
  document.querySelectorAll(".slider").forEach(function (slider) {
    var spur = slider.querySelector(".slider-spur");
    var punkte = slider.querySelector(".punkte");
    var kinder = Array.prototype.slice.call(spur.children);
    if (!kinder.length) return;
    function proSeite() { return Math.max(1, Math.round(spur.clientWidth / kinder[0].getBoundingClientRect().width)); }
    function seiten() { return Math.max(1, kinder.length - proSeite() + 1); }
    function aktuell() { var w = kinder[0].getBoundingClientRect().width + 16; return Math.round(spur.scrollLeft / w); }
    function geheZu(i) {
      var n = seiten(); i = ((i % n) + n) % n;
      spur.scrollTo({ left: kinder[i].offsetLeft - kinder[0].offsetLeft, behavior: ruhig ? "auto" : "smooth" });
    }
    function punkteBauen() {
      if (!punkte) return;
      punkte.innerHTML = "";
      var n = seiten();
      slider.classList.toggle("eine-seite", n < 2);
      for (var i = 0; i < n; i++) {
        var b = document.createElement("button");
        b.type = "button"; b.setAttribute("aria-label", "Zu Bild " + (i + 1));
        (function (k) { b.addEventListener("click", function () { geheZu(k); neustart(); }); })(i);
        punkte.appendChild(b);
      }
      markieren();
    }
    function markieren() {
      if (!punkte) return;
      var a = aktuell();
      Array.prototype.forEach.call(punkte.children, function (b, i) { b.setAttribute("aria-current", i === a ? "true" : "false"); });
    }
    var vor = slider.querySelector("[data-vor]"), zurueck = slider.querySelector("[data-zurueck]");
    if (vor) vor.addEventListener("click", function () { geheZu(aktuell() + 1); neustart(); });
    if (zurueck) zurueck.addEventListener("click", function () { geheZu(aktuell() - 1); neustart(); });
    var timer = null;
    spur.addEventListener("scroll", function () { clearTimeout(timer); timer = setTimeout(markieren, 80); }, { passive: true });
    window.addEventListener("resize", punkteBauen);
    punkteBauen();

    // Autoplay: nur wenn erlaubt, pausiert bei Maus, Fokus, Berührung und verstecktem Tab
    var takt = parseInt(slider.getAttribute("data-autoplay") || "0", 10), uhr = null, pause = false;
    function neustart() { if (!takt || ruhig) return; clearInterval(uhr); uhr = setInterval(function () { if (!pause && !document.hidden && seiten() > 1) geheZu(aktuell() + 1); }, takt); }
    ["mouseenter", "focusin", "touchstart"].forEach(function (ev) { slider.addEventListener(ev, function () { pause = true; }, { passive: true }); });
    ["mouseleave", "focusout"].forEach(function (ev) { slider.addEventListener(ev, function () { pause = false; }); });
    neustart();
  });
})();

// ================= Effekte, Stufe 2 =================
(function () {
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var feinZeiger = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  // Wechselndes Wort
  document.querySelectorAll(".wechsel[data-woerter]").forEach(function (box) {
    var woerter = box.getAttribute("data-woerter").split("|"), i = 0, el = box.querySelector(".wort");
    if (ruhig || !el || woerter.length < 2) return;
    setInterval(function () {
      if (document.hidden) return;
      el.classList.remove("rein"); el.classList.add("raus");
      setTimeout(function () { i = (i + 1) % woerter.length; el.textContent = woerter[i]; el.classList.remove("raus"); el.classList.add("rein"); }, 340);
    }, 2600);
  });

  // Schwebende Teile: Parallax mit Maus (Desktop) bzw. Scrollen (Handy)
  var teile = document.querySelectorAll(".schwebe");
  if (teile.length && !ruhig) {
    var tiefe = [26, -34, 18];
    if (feinZeiger) {
      window.addEventListener("mousemove", function (e) {
        var x = e.clientX / window.innerWidth - .5, y = e.clientY / window.innerHeight - .5;
        teile.forEach(function (t, k) { t.style.setProperty("--px", (x * tiefe[k % 3]) + "px"); t.style.setProperty("--py", (y * tiefe[k % 3]) + "px"); });
      }, { passive: true });
    }
    window.addEventListener("scroll", function () {
      var s = window.scrollY;
      if (s > 900) return;
      teile.forEach(function (t, k) { t.style.setProperty("--py", (-s * (0.12 + k * 0.06)) + "px"); });
    }, { passive: true });
  }

  // Drehansicht: Bildfolge, ziehen zum Drehen, sonst langsam von selbst
  document.querySelectorAll(".drehbuehne[data-bilder]").forEach(function (b) {
    var muster = b.getAttribute("data-bilder"), n = parseInt(b.getAttribute("data-anzahl"), 10) || 36;
    var img = b.querySelector("img"), winkel = b.querySelector(".winkel"), bilder = [], pos = 0, geladen = false;
    function laden() {
      if (geladen) return; geladen = true;
      for (var i = 0; i < n; i++) { var im = new Image(); im.src = muster.replace("##", (i < 10 ? "0" : "") + i); bilder.push(im); }
    }
    function zeige(p) {
      pos = ((p % n) + n) % n;
      var k = Math.round(pos) % n;
      if (bilder[k]) img.src = bilder[k].src;
      if (winkel) winkel.textContent = String(Math.round(k * 360 / n)).padStart(3, "0") + "°";
    }
    var auto = !ruhig, sichtbar = false, start = null, startPos = 0, letzte = null;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; if (sichtbar) laden(); }, { rootMargin: "300px" }).observe(b);
    } else { laden(); sichtbar = true; }
    function takt(t) {
      if (auto && sichtbar && !document.hidden) { if (letzte !== null) zeige(pos + (t - letzte) / 140); }
      letzte = t; requestAnimationFrame(takt);
    }
    requestAnimationFrame(takt);
    b.addEventListener("pointerdown", function (e) { laden(); start = e.clientX; startPos = pos; auto = false; b.classList.add("benutzt"); b.setPointerCapture(e.pointerId); });
    b.addEventListener("pointermove", function (e) { if (start === null) return; zeige(startPos - (e.clientX - start) / (b.clientWidth / n) * 1.2); });
    ["pointerup", "pointercancel"].forEach(function (ev) { b.addEventListener(ev, function () { start = null; }); });
    b.tabIndex = 0;
    b.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { auto = false; zeige(pos - 1); b.classList.add("benutzt"); }
      if (e.key === "ArrowRight") { auto = false; zeige(pos + 1); b.classList.add("benutzt"); }
    });
  });

  // Lichtschein folgt der Maus auf Karten
  if (feinZeiger && !ruhig) {
    document.querySelectorAll(".projektkarte, .schritt, .kasten, .kachel").forEach(function (k) {
      k.classList.add("licht");
      k.addEventListener("mousemove", function (e) {
        var r = k.getBoundingClientRect();
        k.style.setProperty("--mx", (e.clientX - r.left) + "px"); k.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
      k.addEventListener("mouseleave", function () { k.style.setProperty("--mx", "-999px"); });
    });
  }
})();

// ================= Stufe 3: echtes 3D, Vorher/Nachher, Video, Analysen =================
(function () {
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // three.js erst bei Bedarf laden (lokal, ca. 640 KB)
  var libVersprechen = null;
  function ladeSkript(src) { return new Promise(function (ok, nein) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = nein; document.head.appendChild(s); }); }
  function ladeThree(basis) {
    if (!libVersprechen) libVersprechen = ladeSkript(basis + "three.min.js").then(function () {
      return Promise.all([ladeSkript(basis + "OrbitControls.js"), ladeSkript(basis + "STLLoader.js")]);
    });
    return libVersprechen;
  }

  function betrachter(box, stl, farbe) {
    var basis = box.getAttribute("data-lib");
    var status = box.querySelector(".status");
    if (status) status.textContent = "3D wird geladen …";
    return ladeThree(basis).then(function () {
      var T = window.THREE;
      var w = box.clientWidth, h = box.clientHeight;
      var r = new T.WebGLRenderer({ antialias: true, alpha: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); r.setSize(w, h);
      if (T.sRGBEncoding) r.outputEncoding = T.sRGBEncoding;
      var sc = new T.Scene();
      var cam = new T.PerspectiveCamera(35, w / h, 1, 5000);
      cam.up.set(0, 0, 1);
      sc.add(new T.HemisphereLight(0xdfe8ff, 0x1a2333, 0.75));
      var l1 = new T.DirectionalLight(0xffffff, 0.85); l1.position.set(1, -1.4, 2); sc.add(l1);
      var l2 = new T.DirectionalLight(0xffe2cc, 0.35); l2.position.set(-2, 1, 1); sc.add(l2);
      var ctl = new T.OrbitControls(cam, r.domElement);
      ctl.enableDamping = true; ctl.dampingFactor = 0.08; ctl.autoRotate = !ruhig; ctl.autoRotateSpeed = 1.6; ctl.enablePan = false;
      var mesh = null, gitter = null;
      function lade(url, col) {
        if (status) status.textContent = "Modell wird geladen …";
        new T.STLLoader().load(url, function (geo) {
          if (mesh) { sc.remove(mesh); mesh.geometry.dispose(); }
          if (gitter) sc.remove(gitter);
          geo.computeVertexNormals(); geo.computeBoundingBox();
          var bb = geo.boundingBox, mitte = new T.Vector3(); bb.getCenter(mitte);
          geo.translate(-mitte.x, -mitte.y, -bb.min.z);
          var groesse = new T.Vector3(); bb.getSize(groesse); var m = Math.max(groesse.x, groesse.y, groesse.z);
          mesh = new T.Mesh(geo, new T.MeshStandardMaterial({ color: col, roughness: 0.5, metalness: 0.05 }));
          sc.add(mesh);
          gitter = new T.GridHelper(m * 2.2, 22, 0x3b4f6e, 0x23344e); gitter.rotation.x = Math.PI / 2; sc.add(gitter);
          ctl.target.set(0, 0, groesse.z * 0.4);
          cam.position.set(m * 1.5, -m * 1.9, m * 1.35); cam.near = m / 100; cam.far = m * 50; cam.updateProjectionMatrix();
          ctl.minDistance = m * 0.8; ctl.maxDistance = m * 6; ctl.update(); ctl.saveState();
          if (status) status.textContent = Math.round(groesse.x) + " × " + Math.round(groesse.y) + " × " + Math.round(groesse.z) + " mm · ziehen, zoomen";
        }, undefined, function () { if (status) status.textContent = "Modell konnte nicht geladen werden"; });
      }
      var alt = box.querySelector(".vorschau"); if (alt) alt.remove();
      var knopf = box.querySelector(".start3d"); if (knopf) knopf.remove();
      box.classList.remove("wartet");
      box.insertBefore(r.domElement, box.firstChild);
      box._stl = stl; box._farbe = farbe;
      lade(stl, farbe);
      var sichtbar = true;
      if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { sichtbar = e[0].isIntersecting; }).observe(box);
      (function schleife() { requestAnimationFrame(schleife); if (!sichtbar || document.hidden) return; ctl.update(); r.render(sc, cam); })();
      window.addEventListener("resize", function () { var w2 = box.clientWidth, h2 = box.clientHeight; r.setSize(w2, h2); cam.aspect = w2 / h2; cam.updateProjectionMatrix(); });
      var wz = box.querySelector(".werkzeug3d");
      if (wz) {
        wz.hidden = false;
        wz.querySelector("[data-drehen]").addEventListener("click", function () { ctl.autoRotate = !ctl.autoRotate; });
        wz.querySelector("[data-zurueck3d]").addEventListener("click", function () { ctl.reset(); });
      }
      box._lade = function (url, col) { box._stl = url; box._farbe = col; lade(url, col); };
    }).catch(function () { if (status) status.textContent = "3D konnte nicht geladen werden"; });
  }

  document.querySelectorAll(".modell3d[data-stl]").forEach(function (box) {
    var stl = box.getAttribute("data-stl"), farbe = box.getAttribute("data-farbe") || "#3b82f6";
    var knopf = box.querySelector(".start3d");
    if (knopf) knopf.addEventListener("click", function () { betrachter(box, box._stl || stl, box._farbe || farbe); });
    var wahl = box.id ? document.querySelector('.modell-wahl[data-fuer="' + box.id + '"]') : null;
    if (wahl) wahl.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        wahl.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        var u = b.getAttribute("data-stl"), f = b.getAttribute("data-farbe") || farbe;
        if (box._lade) box._lade(u, f); else { box._stl = u; box._farbe = f; betrachter(box, u, f); }
      });
    });
  });

  // Drehbühne auf der Startseite: Knopf „Echtes 3D“ ersetzt die Bildfolge durch den 3D-Betrachter
  document.querySelectorAll("[data-echt3d]").forEach(function (k) {
    k.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    k.addEventListener("click", function (e) {
      e.stopPropagation();
      var alt = k.closest(".drehbuehne"), neu = document.createElement("div");
      neu.className = "modell3d"; neu.setAttribute("data-lib", k.getAttribute("data-lib"));
      neu.innerHTML = '<span class="status"></span><div class="werkzeug3d" hidden><button type="button" data-drehen aria-label="Automatisch drehen an oder aus">⟳</button><button type="button" data-zurueck3d aria-label="Ansicht zurücksetzen">⌂</button></div>';
      alt.replaceWith(neu);
      betrachter(neu, k.getAttribute("data-echt3d"), k.getAttribute("data-farbe") || "#3b82f6");
    });
  });

  // Vorher / Nachher
  document.querySelectorAll(".vergleich").forEach(function (v) {
    var r = v.querySelector('input[type="range"]');
    if (!r) return;
    function setze() { v.style.setProperty("--pos", r.value + "%"); }
    r.addEventListener("input", setze); setze();
    if (!ruhig && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) return; io.disconnect();
        var t0 = null;
        (function an(t) {
          if (t0 === null) t0 = t; var p = (t - t0) / 1400;
          if (p > 1) { r.value = 50; setze(); return; }
          r.value = 50 + Math.sin(p * Math.PI * 2) * 18 * (1 - p); setze(); requestAnimationFrame(an);
        })(performance.now());
      }, { threshold: 0.6 });
      io.observe(v);
    }
  });

  // Zeitraffer-Video: spielt stumm, sobald sichtbar; pausiert außerhalb
  document.querySelectorAll(".zr-video video").forEach(function (vid) {
    if (ruhig) { vid.removeAttribute("autoplay"); return; }
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause();
    }, { threshold: 0.4 }).observe(vid);
  });

  // Analysen: erst beim Klick laden (die Slice-Ansichten sind groß)
  document.querySelectorAll("[data-analyse]").forEach(function (k) {
    k.addEventListener("click", function () {
      var ziel = document.getElementById(k.getAttribute("data-ziel"));
      var url = k.getAttribute("data-analyse"), titel = k.getAttribute("data-titel") || "Analyse";
      ziel.innerHTML = '<div class="analyse-rahmen"><div class="leiste"><span>' + titel + '</span><span><a href="' + url + '" target="_blank" rel="noopener">Vollbild ↗</a> &nbsp; <button type="button">Schließen ✕</button></span></div><iframe loading="lazy" title="' + titel + '" src="' + url + '"></iframe></div>';
      ziel.querySelector("button").addEventListener("click", function () { ziel.innerHTML = ""; });
      ziel.scrollIntoView({ behavior: ruhig ? "auto" : "smooth", block: "start" });
    });
  });
})();

// FieldCraft-Vergleiche: Stufen links/rechts wählen
document.querySelectorAll(".vergleich-wahl").forEach(function (w) {
  var v = document.getElementById(w.getAttribute("data-fuer"));
  if (!v) return;
  var stufen = JSON.parse(v.getAttribute("data-stufen"));
  w.querySelectorAll("select").forEach(function (s) {
    s.addEventListener("change", function () {
      var st = stufen[parseInt(s.value, 10)], links = s.getAttribute("data-seite") === "l";
      var img = links ? v.querySelector(":scope > img") : v.querySelector(".nachher img");
      img.src = st[1]; img.alt = st[0];
      v.querySelector(links ? ".etikett-v.l" : ".etikett-v.r").textContent = st[0];
    });
  });
});

// Schieber groß ansehen: Knopf an jedem Vergleich, Ebene über der Seite
(function () {
  document.querySelectorAll(".vergleich").forEach(function (v) {
    var k = document.createElement("button");
    k.type = "button"; k.className = "gross-knopf"; k.innerHTML = "⤢ Groß"; k.setAttribute("aria-label", "Vergleich groß ansehen");
    v.appendChild(k);
    k.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); oeffnen(v); });
  });
  function oeffnen(v) {
    var block = v.closest(".fea") || v;                 // bei FieldCraft mit Titel, Auswahl, Skala und Text
    var platz = document.createComment("platz"); block.parentNode.insertBefore(platz, block);
    var ebene = document.createElement("div"); ebene.className = "gross-ebene"; ebene.setAttribute("role", "dialog"); ebene.setAttribute("aria-modal", "true");
    var inhalt = document.createElement("div"); inhalt.className = "gross-inhalt";
    var zu = document.createElement("button"); zu.type = "button"; zu.className = "gross-zu"; zu.textContent = "✕ Schließen";
    var kinder = block === v ? [v] : Array.prototype.slice.call(block.children);
    kinder.forEach(function (c) { inhalt.appendChild(c); });
    ebene.appendChild(inhalt); ebene.appendChild(zu); document.body.appendChild(ebene); document.body.classList.add("ebene-offen");
    var img = v.querySelector(":scope > img");
    function groesse() {   // so breit wie möglich, aber ganz sichtbar
      var r = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 1.5;
      var platzH = window.innerHeight - (inhalt.offsetHeight - v.offsetHeight) - 90;
      v.style.width = Math.max(260, Math.min(inhalt.clientWidth, platzH * r)) + "px";
    }
    groesse(); if (!img.complete) img.addEventListener("load", groesse, { once: true });
    window.addEventListener("resize", groesse);
    function schliessen() {
      window.removeEventListener("resize", groesse); document.removeEventListener("keydown", taste);
      v.style.width = "";
      if (block === v) platz.parentNode.insertBefore(v, platz);
      else kinder.forEach(function (c) { block.appendChild(c); });
      platz.remove(); ebene.remove(); document.body.classList.remove("ebene-offen");
      var g = v.querySelector(".gross-knopf"); if (g) g.focus();
    }
    function taste(e) { if (e.key === "Escape") schliessen(); }
    zu.addEventListener("click", schliessen);
    ebene.addEventListener("click", function (e) { if (e.target === ebene) schliessen(); });
    document.addEventListener("keydown", taste);
    zu.focus();
  }
})();

// Der Weg: Schritt antippen → sanft zum Abschnitt scrollen und ihn kurz hervorheben
document.querySelectorAll("a[data-sprung]").forEach(function (a) {
  a.addEventListener("click", function (e) {
    var ziel = document.querySelector(a.getAttribute("href"));
    if (!ziel) return;
    e.preventDefault();
    var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Einblenden sofort fertig, sonst verschiebt sich das Ziel während des Scrollens
    var liste = Array.prototype.slice.call(ziel.querySelectorAll(".einblenden")); if (ziel.classList.contains("einblenden")) liste.push(ziel);
    liste.forEach(function (x) { x.style.transition = "none"; x.classList.add("sichtbar"); });
    void ziel.offsetWidth; liste.forEach(function (x) { x.style.transition = ""; });
    ziel.scrollIntoView({ behavior: ruhig ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", a.getAttribute("href"));
    ziel.classList.remove("ziel-blitz"); void ziel.offsetWidth; ziel.classList.add("ziel-blitz");
    setTimeout(function () { ziel.classList.remove("ziel-blitz"); }, 1900);
  });
});

// ============================================================
// T.T.DEVELOPPEMENT — JavaScript
// Menu mobile, reveal au scroll, compteurs, jauges, terminal,
// scrollspy, barre de progression, glow cartes, bouton magnétique,
// copie d'email, back-to-top.
// ============================================================

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Année dynamique ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
      });
    });
  }

  /* ---------- Barre de progression de lecture ---------- */
  const progress = document.getElementById("scroll-progress");
  if (progress) {
    const onScroll = function () {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      progress.style.width = (scrolled * 100).toFixed(1) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Bouton retour en haut ---------- */
  const backTop = document.getElementById("back-to-top");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Compteurs animés ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Jauges Lighthouse ---------- */
  const CIRC = 327; // 2π·52
  function animateGauge(fig) {
    const value = parseFloat(fig.dataset.gauge);
    const fill = fig.querySelector(".gauge-fill");
    if (!fill) return;
    const offset = CIRC - (value / 100) * CIRC;
    if (reduceMotion) { fill.style.strokeDashoffset = String(offset); return; }
    requestAnimationFrame(function () { fill.style.strokeDashoffset = String(offset); });
  }

  /* ---------- Reveal + déclencheurs au scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("is-visible");
        el.querySelectorAll(".count").forEach(animateCount);
        if (el.matches(".gauge")) animateGauge(el);
        el.querySelectorAll(".gauge").forEach(animateGauge);
        obs.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });

    // Jauges hors conteneur reveal : observe-les individuellement
    document.querySelectorAll(".gauge").forEach(function (g) {
      io.observe(g);
    });
  } else {
    // Repli : tout afficher
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    document.querySelectorAll(".count").forEach(animateCount);
    document.querySelectorAll(".gauge").forEach(animateGauge);
  }

  /* ---------- Scrollspy ---------- */
  const spyLinks = Array.from(document.querySelectorAll(".nav-menu a[data-spy]"));
  const sections = spyLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        spyLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Glow des cartes suivant le curseur ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".glow-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    /* ---------- Boutons magnétiques ---------- */
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      const strength = 0.3;
      btn.addEventListener("pointermove", function (e) {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + x * strength + "px," + y * strength + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Terminal animé (typing) ---------- */
  const codeEl = document.getElementById("terminal-code");
  const caretEl = document.getElementById("terminal-caret");
  if (codeEl) {
    const lines = [
      { t: "$ ", c: "npm create site-vitrine", cls: "tok-cmd", lead: "tok-prompt" },
      { t: "✓ Design sur-mesure généré", cls: "tok-ok" },
      { t: "✓ Optimisation SEO & performance", cls: "tok-ok" },
      { t: "✓ Responsive mobile / tablette / desktop", cls: "tok-ok" },
      { t: "$ ", c: "deploy --prod", cls: "tok-cmd", lead: "tok-prompt" },
      { t: "→ En ligne en 48h. Score Lighthouse 100.", cls: "tok-dim" },
    ];

    if (reduceMotion) {
      // Affiche tout, sans animation
      codeEl.innerHTML = lines.map(function (l) {
        const lead = l.lead ? '<span class="' + l.lead + '">' + l.t + "</span>" : "";
        const body = l.c ? '<span class="' + l.cls + '">' + l.c + "</span>" : '<span class="' + l.cls + '">' + l.t + "</span>";
        return lead + body;
      }).join("\n");
      if (caretEl) caretEl.style.display = "none";
    } else {
      let li = 0;
      function typeLine() {
        if (li >= lines.length) {
          // Boucle douce après une pause
          setTimeout(function () { codeEl.innerHTML = ""; li = 0; typeLine(); }, 4000);
          return;
        }
        const l = lines[li];
        const full = (l.lead ? "" : "") + (l.c ? l.t + l.c : l.t);
        const wrapStart = function (txt) {
          if (l.c) {
            return '<span class="' + (l.lead || "") + '">' + l.t + '</span><span class="' + l.cls + '">' + l.c.slice(0, txt.length - l.t.length) + "</span>";
          }
          return '<span class="' + l.cls + '">' + txt + "</span>";
        };
        let i = 0;
        const prefix = codeEl.innerHTML;
        function typeChar() {
          i++;
          const current = full.slice(0, i);
          codeEl.innerHTML = prefix + wrapStart(current);
          if (i < full.length) {
            setTimeout(typeChar, 22 + Math.random() * 30);
          } else {
            codeEl.innerHTML = prefix + wrapStart(full) + "\n";
            li++;
            setTimeout(typeLine, 380);
          }
        }
        typeChar();
      }
      // Démarre quand le terminal entre dans le viewport
      const term = document.querySelector(".terminal");
      if (term && "IntersectionObserver" in window) {
        const tio = new IntersectionObserver(function (entries, obs) {
          if (entries[0].isIntersecting) { typeLine(); obs.disconnect(); }
        }, { threshold: 0.3 });
        tio.observe(term);
      } else {
        typeLine();
      }
    }
  }

  /* ---------- Copie d'email ---------- */
  const copyBtn = document.getElementById("copy-email");
  if (copyBtn) {
    const feedback = document.getElementById("copy-feedback");
    copyBtn.addEventListener("click", function () {
      const email = copyBtn.dataset.email;
      const done = function () {
        if (feedback) {
          feedback.textContent = "Copié !";
          setTimeout(function () { feedback.textContent = ""; }, 2000);
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () {
          window.location.href = "mailto:" + email;
        });
      } else {
        window.location.href = "mailto:" + email;
      }
    });
  }
})();

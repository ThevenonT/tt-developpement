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

  /* ---------- Valeur numérique animée (générique, avec Promise) ---------- */
  function animateValue(el, from, to, duration, suffix) {
    return new Promise(function (resolve) {
      if (reduceMotion) { el.textContent = to + suffix; resolve(); return; }
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (to - from) * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick); else resolve();
      })(performance.now());
    });
  }

  /* ---------- Bascule de prix 800 € -> 600 € (offre de bienvenue) ---------- */
  let pricePromoDone = false;
  function runPricePromo() {
    if (pricePromoDone) return;
    pricePromoDone = true;
    const hpNew = document.getElementById("hp-new");
    const hpOld = document.getElementById("hp-old");
    const offer = document.getElementById("stat-offer");
    if (!hpNew || !hpOld || !offer) return;
    const EUR = " €";

    if (reduceMotion) {
      hpOld.textContent = "800" + EUR; hpOld.classList.add("show");
      hpNew.textContent = "600" + EUR; hpNew.classList.add("promo");
      offer.classList.add("show");
      return;
    }

    animateValue(hpNew, 0, 800, 1200, EUR)
      .then(function () { return new Promise(function (r) { setTimeout(r, 1000); }); })
      .then(function () {
        hpOld.textContent = "800" + EUR;
        hpOld.classList.add("show");
        hpNew.classList.add("promo");
        return animateValue(hpNew, 800, 600, 900, EUR);
      })
      .then(function () { offer.classList.add("show"); });
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
        if (el.querySelector("#hp-new")) runPricePromo();
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
    runPricePromo();
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

  /* ---------- Formulaire de contact ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = document.getElementById("form-status");
    const honeypot = form.querySelector("#website");

    const validators = {
      name: function (v) { return v.trim() ? "" : "Merci d'indiquer votre nom."; },
      email: function (v) {
        if (!v.trim()) return "Merci d'indiquer votre email.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Cet email ne semble pas valide.";
      },
      message: function (v) {
        if (!v.trim()) return "Merci de décrire votre projet.";
        return v.trim().length < 10 ? "Quelques mots de plus seraient utiles (10 caractères min)." : "";
      },
      consent: function (_v, el) {
        return el && el.checked ? "" : "Merci d'accepter pour pouvoir vous répondre.";
      },
    };

    function setError(field, msg) {
      const input = form.querySelector("#" + field);
      const errEl = document.getElementById(field + "-error");
      if (errEl) errEl.textContent = msg;
      if (input && input.type !== "checkbox") {
        if (msg) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
    }

    // Validation au blur / changement
    Object.keys(validators).forEach(function (field) {
      const input = form.querySelector("#" + field);
      if (!input) return;
      const evt = input.type === "checkbox" ? "change" : "blur";
      input.addEventListener(evt, function () {
        setError(field, validators[field](input.value, input));
      });
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true") {
          setError(field, validators[field](input.value, input));
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      status.className = "form-status";

      if (honeypot && honeypot.value) return; // bot

      let firstInvalid = null;
      Object.keys(validators).forEach(function (field) {
        const input = form.querySelector("#" + field);
        const msg = validators[field](input.value, input);
        setError(field, msg);
        if (msg && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        status.textContent = "Merci de corriger les champs indiqués.";
        status.classList.add("error-msg");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi en cours…";

      const val = function (id) {
        const el = form.querySelector("#" + id);
        return el ? el.value : "";
      };
      const payload = {
        name: val("name"),
        email: val("email"),
        phone: val("phone"),
        company: val("company"),
        sector: val("sector"),
        offer: val("offer"),
        googleMaps: (form.querySelector('input[name="googleMaps"]:checked') || {}).value || "",
        message: val("message"),
        consent: form.querySelector("#consent").checked,
        website: honeypot ? honeypot.value : "",
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (r) {
          if (r.ok) {
            form.reset();
            status.textContent = "Merci ! Votre demande a bien été envoyée, je vous réponds rapidement.";
            status.classList.add("success");
          } else {
            status.textContent = (r.data && r.data.error) || "L'envoi a échoué. Réessayez ou écrivez-moi directement.";
            status.classList.add("error-msg");
          }
        })
        .catch(function () {
          status.textContent = "Connexion impossible. Vérifiez votre réseau ou écrivez-moi directement.";
          status.classList.add("error-msg");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Envoyer ma demande";
        });
    });
  }
})();

// ============================================================
// T.T.DEVELOPPEMENT — JavaScript
// Menu mobile, année dynamique, validation du formulaire
// ============================================================

(function () {
  "use strict";

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
    });

    // Ferme le menu après un clic sur un lien (mobile)
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
      });
    });
  }

  /* ---------- Année dynamique du footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Validation du formulaire ---------- */
  const form = document.getElementById("contact-form");
  if (!form) return;

  const status = document.getElementById("form-status");
  const honeypot = form.querySelector("#website");

  const validators = {
    name: function (value) {
      if (!value.trim()) return "Merci d'indiquer votre nom.";
      return "";
    },
    email: function (value) {
      if (!value.trim()) return "Merci d'indiquer votre email.";
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value.trim())) return "Cet email ne semble pas valide.";
      return "";
    },
    message: function (value) {
      if (!value.trim()) return "Merci de décrire votre projet.";
      if (value.trim().length < 10) return "Quelques mots de plus seraient utiles (10 caractères min).";
      return "";
    },
  };

  function setFieldError(field, message) {
    const input = form.querySelector("#" + field);
    const errorEl = document.getElementById(field + "-error");
    if (!input || !errorEl) return;
    errorEl.textContent = message;
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }

  // Validation au blur (et non à chaque frappe)
  Object.keys(validators).forEach(function (field) {
    const input = form.querySelector("#" + field);
    if (!input) return;
    input.addEventListener("blur", function () {
      setFieldError(field, validators[field](input.value));
    });
    // Efface l'erreur dès que l'utilisateur corrige
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") {
        setFieldError(field, validators[field](input.value));
      }
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    status.className = "form-status";

    // Anti-spam : si le honeypot est rempli, on ignore silencieusement
    if (honeypot && honeypot.value) return;

    let firstInvalid = null;
    Object.keys(validators).forEach(function (field) {
      const input = form.querySelector("#" + field);
      const message = validators[field](input.value);
      setFieldError(field, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      status.textContent = "Merci de corriger les champs indiqués.";
      status.classList.add("error-msg");
      return;
    }

    // Démo : pas de back-end. On simule un envoi réussi.
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Envoi en cours…";

    setTimeout(function () {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "Envoyer ma demande";
      status.textContent = "Merci ! Votre demande a bien été prise en compte, je vous réponds rapidement.";
      status.classList.add("success");
    }, 700);
  });
})();

// Fonction serverless Vercel — réception du formulaire de contact.
// Envoie un email via l'API Resend (https://resend.com) en appel HTTP direct,
// sans dépendance npm (fetch natif disponible sur le runtime Node de Vercel).
//
// Variables d'environnement à configurer dans Vercel (Settings > Environment Variables) :
//   RESEND_API_KEY     (obligatoire) — clé API Resend
//   CONTACT_TO_EMAIL   (optionnel)   — adresse qui reçoit les demandes
//   CONTACT_FROM_EMAIL (optionnel)   — expéditeur (domaine vérifié Resend)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  const data = req.body && typeof req.body === "object" ? req.body : {};
  const {
    name, email, phone, company, sector, offer, hasSite, message, consent, website,
  } = data;

  // Honeypot : si ce champ caché est rempli, c'est un bot — on ignore en silence.
  if (website) return res.status(200).json({ ok: true });

  // Validation côté serveur (ne jamais faire confiance au client).
  const emailOk = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk || !message || !consent) {
    return res.status(400).json({ error: "Champs obligatoires manquants ou invalides." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || "contact@ttdeveloppement.fr";
  const from = process.env.CONTACT_FROM_EMAIL || "T.T.DEV <onboarding@resend.dev>";

  if (!apiKey) {
    return res.status(500).json({ error: "Service d'envoi non configuré (RESEND_API_KEY manquante)." });
  }

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const row = (label, value) => `<tr>
      <td style="padding:6px 12px;color:#64748b;white-space:nowrap;">${label}</td>
      <td style="padding:6px 12px;color:#0f172a;font-weight:600;">${esc(value) || "—"}</td>
    </tr>`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;">
      <h2 style="color:#16a34a;">Nouvelle demande — T.T.DEVELOPPEMENT</h2>
      <table style="border-collapse:collapse;width:100%;">
        ${row("Nom", name)}
        ${row("Email", email)}
        ${row("Téléphone", phone)}
        ${row("Entreprise / activité", company)}
        ${row("Secteur", sector)}
        ${row("Offre visée", offer)}
        ${row("A déjà un site", hasSite)}
      </table>
      <p style="margin-top:16px;color:#64748b;">Projet :</p>
      <p style="color:#0f172a;line-height:1.6;">${esc(message).replace(/\n/g, "<br>")}</p>
    </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Nouvelle demande de ${name}`,
        html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error("Resend error:", r.status, detail);
      return res.status(502).json({ error: "L'envoi a échoué. Réessayez ou écrivez-moi directement." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact handler error:", err);
    return res.status(500).json({ error: "Erreur serveur. Réessayez plus tard." });
  }
}

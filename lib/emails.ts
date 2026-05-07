import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'noreply@dp.lu'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:20px;}
  .container{max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;}
  .header{background:#7c3aed;padding:24px;text-align:center;}
  .header h1{color:white;margin:0;font-size:20px;font-weight:600;}
  .body{padding:28px;}
  .btn{display:inline-block;background:#7c3aed;color:white;padding:10px 22px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px;margin-top:16px;}
  .footer{text-align:center;padding:16px;font-size:12px;color:#9ca3af;}
</style></head>
<body><div class="container">
  <div class="header"><h1>📅 DP-Differdange Events</h1></div>
  <div class="body">${content}</div>
  <div class="footer">DP — École Internationale de Differdange et d'Esch-sur-Alzette</div>
</div></body></html>`
}

export async function sendAccountPendingEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM, to,
    subject: 'Votre demande de compte DP-Differdange Events est en cours',
    html: baseTemplate(`
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Votre demande de compte sur la plateforme DP-Differdange Events a bien été reçue.</p>
      <p>Un administrateur va valider votre inscription prochainement. Vous recevrez un email de confirmation dès que votre compte sera activé.</p>
      <p style="color:#6b7280;font-size:13px;">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    `)
  })
}

export async function sendAccountValidatedEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM, to,
    subject: '✅ Votre compte DP-Differdange Events est activé !',
    html: baseTemplate(`
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Bonne nouvelle ! Votre compte sur la plateforme DP-Differdange Events a été <strong>validé</strong>.</p>
      <p>Vous pouvez maintenant vous connecter et vous inscrire aux événements.</p>
      <a href="${SITE_URL}/auth/login" class="btn">Se connecter</a>
    `)
  })
}

export async function sendNewEventEmail(
  to: string,
  name: string,
  event: { title: string; date: string; time: string; location: string; id: string }
) {
  await resend.emails.send({
    from: FROM, to,
    subject: `🎉 Nouvel événement : ${event.title}`,
    html: baseTemplate(`
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Un nouvel événement vient d'être créé sur la plateforme :</p>
      <div style="background:#f5f3ff;border-radius:8px;padding:16px;margin:16px 0;">
        <h2 style="margin:0 0 8px;color:#7c3aed;font-size:18px;">${event.title}</h2>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">📅 ${event.date} à ${event.time}</p>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">📍 ${event.location}</p>
      </div>
      <a href="${SITE_URL}/dashboard/events/${event.id}" class="btn">Voir l'événement</a>
    `)
  })
}

export async function sendEventModifiedEmail(
  to: string,
  name: string,
  event: { title: string; date: string; time: string; location: string; id: string }
) {
  await resend.emails.send({
    from: FROM, to,
    subject: `✏️ Modification : ${event.title}`,
    html: baseTemplate(`
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Un événement auquel vous êtes inscrit a été <strong>modifié</strong> :</p>
      <div style="background:#fefce8;border-radius:8px;padding:16px;margin:16px 0;">
        <h2 style="margin:0 0 8px;color:#d97706;font-size:18px;">${event.title}</h2>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">📅 ${event.date} à ${event.time}</p>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">📍 ${event.location}</p>
      </div>
      <a href="${SITE_URL}/dashboard/events/${event.id}" class="btn">Voir les détails</a>
    `)
  })
}

export async function sendEventCancelledEmail(
  to: string,
  name: string,
  eventTitle: string
) {
  await resend.emails.send({
    from: FROM, to,
    subject: `❌ Événement annulé : ${eventTitle}`,
    html: baseTemplate(`
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Nous vous informons que l'événement <strong>"${eventTitle}"</strong> auquel vous étiez inscrit a été <strong>annulé</strong>.</p>
      <p>Consultez la plateforme pour découvrir d'autres événements.</p>
      <a href="${SITE_URL}/dashboard" class="btn">Voir les événements</a>
    `)
  })
}

export async function sendEventReminderEmail(
  to: string,
  name: string,
  event: { title: string; date: string; time: string; location: string; id: string }
) {
  await resend.emails.send({
    from: FROM, to,
    subject: `⏰ Rappel : ${event.title} demain !`,
    html: baseTemplate(`
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Rappel : vous êtes inscrit à un événement <strong>demain</strong> !</p>
      <div style="background:#eff6ff;border-radius:8px;padding:16px;margin:16px 0;">
        <h2 style="margin:0 0 8px;color:#003F8A;font-size:18px;">${event.title}</h2>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">📅 ${event.date} à ${event.time.slice(0,5)}</p>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">📍 ${event.location}</p>
      </div>
      <a href="${SITE_URL}/dashboard/events/${event.id}" class="btn">Voir l'événement</a>
    `)
  })
}
export async function sendWaitlistAvailableEmail(
  to: string,
  name: string,
  event: { title: string; date: string; time: string; location: string; id: string }
) {
  await resend.emails.send({
    from: FROM, to,
    subject: `🎉 Une place s'est libérée : ${event.title}`,
    html: baseTemplate(`
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Bonne nouvelle ! Une place vient de se libérer pour l'événement suivant :</p>
      <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0;">
        <h2 style="margin:0 0 8px;color:#003F8A;font-size:18px;">${event.title}</h2>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">📅 ${event.date} à ${event.time.slice(0,5)}</p>
        <p style="margin:4px 0;color:#6b7280;font-size:14px;">📍 ${event.location}</p>
      </div>
      <p style="color:#6b7280;font-size:13px;">⚡ Dépêchez-vous — les places partent vite !</p>
      <a href="${SITE_URL}/dashboard/events/${event.id}" class="btn">S'inscrire maintenant</a>
    `)
  })
}
import { Resend } from 'resend';

// Initialisation du client Resend avec la clé d'API
const resendKey = process.env.RESEND_API_KEY;
let resend = null;

if (resendKey) {
  resend = new Resend(resendKey);
  console.log('[emailService] Client Resend initialisé avec succès');
} else {
  console.warn('[emailService] Variable RESEND_API_KEY manquante. Les envois de mails échoueront.');
}

// ── Styles partagés ────────────────────────────────────────────────────────────

const emailBase = `
  font-family: 'DM Sans', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 24px;
  background: #FFFCF8;
  color: #56352c;
`;

function emailHeader(title) {
  return `
    <div style="border-bottom: 1px solid #D4C4B0; padding-bottom: 24px; margin-bottom: 32px;">
      <p style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #8A6B5C; margin: 0 0 12px;">
        Maison Julie
      </p>
      <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 400; color: #56352c; margin: 0;">
        ${title}
      </h1>
    </div>
  `;
}

function emailFooter() {
  return `
    <div style="border-top: 1px solid #D4C4B0; padding-top: 24px; margin-top: 40px;">
      <p style="font-size: 12px; color: #8A6B5C; line-height: 1.6; margin: 0;">
        Maison Julie — Bijoux artisanaux<br>
        Pour toute question : <a href="mailto:julieberthier9@gmail.com" style="color: #620017; text-decoration: none;">julieberthier9@gmail.com</a>
      </p>
    </div>
  `;
}

function orderSummaryBlock(order) {
  const orderNum = order.stripeSessionId
    ? order.stripeSessionId.slice(-8).toUpperCase()
    : (order.id || '').slice(-8).toUpperCase();

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const items = (order.items || []).map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE4; font-size: 14px; color: #56352c;">
        ${item.name || item.description || 'Article'}
        ${item.variant ? `<span style="color: #8A6B5C; font-size: 12px;"> — ${item.variant}</span>` : ''}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE4; font-size: 14px; color: #8A6B5C; text-align: center;">
        ×${item.quantity || 1}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F0EAE4; font-size: 14px; color: #56352c; text-align: right;">
        ${typeof item.price === 'number' ? item.price.toFixed(2) : (item.amount ? item.amount.toFixed(2) : '—')} €
      </td>
    </tr>
  `).join('');

  const total = typeof order.total === 'number' ? order.total : 0;

  return `
    <div style="background: #FAF7F4; border: 1px solid #EAE0D8; padding: 20px 24px; margin: 24px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
        <div>
          <p style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #8A6B5C; margin: 0 0 4px;">Commande</p>
          <p style="font-size: 16px; font-weight: 500; color: #56352c; margin: 0;">#${orderNum}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #8A6B5C; margin: 0 0 4px;">Date</p>
          <p style="font-size: 14px; color: #56352c; margin: 0;">${date}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #8A6B5C; text-align: left; padding-bottom: 10px; border-bottom: 1px solid #D4C4B0; font-weight: 400;">Article</th>
            <th style="font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #8A6B5C; text-align: center; padding-bottom: 10px; border-bottom: 1px solid #D4C4B0; font-weight: 400;">Qté</th>
            <th style="font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #8A6B5C; text-align: right; padding-bottom: 10px; border-bottom: 1px solid #D4C4B0; font-weight: 400;">Prix</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
      </table>

      <div style="text-align: right; margin-top: 16px; padding-top: 16px; border-top: 1px solid #D4C4B0;">
        <p style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #8A6B5C; margin: 0 0 4px;">Total</p>
        <p style="font-family: Georgia, serif; font-size: 22px; color: #620017; margin: 0;">${total.toFixed(2)} €</p>
      </div>
    </div>
  `;
}

function shippingAddressBlock(address) {
  if (!address) return '';
  return `
    <div style="margin: 20px 0;">
      <p style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #8A6B5C; margin: 0 0 8px;">Adresse de livraison</p>
      <p style="font-size: 14px; color: #56352c; line-height: 1.7; margin: 0;">
        ${address.line1 || ''}<br>
        ${address.line2 ? address.line2 + '<br>' : ''}
        ${address.postal_code || ''} ${address.city || ''}<br>
        ${address.country || ''}
      </p>
    </div>
  `;
}

// ── 1. Email de confirmation de commande ───────────────────────────────────────

export async function sendOrderConfirmation(order) {
  try {
    if (!resend || !order.customerEmail) {
      console.warn('[emailService] Confirmation impossible — config ou email manquant');
      return false;
    }

    const customerName = order.customerName || order.name || 'chère cliente';
    const firstName = customerName.split(' ')[0];
    const orderNum = order.stripeSessionId
      ? order.stripeSessionId.slice(-8).toUpperCase()
      : (order.id || '').slice(-8).toUpperCase();

    const html = `
      <div style="${emailBase}">
        ${emailHeader('Merci pour votre commande ✦')}

        <p style="font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
          Bonjour ${firstName},<br><br>
          Nous avons bien reçu votre commande et nous la préparons avec soin. 
          Vous recevrez un email dès que votre colis sera expédié, avec votre numéro de suivi La Poste.
        </p>

        ${orderSummaryBlock(order)}
        ${shippingAddressBlock(order.shippingAddress)}

        <div style="background: #F0FFF4; border: 1px solid #C4E8D1; padding: 16px 20px; margin: 24px 0;">
          <p style="font-size: 13px; color: #1A6B3C; margin: 0; line-height: 1.6;">
            <strong>Votre numéro de commande :</strong> #${orderNum}<br>
            Conservez-le pour suivre l'évolution de votre commande ou nous contacter.
          </p>
        </div>

        <p style="font-size: 14px; color: #56352c; line-height: 1.7; margin: 0;">
          Merci de votre confiance,<br>
          <span style="font-family: Georgia, serif; font-size: 16px;">Julie</span>
        </p>

        ${emailFooter()}
      </div>
    `;

    const { error } = await resend.emails.send({
      from: 'Maison Julie <contact@maison-julie-studio.fr>',
      to: [order.customerEmail],
      subject: `✦ Commande confirmée #${orderNum} — Maison Julie`,
      html,
    });

    if (error) {
      console.error('[emailService] Erreur Resend confirmation:', error);
      return false;
    }

    console.log(`[emailService] Confirmation envoyée à ${order.customerEmail}`);
    return true;
  } catch (err) {
    console.error('[emailService] Erreur confirmation:', err.message);
    return false;
  }
}

// ── 2. Email d'expédition avec numéro de suivi ────────────────────────────────

export async function sendShippingNotification(order, trackingNumber) {
  try {
    if (!resend || !order.customerEmail) {
      console.warn('[emailService] Expédition impossible — config ou email manquant');
      return false;
    }

    const customerName = order.customerName || order.name || 'chère cliente';
    const firstName = customerName.split(' ')[0];
    const orderNum = order.stripeSessionId
      ? order.stripeSessionId.slice(-8).toUpperCase()
      : (order.id || '').slice(-8).toUpperCase();

    const trackingUrl = trackingNumber
      ? `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`
      : null;

    const trackingBlock = trackingNumber ? `
      <div style="background: #EEF5FF; border: 1px solid #B5CEFF; padding: 20px 24px; margin: 24px 0; text-align: center;">
        <p style="font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #185FA5; margin: 0 0 8px;">
          Numéro de suivi La Poste
        </p>
        <p style="font-family: 'Courier New', monospace; font-size: 20px; font-weight: 700; color: #185FA5; letter-spacing: 3px; margin: 0 0 16px;">
          ${trackingNumber}
        </p>
        <a href="${trackingUrl}"
           style="display: inline-block; background: #185FA5; color: #ffffff; text-decoration: none;
                  padding: 12px 28px; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase;">
          Suivre mon colis →
        </a>
      </div>
    ` : '';

    const html = `
      <div style="${emailBase}">
        ${emailHeader('Votre colis est en route ! 🚚')}

        <p style="font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
          Bonjour ${firstName},<br><br>
          Votre commande vient d'être expédiée. 
          ${trackingNumber
            ? 'Vous pouvez suivre votre colis en temps réel avec le numéro ci-dessous.'
            : 'Vous devriez la recevoir dans les prochains jours.'}
        </p>

        ${trackingBlock}
        ${orderSummaryBlock(order)}
        ${shippingAddressBlock(order.shippingAddress)}

        <p style="font-size: 13px; color: #8A6B5C; line-height: 1.7; margin: 24px 0 0;">
          En cas de problème avec votre livraison, n'hésitez pas à nous contacter en répondant à cet email.
        </p>

        <p style="font-size: 14px; color: #56352c; line-height: 1.7; margin: 20px 0 0;">
          À très vite,<br>
          <span style="font-family: Georgia, serif; font-size: 16px;">Julie</span>
        </p>

        ${emailFooter()}
      </div>
    `;

    const { error } = await resend.emails.send({
      from: 'Maison Julie <contact@maison-julie-studio.fr>',
      to: [order.customerEmail],
      subject: `📦 Votre colis est expédié #${orderNum} — Maison Julie`,
      html,
    });

    if (error) {
      console.error('[emailService] Erreur Resend expédition:', error);
      return false;
    }

    console.log(`[emailService] Notification d'expédition envoyée à ${order.customerEmail}`);
    return true;
  } catch (err) {
    console.error('[emailService] Erreur expédition:', err.message);
    return false;
  }
}

// ── 3. Email de changement de statut générique ────────────────────────────────

export async function sendOrderStatusNotification(order, newStatus) {
  try {
    if (!resend || !order.customerEmail) return false;

    const statusLabels = {
      pending:   { label: 'En attente de traitement', emoji: '⏳' },
      preparing: { label: 'En cours de préparation',  emoji: '📦' },
      delivered: { label: 'Livré',                    emoji: '✅' },
      cancelled: { label: 'Annulée',                  emoji: '❌' },
    };

    const s = statusLabels[newStatus] || { label: newStatus, emoji: '📋' };
    const customerName = order.customerName || order.name || 'chère cliente';
    const firstName = customerName.split(' ')[0];
    const orderNum = order.stripeSessionId
      ? order.stripeSessionId.slice(-8).toUpperCase()
      : (order.id || '').slice(-8).toUpperCase();

    const cancelledBlock = newStatus === 'cancelled' ? `
      <div style="background: #FFF0F0; border: 1px solid #F5C4C4; padding: 16px 20px; margin: 24px 0;">
        <p style="font-size: 13px; color: #8B2020; margin: 0; line-height: 1.6;">
          Si vous avez été débité(e), le remboursement sera effectué sous 5 à 10 jours ouvrés sur votre moyen de paiement d'origine.
          Pour toute question, répondez directement à cet email.
        </p>
      </div>
    ` : '';

    const html = `
      <div style="${emailBase}">
        ${emailHeader(`${s.emoji} ${s.label}`)}

        <p style="font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
          Bonjour ${firstName},<br><br>
          Le statut de votre commande a été mis à jour : <strong>${s.label}</strong>.
        </p>

        ${cancelledBlock}
        ${orderSummaryBlock(order)}

        <p style="font-size: 14px; color: #56352c; line-height: 1.7; margin: 20px 0 0;">
          Merci,<br>
          <span style="font-family: Georgia, serif; font-size: 16px;">Julie</span>
        </p>

        ${emailFooter()}
      </div>
    `;

    const { error } = await resend.emails.send({
      from: 'Maison Julie <contact@maison-julie-studio.fr>',
      to: [order.customerEmail],
      subject: `${s.emoji} Commande #${orderNum} — ${s.label}`,
      html,
    });

    if (error) {
      console.error('[emailService] Erreur Resend statut:', error);
      return false;
    }

    console.log(`[emailService] Statut "${newStatus}" envoyé à ${order.customerEmail}`);
    return true;
  } catch (err) {
    console.error('[emailService] Erreur statut:', err.message);
    return false;
  }
}

// ── 4. Email de contact ────────────────────────────────────────────────────────

export async function sendContactFormEmail(formData) {
  try {
    const ownerEmail = process.env.OWNER_EMAIL;
    if (!resend || !ownerEmail) return false;

    const { error } = await resend.emails.send({
      from: 'Maison Julie <contact@maison-julie-studio.fr>',
      to: [ownerEmail],
      replyTo: formData.email, // Permet à ta sœur de répondre directement au client en cliquant sur "Répondre"
      subject: `Nouveau message de contact — ${formData.name}`,
      html: `
        <div style="${emailBase}">
          ${emailHeader('Nouveau message de contact')}
          <p><strong>Nom :</strong> ${formData.name}</p>
          <p><strong>Email :</strong> <a href="mailto:${formData.email}" style="color:#620017">${formData.email}</a></p>
          ${formData.phone ? `<p><strong>Téléphone :</strong> ${formData.phone}</p>` : ''}
          <div style="background:#FAF7F4;border:1px solid #EAE0D8;padding:16px 20px;margin-top:16px;white-space:pre-wrap;font-size:14px;line-height:1.7;">
            ${formData.message}
          </div>
          ${emailFooter()}
        </div>
      `,
    });

    if (error) {
      console.error('[emailService] Erreur Resend contact:', error);
      return false;
    }

    console.log(`[emailService] Contact de ${formData.email}`);
    return true;
  } catch (err) {
    console.error('[emailService] Erreur contact:', err.message);
    return false;
  }
}

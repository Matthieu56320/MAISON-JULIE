import nodemailer from 'nodemailer';

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_PASS;
const ownerEmail = process.env.OWNER_EMAIL;

let transporter;

function getTransporter() {
  if (!transporter && gmailUser && gmailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }
  return transporter;
}

export async function sendOrderStatusNotification(order, newStatus) {
  try {
    const transport = getTransporter();
    if (!transport || !ownerEmail || !order.customerEmail) {
      console.warn('[emailService] Email config incomplete');
      return false;
    }

    const statusLabels = {
      pending: '⏳ En attente',
      preparing: '📦 En préparation',
      shipped: '🚚 Expédié',
      delivered: '✅ Livré',
    };

    const statusText = statusLabels[newStatus] || newStatus;
    const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR');
    const orderItems = (order.items || [])
      .map(item => `• ${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toFixed(2)}€`)
      .join('\n');

    const mailOptions = {
      from: gmailUser,
      to: order.customerEmail,
      subject: `Statut de votre commande #${order.id} - ${statusText}`,
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #56352c; margin-bottom: 16px;">Bonjour ${order.customerName},</h2>
          
          <p style="color: #56352c; font-size: 16px; line-height: 1.6;">
            Votre commande a été mise à jour. ${statusText}
          </p>

          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #8A6B5C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Numéro de commande
            </p>
            <p style="margin: 0 0 16px 0; color: #56352c; font-size: 18px; font-weight: 500;">
              #${order.id}
            </p>
            
            <p style="margin: 0 0 8px 0; color: #8A6B5C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Date de commande
            </p>
            <p style="margin: 0 0 16px 0; color: #56352c; font-size: 14px;">
              ${orderDate}
            </p>

            <p style="margin: 0 0 8px 0; color: #8A6B5C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Montant total
            </p>
            <p style="margin: 0; color: #620017; font-size: 16px; font-weight: 500;">
              ${order.total.toFixed(2)}€
            </p>
          </div>

          <div style="background-color: #fafafa; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 12px 0; color: #8A6B5C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Détail de la commande
            </p>
            <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; color: #56352c; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px;">
${orderItems}
            </pre>
          </div>

          <p style="color: #56352c; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            Merci pour votre achat ! Pour toute question, n'hésitez pas à nous contacter.
          </p>

          <p style="color: #8A6B5C; font-size: 12px; margin-top: 24px; border-top: 1px solid #D4C4B0; padding-top: 16px;">
            Maison Julie<br>
            contact@maison-julie.fr
          </p>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);
    console.log(`[email] Notification de statut envoyée à ${order.customerEmail}`);
    return true;
  } catch (err) {
    console.error('[email] Erreur lors de l\'envoi de notification', err);
    return false;
  }
}

export async function sendContactFormEmail(formData) {
  try {
    const transport = getTransporter();
    if (!transport || !ownerEmail) {
      console.warn('[emailService] Email config incomplete');
      return false;
    }

    const mailOptions = {
      from: gmailUser,
      to: ownerEmail,
      replyTo: formData.email,
      subject: `Nouveau message de contact - ${formData.name}`,
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #56352c; margin-bottom: 16px;">Nouveau message de contact</h2>
          
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 12px 0; color: #8A6B5C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Nom
            </p>
            <p style="margin: 0 0 16px 0; color: #56352c; font-size: 14px;">
              ${formData.name}
            </p>

            <p style="margin: 0 0 12px 0; color: #8A6B5C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Email
            </p>
            <p style="margin: 0 0 16px 0; color: #56352c; font-size: 14px;">
              <a href="mailto:${formData.email}" style="color: #620017; text-decoration: none;">
                ${formData.email}
              </a>
            </p>

            ${formData.phone ? `
            <p style="margin: 0 0 12px 0; color: #8A6B5C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Téléphone
            </p>
            <p style="margin: 0 0 16px 0; color: #56352c; font-size: 14px;">
              ${formData.phone}
            </p>
            ` : ''}

            <p style="margin: 0 0 12px 0; color: #8A6B5C; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Message
            </p>
            <p style="margin: 0; color: #56352c; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">
              ${formData.message}
            </p>
          </div>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);
    console.log(`[email] Message de contact reçu de ${formData.email}`);
    return true;
  } catch (err) {
    console.error('[email] Erreur lors de l\'envoi du formulaire de contact', err);
    return false;
  }
}

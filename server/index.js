import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { loadOrders, loadOrdersFromFirestore, updateOrderFulfillment, updateOrderFulfillmentAnywhere, cancelOrder } from './ordersStore.js';
import {
  persistOrderFromSession,
  syncPaidSessionsFromStripe,
  buildCustomersFromOrders,
} from './stripeOrders.js';
import {
  sendOrderConfirmation,
  sendShippingNotification,
  sendOrderStatusNotification,
  sendContactFormEmail,
} from './emailService.js';
import { loadCatalog, saveCatalog } from './catalogStore.js';
import { loadSiteConfig, saveSiteConfig } from './siteConfigStore.js';
import { addPendingReview, loadPendingReviews, deletePendingReview } from './reviewsStore.js';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('STRIPE_SECRET_KEY manquante — vérifiez le fichier .env à la racine du projet.');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stripe = new Stripe(secretKey);
const app = express();
const PORT = Number(process.env.PORT) || 4242;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin123';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: '1mb' }));

const staticDir = path.join(__dirname, '../dist');
app.use(express.static(staticDir));

console.log('[SERVER] Démarrage avec CLIENT_URL:', CLIENT_URL);
console.log('[SERVER] GMAIL_USER:', process.env.GMAIL_USER ? '✓ configuré' : '✗ MANQUANT');
console.log('[SERVER] STRIPE_SECRET_KEY:', secretKey ? '✓ configuré' : '✗ MANQUANT');

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Accès admin refusé' });
  }
  next();
}

const PICKUP_ADDRESS = '8 rue Joseph Fortune, 56320 Le Faouët';

function buildLineItems(items, deliveryMode = 'delivery') {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Panier vide');
  }

  const SHIPPING_FEE = 5.00;

  const lineItems = items.map((item) => {
    const price = Number(item.price);
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    if (!item.name || Number.isNaN(price) || price <= 0 || price > 10_000) {
      throw new Error('Article invalide dans le panier');
    }

    const image = item.images?.[0] || item.image;
    const productData = { name: String(item.name).slice(0, 250) };
    if (typeof image === 'string' && image.startsWith('https://')) {
      productData.images = [image];
    }

    return {
      price_data: {
        currency: 'eur',
        product_data: productData,
        unit_amount: Math.round(price * 100),
      },
      quantity,
    };
  });

  if (deliveryMode !== 'pickup') {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'Livraison à domicile' },
        unit_amount: Math.round(SHIPPING_FEE * 100),
      },
      quantity: 1,
    });
  } else {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: `Retrait gratuit — ${PICKUP_ADDRESS}` },
        unit_amount: 0,
      },
      quantity: 1,
    });
  }

  return lineItems;
}

// ── Webhook Stripe ─────────────────────────────────────────────────────────────

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      if (WEBHOOK_SECRET && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
      } else {
        event = JSON.parse(req.body.toString());
        console.warn('[webhook] Mode dev sans STRIPE_WEBHOOK_SECRET — signature non vérifiée');
      }
    } catch (err) {
      console.error('[webhook] Signature invalide', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const order = await persistOrderFromSession(stripe, session.id);
        console.log('[webhook] Commande enregistrée:', session.id);
        if (order) {
          sendOrderConfirmation(order).catch(err =>
            console.error('[webhook] email confirmation:', err.message)
          );
        }
      }
    } catch (err) {
      console.error('[webhook] Traitement', err);
      return res.status(500).json({ error: 'Webhook handler failed' });
    }

    res.json({ received: true });
  },
);

// ── Routes publiques ───────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/record-order', async (req, res) => {
  try {
    const sessionId = req.body?.sessionId;
    if (!sessionId || !String(sessionId).startsWith('cs_')) {
      return res.status(400).json({ error: 'Session invalide' });
    }
    const order = await persistOrderFromSession(stripe, sessionId);
    if (!order) {
      return res.status(400).json({ error: 'Paiement non confirmé' });
    }
    // Répondre immédiatement, email en arrière-plan
    res.json({ ok: true, order });
    sendOrderConfirmation(order).catch(err =>
      console.error('[record-order] email:', err.message)
    );
  } catch (err) {
    console.error('[record-order]', err);
    res.status(500).json({ error: 'Enregistrement impossible' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { items = [], deliveryMode = 'delivery', promoCode } = req.body || {};
    const lineItems = buildLineItems(items, deliveryMode);

    let discounts;
    if (promoCode) {
      const codes = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 });
      if (codes.data.length > 0) {
        discounts = [{ promotion_code: codes.data[0].id }];
      }
    }

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${CLIENT_URL}/commande-confirmee?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/panier`,
      customer_email: req.body.customerEmail || undefined,
      phone_number_collection: { enabled: true },
      metadata: {
        source: 'maison-julie',
        item_count: String(items.length),
        delivery_mode: deliveryMode,
      },
    };

    if (deliveryMode === 'delivery') {
      sessionParams.shipping_address_collection = { allowed_countries: ['FR'] };
      if (!discounts) sessionParams.allow_promotion_codes = true;
    } else {
      if (!discounts) sessionParams.allow_promotion_codes = true;
    }

    if (discounts) sessionParams.discounts = discounts;

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err);
    const status = err.message === 'Panier vide' ? 400 : 500;
    res.status(status).json({ error: err.message || 'Impossible de créer la session de paiement' });
  }
});

// ── Contact ────────────────────────────────────────────────────────────────────

app.post('/api/contact/send', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Tous les champs requis sont manquants' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }
    // Répondre immédiatement, email en arrière-plan
    res.json({ ok: true });
    sendContactFormEmail({ name, email, phone, message }).catch(err =>
      console.error('[contact] email:', err.message)
    );
  } catch (err) {
    console.error('[contact]', err);
    res.status(500).json({ error: 'Une erreur est survenue' });
  }
});

// ── Avis ───────────────────────────────────────────────────────────────────────

app.post('/api/reviews', async (req, res) => {
  try {
    const { author, location, rating, text, orderRef } = req.body || {};
    if (!author?.trim()) return res.status(400).json({ error: 'Le prénom et nom sont requis.' });
    if (!text?.trim() || text.trim().length < 20) {
      return res.status(400).json({ error: 'Le témoignage doit faire au moins 20 caractères.' });
    }
    const review = await addPendingReview({ author, location, rating, text, orderRef });
    res.json({ ok: true, review });
  } catch (err) {
    console.error('[POST /api/reviews]', err);
    res.status(500).json({ error: "Impossible d'enregistrer votre avis." });
  }
});

app.get('/api/admin/reviews', requireAdmin, async (_req, res) => {
  try {
    res.json({ reviews: await loadPendingReviews() });
  } catch (err) {
    res.status(500).json({ error: 'Impossible de charger les avis.' });
  }
});

app.post('/api/admin/reviews/:id/publish', requireAdmin, async (req, res) => {
  try {
    const reviews = await loadPendingReviews();
    const review = reviews.find((r) => r.id === req.params.id);
    if (!review) return res.status(404).json({ error: 'Avis introuvable.' });
    const config = await loadSiteConfig();
    const items = config.reviews?.items ?? [];
    const published = { id: review.id, author: review.author, location: review.location, rating: review.rating, text: review.text, date: review.date };
    config.reviews = {
      ...(config.reviews ?? { enabled: true, eyebrow: 'Témoignages', title: "Ce qu'elles disent" }),
      items: [...items, published],
    };
    await saveSiteConfig(config);
    await deletePendingReview(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/admin/reviews/:id/publish]', err);
    res.status(500).json({ error: "Impossible de publier l'avis." });
  }
});

app.delete('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
  try {
    await deletePendingReview(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Impossible de supprimer l'avis." });
  }
});

// ── Admin : commandes ─────────────────────────────────────────────────────────

app.get('/api/admin/orders', requireAdmin, async (_req, res) => {
  try {
    const orders = await loadOrdersFromFirestore();
    res.json({ orders });
  } catch (err) {
    console.error('[admin/orders]', err);
    res.status(500).json({ error: 'Impossible de charger les commandes' });
  }
});

app.get('/api/admin/customers', requireAdmin, async (_req, res) => {
  try {
    const orders = await loadOrdersFromFirestore();
    res.json({ customers: buildCustomersFromOrders(orders) });
  } catch (err) {
    res.status(500).json({ error: 'Impossible de charger les clients' });
  }
});

app.post('/api/admin/sync-stripe', requireAdmin, async (_req, res) => {
  try {
    const synced = await syncPaidSessionsFromStripe(stripe, 50);
    const orders = await loadOrdersFromFirestore();
    const customers = buildCustomersFromOrders(orders);
    res.json({ synced, orders, customers });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Synchronisation Stripe échouée' });
  }
});

// ── PATCH commande : changement de statut + numéro de suivi ──────────────────

app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { fulfillmentStatus, trackingNumber } = req.body || {};
    const validStatuses = ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(fulfillmentStatus)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const updated = await updateOrderFulfillmentAnywhere(
      req.params.id,
      fulfillmentStatus,
      trackingNumber ?? null,
    );

    if (!updated) return res.status(404).json({ error: 'Commande introuvable' });

    // Répondre IMMÉDIATEMENT au client
    res.json({ order: updated });

    // Envoyer l'email en arrière-plan (fire-and-forget)
    if (fulfillmentStatus === 'shipped') {
      sendShippingNotification(updated, trackingNumber || null)
        .catch(err => console.error('[email background] expédition:', err.message));
    } else {
      sendOrderStatusNotification(updated, fulfillmentStatus)
        .catch(err => console.error('[email background] statut:', err.message));
    }

  } catch (err) {
    console.error('[admin/patch order]', err);
    res.status(500).json({ error: 'Mise à jour impossible' });
  }
});

// ── Admin : catalogue ─────────────────────────────────────────────────────────

app.get('/api/catalog', async (_req, res) => {
  try {
    res.json(await loadCatalog());
  } catch (err) {
    res.status(500).json({ error: 'Impossible de charger le catalogue' });
  }
});

app.post('/api/admin/catalog', requireAdmin, async (req, res) => {
  try {
    const { products, collections } = req.body || {};
    if (!Array.isArray(products) || !Array.isArray(collections)) {
      return res.status(400).json({ error: 'Catalogue invalide' });
    }
    await saveCatalog({ products, collections });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Impossible d'enregistrer le catalogue" });
  }
});

// ── Admin : codes promo ───────────────────────────────────────────────────────

app.get('/api/admin/promo-codes', requireAdmin, async (_req, res) => {
  try {
    const codes = await stripe.promotionCodes.list({ limit: 50, expand: ['data.coupon'] });
    res.json({ promoCodes: codes.data });
  } catch (err) {
    res.status(500).json({ error: 'Impossible de charger les codes promo' });
  }
});

app.post('/api/admin/promo-codes', requireAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, maxRedemptions, expiresAt } = req.body || {};
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ error: 'code, discountType et discountValue sont requis' });
    }
    const couponParams = {};
    if (discountType === 'percent') {
      couponParams.percent_off = Number(discountValue);
    } else {
      couponParams.amount_off = Math.round(Number(discountValue) * 100);
      couponParams.currency = 'eur';
    }
    const coupon = await stripe.coupons.create(couponParams);
    const promoParams = { coupon_id: coupon.id, code: String(code).toUpperCase().trim() };
    if (maxRedemptions) promoParams.max_redemptions = Number(maxRedemptions);
    if (expiresAt) promoParams.expires_at = Math.floor(new Date(expiresAt).getTime() / 1000);
    const promoCode = await stripe.promotionCodes.create(promoParams);
    res.json({ promoCode });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Impossible de créer le code promo' });
  }
});

app.patch('/api/admin/promo-codes/:id/deactivate', requireAdmin, async (req, res) => {
  try {
    const updated = await stripe.promotionCodes.update(req.params.id, { active: false });
    res.json({ promoCode: updated });
  } catch (err) {
    res.status(500).json({ error: 'Impossible de désactiver le code promo' });
  }
});

// ── Config site ───────────────────────────────────────────────────────────────

app.get('/api/site-config', async (_req, res) => {
  try {
    res.json(await loadSiteConfig());
  } catch (err) {
    res.status(500).json({ error: 'Impossible de charger la configuration' });
  }
});

app.post('/api/admin/site-config', requireAdmin, async (req, res) => {
  try {
    const config = req.body;
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Configuration invalide' });
    }
    await saveSiteConfig(config);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Impossible d'enregistrer la configuration" });
  }
});

// ── Fallback SPA ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route API introuvable' });
  }
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`API Stripe → http://localhost:${PORT}`);
  if (!WEBHOOK_SECRET) {
    console.log("  → Sans webhook : utilisez « Synchroniser Stripe » dans l'admin ou Stripe CLI");
  }
});

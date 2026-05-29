import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { loadOrders, updateOrderFulfillment } from './ordersStore.js';
import {
  persistOrderFromSession,
  syncPaidSessionsFromStripe,
  buildCustomersFromOrders,
} from './stripeOrders.js';

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('STRIPE_SECRET_KEY manquante — vérifiez le fichier .env à la racine du projet.');
  process.exit(1);
}

const stripe = new Stripe(secretKey);
const app = express();
const PORT = Number(process.env.PORT) || 4242;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin123';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Accès admin refusé' });
  }
  next();
}

function buildLineItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Panier vide');
  }

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

  // Ajouter les frais de livraison si présents
  const totalShippingCost = items.reduce((sum, item) => {
    const shippingCost = Number(item.shippingCost) || 0;
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    return sum + (shippingCost * quantity);
  }, 0);

  if (totalShippingCost > 0) {
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: 'Frais de livraison' },
        unit_amount: Math.round(totalShippingCost * 100),
      },
      quantity: 1,
    });
  }

  return lineItems;
}

// Webhook Stripe (body brut — avant express.json)
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
        await persistOrderFromSession(stripe, session.id);
        console.log('[webhook] Commande enregistrée:', session.id);
      }
    } catch (err) {
      console.error('[webhook] Traitement', err);
      return res.status(500).json({ error: 'Webhook handler failed' });
    }

    res.json({ received: true });
  },
);

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

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
    res.json({ ok: true, order });
  } catch (err) {
    console.error('[record-order]', err);
    res.status(500).json({ error: 'Enregistrement impossible' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const items = req.body?.items || [];
    const line_items = buildLineItems(items);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${CLIENT_URL}/commande/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/panier?annule=1`,
      shipping_address_collection: { allowed_countries: ['FR'] },
      billing_address_collection: 'required',
      locale: 'fr',
      allow_promotion_codes: true,
      customer_creation: 'always',
      metadata: {
        source: 'maison-julie',
        item_count: String(items.length),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err);
    const status = err.message === 'Panier vide' ? 400 : 500;
    res.status(status).json({ error: err.message || 'Impossible de créer la session de paiement' });
  }
});

// ── Admin (commandes & clients Stripe) ──

app.get('/api/admin/orders', requireAdmin, async (_req, res) => {
  try {
    const orders = await loadOrders();
    res.json({ orders });
  } catch (err) {
    console.error('[admin/orders]', err);
    res.status(500).json({ error: 'Impossible de charger les commandes' });
  }
});

app.get('/api/admin/customers', requireAdmin, async (_req, res) => {
  try {
    const orders = await loadOrders();
    const customers = buildCustomersFromOrders(orders);
    res.json({ customers });
  } catch (err) {
    console.error('[admin/customers]', err);
    res.status(500).json({ error: 'Impossible de charger les clients' });
  }
});

app.post('/api/admin/sync-stripe', requireAdmin, async (_req, res) => {
  try {
    const synced = await syncPaidSessionsFromStripe(stripe, 50);
    const orders = await loadOrders();
    const customers = buildCustomersFromOrders(orders);
    res.json({ synced, orders, customers });
  } catch (err) {
    console.error('[admin/sync]', err);
    res.status(500).json({ error: err.message || 'Synchronisation Stripe échouée' });
  }
});

app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { fulfillmentStatus } = req.body || {};
    if (!['En préparation', 'Expédié'].includes(fulfillmentStatus)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    const updated = await updateOrderFulfillment(req.params.id, fulfillmentStatus);
    if (!updated) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }
    res.json({ order: updated });
  } catch (err) {
    console.error('[admin/patch order]', err);
    res.status(500).json({ error: 'Mise à jour impossible' });
  }
});

app.listen(PORT, () => {
  console.log(`API Stripe → http://localhost:${PORT}`);
  if (!WEBHOOK_SECRET) {
    console.log('  → Sans webhook : utilisez « Synchroniser Stripe » dans l’admin ou Stripe CLI');
  }
});

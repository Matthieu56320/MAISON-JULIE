import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// ── Firebase Admin ─────────────────────────────────────────────────────────────

function getAdminDb() {
  try {
    if (!getApps().length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY_BASE64
        ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
        : process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }
    return getFirestore();
  } catch (err) {
    console.warn('[ordersStore] Firebase Admin non initialisé:', err.message);
    return null;
  }
}

// ── Helpers JSON local ─────────────────────────────────────────────────────────

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function loadOrders() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(ORDERS_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeOrders(orders) {
  await ensureDataDir();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
}

// ── Firestore ─────────────────────────────────────────────────────────────────

async function saveOrderToFirestore(order) {
  const db = getAdminDb();
  if (!db) return;
  try {
    const docRef = db.collection('orders').doc(order.id);
    await docRef.set({
      stripeSessionId:  order.id,
      customerEmail:    order.customerEmail || order.email || null,
      customerName:     order.customerName  || order.name  || null,
      total: typeof order.total === 'number'
        ? order.total
        : (order.amount_total ? order.amount_total / 100 : 0),
      status:            'paid',
      fulfillmentStatus: order.fulfillmentStatus || 'pending',
      trackingNumber:    order.trackingNumber    || null,
      items:             order.items || order.lineItems || [],
      shippingAddress:   order.shippingAddress || order.shipping_details?.address || null,
      createdAt:         FieldValue.serverTimestamp(),
      updatedAt:         FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log('[ordersStore] Firestore ← commande', order.id);
  } catch (err) {
    console.error('[ordersStore] Erreur Firestore save:', err.message);
  }
}

async function updateOrderInFirestore(id, fields) {
  const db = getAdminDb();
  if (!db) return;
  try {
    await db.collection('orders').doc(id).update({
      ...fields,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error('[ordersStore] Erreur Firestore update:', err.message);
  }
}

// ── Fonctions exportées ────────────────────────────────────────────────────────

export async function upsertOrder(order) {
  const orders = await loadOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = {
      ...orders[idx],
      ...order,
      fulfillmentStatus: orders[idx].fulfillmentStatus ?? order.fulfillmentStatus,
    };
  } else {
    orders.unshift(order);
  }
  await writeOrders(orders);
  await saveOrderToFirestore(order);
  return orders;
}

// Met à jour le statut et optionnellement le numéro de suivi
export async function updateOrderFulfillment(id, fulfillmentStatus, trackingNumber = null) {
  const orders = await loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return null;

  const updates = { fulfillmentStatus };
  if (trackingNumber !== null) updates.trackingNumber = trackingNumber;

  orders[idx] = { ...orders[idx], ...updates };
  await writeOrders(orders);

  // Mise à jour Firestore
  await updateOrderInFirestore(id, updates);

  return orders[idx];
}

// Annule une commande
export async function cancelOrder(id) {
  return updateOrderFulfillment(id, 'cancelled');
}
// ── Lecture Firestore (dashboard admin) ───────────────────────────────────────

// Normalise un doc Firestore en objet commande standard
function normalizeFirestoreDoc(doc) {
  const d = doc.data();
  return {
    id:                doc.id,
    stripeSessionId:   d.stripeSessionId   || doc.id,
    customerEmail:     d.customerEmail     || d.email || null,
    customerName:      d.customerName      || d.name  || null,
    total:             typeof d.total === 'number' ? d.total : 0,
    paymentStatus:     d.status            || 'paid',
    fulfillmentStatus: d.fulfillmentStatus || 'pending',
    trackingNumber:    d.trackingNumber    || null,
    items:             d.items             || [],
    shippingAddress:   d.shippingAddress   || null,
    paidAt:            d.createdAt?.toDate?.()?.toISOString() || d.createdAt || null,
    createdAt:         d.createdAt?.toDate?.()?.toISOString() || d.createdAt || null,
  };
}

// Charge toutes les commandes depuis Firestore.
// Si Firestore est indisponible, fallback sur le fichier JSON local.
export async function loadOrdersFromFirestore() {
  const db = getAdminDb();
  if (!db) {
    console.warn('[ordersStore] Firestore indisponible, fallback JSON local');
    return loadOrders();
  }
  try {
    const snap = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = snap.docs.map(normalizeFirestoreDoc);
    console.log(`[ordersStore] ${orders.length} commande(s) chargée(s) depuis Firestore`);
    return orders;
  } catch (err) {
    console.error('[ordersStore] Erreur lecture Firestore, fallback JSON:', err.message);
    return loadOrders();
  }
}

// Met à jour le statut d'une commande — cherche d'abord dans Firestore,
// puis fallback JSON local si non trouvé.
export async function updateOrderFulfillmentAnywhere(id, fulfillmentStatus, trackingNumber = null) {
  const updates = { fulfillmentStatus };
  if (trackingNumber !== null) updates.trackingNumber = trackingNumber;

  const db = getAdminDb();

  // 1. Essaie Firestore
  if (db) {
    try {
      const docRef = db.collection('orders').doc(id);
      const snap = await docRef.get();
      if (snap.exists) {
        await docRef.update({ ...updates, updatedAt: FieldValue.serverTimestamp() });
        const updated = normalizeFirestoreDoc({ id: snap.id, data: () => ({ ...snap.data(), ...updates }) });
        // Sync aussi dans le JSON local si présent
        const orders = await loadOrders();
        const idx = orders.findIndex((o) => o.id === id || o.stripeSessionId === id);
        if (idx >= 0) {
          orders[idx] = { ...orders[idx], ...updates };
          await writeOrders(orders);
        }
        return updated;
      }
    } catch (err) {
      console.warn('[ordersStore] updateOrderFulfillmentAnywhere Firestore:', err.message);
    }
  }

  // 2. Fallback JSON local
  return updateOrderFulfillment(id, fulfillmentStatus, trackingNumber);
}
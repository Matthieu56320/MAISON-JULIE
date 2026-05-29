import { upsertOrder } from './ordersStore.js';

export function formatOrderDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function checkoutSessionToOrder(stripe, sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== 'paid') return null;

  const lineItemsRes = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });
  const items = lineItemsRes.data.map((li) => ({
    name: li.description || 'Article',
    quantity: li.quantity,
    amount: (li.amount_total ?? 0) / 100,
  }));

  const shipping = session.shipping_details?.address || session.customer_details?.address;
  const itemSummary = items.map((i) => `${i.quantity}× ${i.name}`).join(', ');

  return {
    id: session.id,
    shortId: `MJ-${session.id.replace('cs_', '').slice(-8).toUpperCase()}`,
    email: session.customer_details?.email || session.customer_email || '',
    name: session.customer_details?.name || '',
    phone: session.customer_details?.phone || '',
    item: itemSummary.slice(0, 200),
    items,
    total: (session.amount_total ?? 0) / 100,
    currency: (session.currency || 'eur').toUpperCase(),
    paymentStatus: session.payment_status,
    fulfillmentStatus: 'En préparation',
    shippingAddress: shipping
      ? {
          line1: shipping.line1,
          line2: shipping.line2,
          city: shipping.city,
          postal_code: shipping.postal_code,
          country: shipping.country,
        }
      : null,
    stripeCustomerId: session.customer || null,
    createdAt: new Date(session.created * 1000).toISOString(),
    paidAt: new Date().toISOString(),
  };
}

export async function persistOrderFromSession(stripe, sessionId) {
  const order = await checkoutSessionToOrder(stripe, sessionId);
  if (!order) return null;
  await upsertOrder(order);
  return order;
}

export async function syncPaidSessionsFromStripe(stripe, limit = 50) {
  const sessions = await stripe.checkout.sessions.list({
    limit,
    status: 'complete',
  });

  let synced = 0;
  for (const s of sessions.data) {
    if (s.payment_status !== 'paid') continue;
    const order = await persistOrderFromSession(stripe, s.id);
    if (order) synced += 1;
  }
  return synced;
}

export function buildCustomersFromOrders(orders) {
  const byEmail = new Map();

  for (const o of orders) {
    const email = (o.email || '').trim().toLowerCase();
    if (!email) continue;

    const existing = byEmail.get(email);
    const paidAt = o.paidAt || o.createdAt;
    if (!existing) {
      byEmail.set(email, {
        id: email,
        email: o.email,
        name: o.name || '',
        firstOrderAt: paidAt,
        lastOrderAt: paidAt,
        orderCount: 1,
        totalSpent: o.total || 0,
        stripeCustomerId: o.stripeCustomerId || null,
      });
    } else {
      existing.orderCount += 1;
      existing.totalSpent += o.total || 0;
      if (paidAt && paidAt < existing.firstOrderAt) existing.firstOrderAt = paidAt;
      if (paidAt && paidAt > existing.lastOrderAt) existing.lastOrderAt = paidAt;
      if (o.name && !existing.name) existing.name = o.name;
      if (o.stripeCustomerId) existing.stripeCustomerId = o.stripeCustomerId;
    }
  }

  return [...byEmail.values()].sort(
    (a, b) => new Date(b.lastOrderAt) - new Date(a.lastOrderAt),
  );
}

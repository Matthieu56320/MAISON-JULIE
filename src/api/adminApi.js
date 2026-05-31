import { apiUrl } from './apiBase';

const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'admin123';

function adminHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-admin-key': sessionStorage.getItem('mj_admin_key') || ADMIN_KEY,
  };
}

async function adminFetch(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: { ...adminHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        'API introuvable. Lancez « npm run dev » (site + API) ou « npm run dev:api » dans un 2ᵉ terminal.',
      );
    }
    throw new Error(data.error || `Erreur serveur (${res.status})`);
  }
  return data;
}

export function setAdminSessionKey() {
  sessionStorage.setItem('mj_admin_key', ADMIN_KEY);
}

export function clearAdminSessionKey() {
  sessionStorage.removeItem('mj_admin_key');
}

export function fetchAdminOrders() {
  return adminFetch('/api/admin/orders');
}

export function fetchAdminCustomers() {
  return adminFetch('/api/admin/customers');
}

export function syncStripeOrders() {
  return adminFetch('/api/admin/sync-stripe', { method: 'POST' });
}

export function updateOrderFulfillment(orderId, fulfillmentStatus) {
  return adminFetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ fulfillmentStatus }),
  });
}

export function saveAdminCatalog(catalog) {
  return adminFetch('/api/admin/catalog', {
    method: 'POST',
    body: JSON.stringify(catalog),
  });
}

export function saveAdminSiteConfig(config) {
  return adminFetch('/api/admin/site-config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function checkApiHealth() {
  const res = await fetch(apiUrl('/api/health'));
  return res.ok;
}

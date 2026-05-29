import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

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
  return orders;
}

export async function updateOrderFulfillment(id, fulfillmentStatus) {
  const orders = await loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  orders[idx] = { ...orders[idx], fulfillmentStatus };
  await writeOrders(orders);
  return orders[idx];
}

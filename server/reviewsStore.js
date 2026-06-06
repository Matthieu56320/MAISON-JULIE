import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storagePath = path.join(__dirname, 'data');
const storageFile = path.join(storagePath, 'pendingReviews.json');

export async function loadPendingReviews() {
  try {
    const raw = await fs.readFile(storageFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function savePendingReviews(reviews) {
  try {
    await fs.mkdir(storagePath, { recursive: true });
    await fs.writeFile(storageFile, JSON.stringify(reviews, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[reviewsStore] save error', err);
    throw err;
  }
}

export async function addPendingReview(review) {
  const reviews = await loadPendingReviews();
  const newReview = {
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author: String(review.author || '').trim().slice(0, 100),
    location: String(review.location || '').trim().slice(0, 100),
    rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
    text: String(review.text || '').trim().slice(0, 1000),
    orderRef: String(review.orderRef || '').trim().slice(0, 100),
    date: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
  reviews.push(newReview);
  await savePendingReviews(reviews);
  return newReview;
}

export async function deletePendingReview(id) {
  const reviews = await loadPendingReviews();
  const filtered = reviews.filter((r) => r.id !== id);
  await savePendingReviews(filtered);
  return filtered;
}

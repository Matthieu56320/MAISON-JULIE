import { apiUrl } from './apiBase';

export async function createCheckoutSession(cartItems) {
  const url = apiUrl('/api/create-checkout-session');
  console.log('[createCheckoutSession] URL:', url);
  console.log('[createCheckoutSession] Items:', cartItems.length);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        shippingCost: item.shippingCost || 0,
        quantity: item.quantity,
        images: item.images,
        image: item.image,
      })),
    }),
  });

  console.log('[createCheckoutSession] Response status:', res.status);
  const data = await res.json().catch(() => ({}));
  console.log('[createCheckoutSession] Response:', data);
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors de la préparation du paiement');
  }
  if (!data.url) {
    throw new Error('Réponse Stripe invalide');
  }
  return data.url;
}

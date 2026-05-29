import { apiUrl } from './apiBase';

export async function createCheckoutSession(cartItems) {
  const res = await fetch(apiUrl('/api/create-checkout-session'), {
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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors de la préparation du paiement');
  }
  if (!data.url) {
    throw new Error('Réponse Stripe invalide');
  }
  return data.url;
}

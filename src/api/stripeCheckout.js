import { apiUrl } from './apiBase';

/**
 * Prépare et crée la session de paiement Stripe
 * @param {Array} cartItems - Les articles actuellement présents dans le panier
 * @param {Object} options - Les options de livraison de la commande
 * @param {string} options.shippingMode - 'shipping' (domicile) ou 'pickup' (retrait au Faouët)
 */
export async function createCheckoutSession(cartItems, options = { shippingMode: 'shipping' }) {
  const url = apiUrl('/api/create-checkout-session');
  console.log('[createCheckoutSession] URL:', url);
  console.log('[createCheckoutSession] Items:', cartItems.length);
  console.log('[createCheckoutSession] Mode livraison:', options.shippingMode);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // On transmet le choix de livraison (Domicile ou Retrait au Faouët)
      shippingMode: options.shippingMode,
      
      // On mappe les articles en incluant la taille sélectionnée
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        shippingCost: item.shippingCost || 0,
        quantity: item.quantity,
        images: item.images,
        image: item.image,
        // Ajout crucial de la taille pour le traitement de la commande par Julie
        size: item.size || null,
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

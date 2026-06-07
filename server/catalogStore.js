import { getFirestore } from 'firebase-admin/firestore';

const COLLECTION = 'config';
const DOC_ID = 'catalog';

const defaultCatalog = {
  products: [
    {
      id: 1,
      name: 'Bracelet doré Camille',
      collection: 'Capsule',
      type: 'bracelet',
      price: 18.0,
      shippingCost: 0,
      showShippingPrice: true,
      inStock: true,
      bestseller: true,
      bestsellerRank: 1,
      description: "Un bracelet fin et élégant, plaqué or 18k. Idéal pour porter seul ou superposé. Réglable, il s'adapte à tous les poignets. Livré dans un écrin Maison Julie.",
      images: [
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80',
      ],
    },
    {
      id: 2,
      name: 'Collier Agate Raffiné',
      collection: 'Agate',
      type: 'collier',
      price: 25.0,
      shippingCost: 0,
      showShippingPrice: true,
      inStock: true,
      bestseller: true,
      bestsellerRank: 2,
      description: "Ce collier met en valeur une pierre d'agate naturelle, unique par sa teinte et ses veinures. Monture en acier inoxydable hypoallergénique. Longueur réglable de 40 à 45 cm.",
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=800&q=80',
      ],
    },
    {
      id: 3,
      name: 'Bague Agate Noire',
      collection: 'Agate',
      type: 'bague',
      price: 19.5,
      shippingCost: 0,
      showShippingPrice: true,
      inStock: true,
      bestseller: true,
      bestsellerRank: 3,
      description: "Bague en agate noire montée sur acier inoxydable argenté. La pierre noire mate apporte une touche de caractère à n'importe quelle tenue. Taille standard 54 (ajustable sur demande).",
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
        'https://images.unsplash.com/photo-1611107027940-07aadf72ef6c?w=800&q=80',
      ],
    },
    {
      id: 4,
      name: 'Boucles Capsule Mini',
      collection: 'Capsule',
      type: 'boucles',
      price: 14.0,
      shippingCost: 0,
      showShippingPrice: true,
      inStock: true,
      bestseller: true,
      bestsellerRank: 4,
      isNew: true,
      description: 'Puces dorées minimalistes, légères et discrètes. En acier inoxydable plaqué or, elles conviennent aux peaux sensibles. Diamètre 8 mm.',
      images: [
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80',
      ],
    },
    {
      id: 5,
      name: 'Collier Capsule Délicat',
      collection: 'Capsule',
      type: 'collier',
      price: 22.0,
      shippingCost: 0,
      showShippingPrice: true,
      inStock: false,
      description: "Chaîne fine dorée avec pendentif lune. Un bijou poétique pour les âmes romantiques. Acier inoxydable plaqué or 18k. Longueur : 42 cm.",
      images: [
        'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80',
      ],
    },
    {
      id: 6,
      name: 'Bracelet Agate Perles',
      collection: 'Agate',
      type: 'bracelet',
      price: 21.0,
      shippingCost: 0,
      showShippingPrice: true,
      inStock: true,
      bestseller: true,
      bestsellerRank: 5,
      isNew: true,
      description: "Bracelet composé de perles d'agate naturelles de 6 mm, assemblées sur fil élastique de qualité. Chaque pierre est unique. Convient aux poignets de 15 à 18 cm.",
      images: [
        'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=80',
      ],
    },
  ],
  collections: [
    { id: 'Capsule', name: 'Collection Capsule', description: 'Les dernières nouveautés de la saison' },
    { id: 'Agate', name: 'Collection Agate', description: 'Une élégance raffinée et intemporelle' },
  ],
};

export async function loadCatalog() {
  try {
    const db = getFirestore();
    const snap = await db.collection(COLLECTION).doc(DOC_ID).get();
    if (!snap.exists) return defaultCatalog;
    const data = snap.data();
    if (!Array.isArray(data.products) || !Array.isArray(data.collections)) return defaultCatalog;
    return { products: data.products, collections: data.collections };
  } catch (err) {
    console.error('[catalogStore] loadCatalog error:', err);
    return defaultCatalog;
  }
}

export async function saveCatalog(catalog) {
  try {
    const db = getFirestore();
    await db.collection(COLLECTION).doc(DOC_ID).set({
      products: Array.isArray(catalog.products) ? catalog.products : [],
      collections: Array.isArray(catalog.collections) ? catalog.collections : [],
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('[catalogStore] saveCatalog error:', err);
    throw err;
  }
}

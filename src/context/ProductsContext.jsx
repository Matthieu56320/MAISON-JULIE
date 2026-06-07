import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiUrl } from '../api/apiBase';
import { saveAdminCatalog } from '../api/adminApi';

const STORAGE_KEY = 'maison-julie-catalog';

const initialProducts = [
  {
    id: 1,
    name: "Bracelet doré Camille",
    collection: "Capsule",
    type: "bracelet",
    price: 18.00,
    shippingCost: 0,
    showShippingPrice: true,
    inStock: true,
    bestseller: true,
    bestsellerRank: 1,
    description: "Un bracelet fin et élégant, plaqué or 18k. Idéal pour porter seul ou superposé. Réglable, il s'adapte à tous les poignets. Livré dans un écrin Maison Julie.",
    images: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80",
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80",
    ],
  },
  {
    id: 2,
    name: "Collier Agate Raffiné",
    collection: "Agate",
    type: "collier",
    price: 25.00,
    shippingCost: 0,
    showShippingPrice: true,
    inStock: true,
    bestseller: true,
    bestsellerRank: 2,
    description: "Ce collier met en valeur une pierre d'agate naturelle, unique par sa teinte et ses veinures. Monture en acier inoxydable hypoallergénique. Longueur réglable de 40 à 45 cm.",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=800&q=80",
    ],
  },
  {
    id: 3,
    name: "Bague Agate Noire",
    collection: "Agate",
    type: "bague",
    price: 19.50,
    shippingCost: 0,
    showShippingPrice: true,
    inStock: true,
    bestseller: true,
    bestsellerRank: 3,
    description: "Bague en agate noire montée sur acier inoxydable argenté. La pierre noire mate apporte une touche de caractère à n'importe quelle tenue. Taille standard 54 (ajustable sur demande).",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
      "https://images.unsplash.com/photo-1611107027940-07aadf72ef6c?w=800&q=80",
    ],
  },
  {
    id: 4,
    name: "Boucles Capsule Mini",
    collection: "Capsule",
    type: "boucles",
    price: 14.00,
    shippingCost: 0,
    showShippingPrice: true,
    inStock: true,
    bestseller: true,
    bestsellerRank: 4,
    isNew: true,
    description: "Puces dorées minimalistes, légères et discrètes. En acier inoxydable plaqué or, elles conviennent aux peaux sensibles. Diamètre 8 mm.",
    images: [
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80",
    ],
  },
  {
    id: 5,
    name: "Collier Capsule Délicat",
    collection: "Capsule",
    type: "collier",
    price: 22.00,
    shippingCost: 0,
    showShippingPrice: true,
    inStock: false,
    description: "Chaîne fine dorée avec pendentif lune. Un bijou poétique pour les âmes romantiques. Acier inoxydable plaqué or 18k. Longueur : 42 cm.",
    images: [
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80",
    ],
  },
  {
    id: 6,
    name: "Bracelet Agate Perles",
    collection: "Agate",
    type: "bracelet",
    price: 21.00,
    shippingCost: 0,
    showShippingPrice: true,
    inStock: true,
    bestseller: true,
    bestsellerRank: 5,
    isNew: true,
    description: "Bracelet composé de perles d'agate naturelles de 6 mm, assemblées sur fil élastique de qualité. Chaque pierre est unique. Convient aux poignets de 15 à 18 cm.",
    images: [
      "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800&q=80",
    ],
  },
];

const initialCollections = [
  { id: 'Capsule', name: 'Collection Capsule', description: 'Les dernières nouveautés de la saison' },
  { id: 'Agate', name: 'Collection Agate', description: 'Une élégance raffinée et intemporelle' },
];

function computeNextId(products) {
  const max = products.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0);
  return max + 1;
}

function loadStoredCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.products) || !Array.isArray(data.collections)) return null;
    const normalizedProducts = data.products.map(p => ({
      ...p,
      shippingCost: typeof p.shippingCost === 'number' ? p.shippingCost : 0,
      showShippingPrice: typeof p.showShippingPrice === 'boolean' ? p.showShippingPrice : true,
    }));
    return {
      products: normalizedProducts,
      collections: data.collections,
      nextId: typeof data.nextId === 'number' ? data.nextId : computeNextId(normalizedProducts),
    };
  } catch {
    return null;
  }
}

function persistCatalogLocally(products, collections) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      products,
      collections,
      nextId: computeNextId(products),
    }));
  } catch {
    // quota dépassé ou navigation privée
  }
}

async function loadRemoteCatalog() {
  try {
    const res = await fetch(apiUrl('/api/catalog'));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.products) || !Array.isArray(data.collections)) return null;
    return {
      products: data.products.map((p) => ({
        ...p,
        shippingCost: typeof p.shippingCost === 'number' ? p.shippingCost : 0,
        showShippingPrice: typeof p.showShippingPrice === 'boolean' ? p.showShippingPrice : true,
      })),
      collections: data.collections,
    };
  } catch {
    return null;
  }
}

async function persistCatalogRemotely(products, collections) {
  const adminKey = sessionStorage.getItem('mj_admin_key');
  if (!adminKey) return;
  try {
    await saveAdminCatalog({ products, collections });
  } catch (err) {
    console.warn('[ProductsContext] Échec enregistrement serveur:', err.message || err);
  }
}

// ── SUPPRIMÉ : plus de lecture localStorage au chargement du module ──
// Le serveur (Firestore) est toujours la source de vérité.

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  // On démarre avec les données initiales, le fetch serveur va les remplacer immédiatement
  const [products, setProducts] = useState(initialProducts);
  const [collections, setCollections] = useState(initialCollections);
  const [hydrated, setHydrated] = useState(false); // toujours false au démarrage → fetch systématique

  // Chargement au démarrage : serveur en priorité, localStorage en fallback
  useEffect(() => {
    (async () => {
      const remote = await loadRemoteCatalog();
      if (remote) {
        setProducts(remote.products);
        setCollections(remote.collections);
        // Met à jour localStorage avec les données fraîches du serveur
        persistCatalogLocally(remote.products, remote.collections);
      } else {
        // Firestore indisponible → fallback localStorage
        const saved = loadStoredCatalog();
        if (saved) {
          setProducts(saved.products);
          setCollections(saved.collections);
        }
      }
      setHydrated(true);
    })();
  }, []); // s'exécute une seule fois au montage

  // Sauvegarde distante uniquement quand ta sœur modifie le catalogue (admin connecté)
  useEffect(() => {
    if (hydrated) {
      persistCatalogLocally(products, collections);
      persistCatalogRemotely(products, collections);
    }
  }, [products, collections, hydrated]);

  const addProduct = useCallback((product) => {
    const { id: _ignored, ...rest } = product;
    let created = null;
    setProducts((prev) => {
      const id = computeNextId(prev);
      created = { ...rest, id, shippingCost: rest.shippingCost ?? 0, showShippingPrice: rest.showShippingPrice ?? true };
      return [...prev, created];
    });
    return created;
  }, []);

  const updateProduct = useCallback((id, updates) => {
    const { id: _ignored, ...rest } = updates;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...rest, shippingCost: rest.shippingCost ?? p.shippingCost ?? 0, showShippingPrice: rest.showShippingPrice ?? p.showShippingPrice ?? true } : p))
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCollection = useCallback((collection) => {
    const id = String(collection.id).trim();
    const entry = {
      id,
      name: String(collection.name).trim(),
      description: String(collection.description ?? '').trim(),
    };
    let added = false;
    setCollections((prev) => {
      if (prev.some((c) => c.id === id)) return prev;
      added = true;
      return [...prev, entry];
    });
    return added;
  }, []);

  const updateCollection = useCallback((id, updates) => {
    const { id: _ignored, ...rest } = updates;
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...rest, id } : c))
    );
  }, []);

  const deleteCollection = useCallback((id) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setProducts((prev) => prev.filter((p) => p.collection !== id));
  }, []);

  const resetCatalog = useCallback(() => {
    setProducts(initialProducts);
    setCollections(initialCollections);
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined' && sessionStorage.getItem('mj_admin_key')) {
      saveAdminCatalog({ products: initialProducts, collections: initialCollections }).catch((err) => {
        console.warn('[ProductsContext] Échec reset serveur :', err.message || err);
      });
    }
  }, []);

  return (
    <ProductsContext.Provider value={{
      products,
      collections,
      addProduct,
      updateProduct,
      deleteProduct,
      addCollection,
      updateCollection,
      deleteCollection,
      resetCatalog,
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts doit être utilisé dans un ProductsProvider');
  }
  return ctx;
}

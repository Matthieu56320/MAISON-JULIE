/**
 * Produits recommandés : hors panier / produit courant, priorité collection et type.
 */
export function getRecommendations(products, {
  excludeIds = [],
  limit = 4,
  currentProduct = null,
} = {}) {
  const exclude = new Set(excludeIds.map(String));
  const available = products.filter((p) => p.inStock && !exclude.has(String(p.id)));

  if (!currentProduct) {
    return available.slice(0, limit);
  }

  const sameCollection = available.filter(
    (p) => p.collection === currentProduct.collection && String(p.id) !== String(currentProduct.id)
  );
  const sameType = available.filter(
    (p) => p.type === currentProduct.type
      && p.collection !== currentProduct.collection
      && String(p.id) !== String(currentProduct.id)
  );
  const rest = available.filter(
    (p) => !sameCollection.includes(p) && !sameType.includes(p)
  );

  const merged = [...sameCollection, ...sameType, ...rest];
  const seen = new Set();
  const unique = merged.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return unique.slice(0, limit);
}

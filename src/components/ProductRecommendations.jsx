import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { getRecommendations } from '../utils/recommendations';
import { C, chauxStyle } from '../theme/colors';

function RecCard({ product, onAdd }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const img = product.images?.[0];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!product.inStock) return;
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      style={{
        background: hovered ? C.white : C.panel,
        border: `1px solid ${C.border}`,
        transition: 'background 0.25s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/produit/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', background: C.bgSoft }}>
          {img && (
            <img
              src={img}
              alt={product.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: hovered ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.45s ease',
              }}
            />
          )}
        </div>
        <div style={{ padding: '14px 16px 10px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.bordeaux, marginBottom: '4px' }}>
            {product.collection}
          </p>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 400, color: C.chocolate, marginBottom: '4px' }}>
            {product.name}
          </h3>
          <p style={{ fontSize: '14px', color: C.muted }}>{product.price.toFixed(2)} €</p>
        </div>
      </Link>
      {product.inStock && (
        <div style={{ padding: '0 16px 16px' }}>
          <button
            type="button"
            onClick={handleAdd}
            style={{
              width: '100%',
              background: added ? C.bordeaux : C.chocolate,
              color: C.white,
              border: 'none',
              padding: '10px',
              fontSize: '10px',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.25s',
            }}
          >
            {added ? '✓ Ajouté' : 'Ajouter au panier'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductRecommendations({
  title = 'Vous aimerez aussi',
  subtitle = 'Sélection pour vous',
  currentProduct = null,
  excludeIds = [],
  limit = 4,
  /** Espace blanc au-dessus (ex. page panier) */
  separated = false,
}) {
  const { products } = useProducts();
  const { addToCart, cart } = useCart();

  const cartIds = cart.map((i) => i.id);
  const allExclude = [...excludeIds, ...cartIds];

  const items = getRecommendations(products, {
    excludeIds: allExclude,
    limit,
    currentProduct,
  });

  if (items.length === 0) return null;

  return (
    <section style={{
      ...chauxStyle(0.12),
      borderTop: `1px solid ${C.border}`,
      marginTop: separated ? 'clamp(32px, 5vw, 56px)' : 0,
      padding: separated
        ? 'clamp(56px, 7vw, 80px) 24px clamp(64px, 8vw, 96px)'
        : 'clamp(48px, 6vw, 72px) 24px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: C.bordeaux, marginBottom: '8px' }}>
          {subtitle}
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(22px, 4vw, 28px)',
          fontWeight: 400,
          color: C.chocolate,
          marginBottom: '32px',
        }}>
          {title}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          {items.map((p) => (
            <RecCard key={p.id} product={p} onAdd={addToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

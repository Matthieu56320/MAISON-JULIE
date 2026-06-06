import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';
import { C, chauxStyle } from '../theme/colors';

function BestSellerCard({ product, preview, onAdd }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const img = product.images?.[0];

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock || preview) return;
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const card = (
    <article
      style={{
        position: 'relative',
        width: '100%',
        background: hovered ? C.white : 'rgba(255, 252, 248, 0.95)',
        border: `1px solid ${C.border}`,
        overflow: 'hidden',
        transition: 'transform 0.35s ease, box-shadow 0.35s ease',
        transform: hovered && !preview ? 'translateY(-4px)' : 'none',
        boxShadow: hovered && !preview ? '0 12px 32px rgba(86, 53, 44, 0.1)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{
        position: 'absolute', top: '12px', left: '12px', zIndex: 2,
        background: C.bordeaux, color: C.white,
        fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase',
        padding: '5px 10px', fontWeight: 500,
      }}>
        Best-seller
      </span>

      <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', background: C.bgSoft }}>
        {img ? (
          <img
            src={img}
            alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.45s ease',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: C.panel }} />
        )}
      </div>

      <div style={{ padding: '18px 16px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.bordeaux, marginBottom: '6px' }}>
          {product.collection}
        </p>
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '17px', fontWeight: 400, color: C.chocolate,
          marginBottom: '8px', lineHeight: 1.25,
        }}>
          {product.name}
        </h3>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: C.chocolate, marginBottom: '14px' }}>
          {product.price.toFixed(2)} €
        </p>

        {!preview && product.inStock && (
          <button
            type="button"
            onClick={handleAdd}
            style={{
              width: '100%',
              background: added ? C.bordeaux : C.chocolate,
              color: C.white,
              border: 'none',
              padding: '11px',
              fontSize: '10px',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {added ? '✓ Ajouté' : 'Ajouter au panier'}
          </button>
        )}
      </div>
    </article>
  );

  if (preview) return card;

  return (
    <Link to={`/produit/${product.id}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
      {card}
    </Link>
  );
}

export default function HomeBestSellers({ preview = false }) {
  const { products } = useProducts();
  const { siteConfig } = useConfig();
  const { addToCart } = useCart();
  const { bestsellers } = siteConfig;

  if (!bestsellers?.enabled) return null;

  let items = products
    .filter((p) => p.bestseller && p.inStock)
    .sort((a, b) => (a.bestsellerRank ?? 99) - (b.bestsellerRank ?? 99));

  if (bestsellers.productIds?.length > 0) {
    const order = bestsellers.productIds.map(String);
    items = order
      .map((id) => products.find((p) => String(p.id) === id && p.inStock))
      .filter(Boolean);
  }

  if (items.length === 0) {
    items = products.filter((p) => p.inStock).slice(0, 3);
  }

  items = items.slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section
      className="mj-chaux"
      style={{
        ...chauxStyle(0.14),
        padding: preview ? '48px 16px' : 'clamp(64px, 8vw, 100px) 24px',
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: preview ? '28px' : '48px' }}>
          {bestsellers.eyebrow && (
            <p style={{
              fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
              color: C.bordeaux, marginBottom: '12px',
            }}>
              {bestsellers.eyebrow}
            </p>
          )}
          {bestsellers.title && (
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: preview ? '26px' : 'clamp(28px, 4vw, 42px)',
              fontWeight: 400, color: C.chocolate, marginBottom: '10px',
            }}>
              {bestsellers.title}
            </h2>
          )}
          {bestsellers.subtitle && (
            <p style={{ fontSize: '15px', color: C.muted, maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
              {bestsellers.subtitle}
            </p>
          )}
        </div>

        <div className="mj-bestsellers-grid">
          {items.map((product) => (
            <BestSellerCard
              key={product.id}
              product={product}
              preview={preview}
              onAdd={addToCart}
            />
          ))}
        </div>

        {!preview && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link
              to="/catalogue"
              style={{
                display: 'inline-block',
                background: C.chocolate,
                color: C.white,
                padding: '14px 36px',
                textDecoration: 'none',
                fontSize: '11px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              Voir toute la boutique
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

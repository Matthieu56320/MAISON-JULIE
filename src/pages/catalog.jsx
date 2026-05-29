import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import RingSizeGuide from '../components/RingSizeGuide';
import PageMeta from '../components/PageMeta';

function collectionLabel(id, collections) {
  const c = collections.find((col) => col.id === id);
  return c ? c.name : id || '';
}

const TYPES = [
  { value: 'Tous', label: 'Tous les bijoux' },
  { value: 'bague', label: 'Bagues' },
  { value: 'collier', label: 'Colliers' },
  { value: 'boucles', label: "Boucles d'oreilles" },
  { value: 'bracelet', label: 'Bracelets' },
];

const SORTS = [
  { value: 'Aucun', label: 'Par défaut' },
  { value: 'Croissant', label: 'Prix croissant' },
  { value: 'Decroissant', label: 'Prix décroissant' },
];

export default function Catalog() {
  const { addToCart } = useCart();
  const { products, collections } = useProducts();
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState('Tous');
  const [selectedCollection, setSelectedCollection] = useState('Tous');

  useEffect(() => {
    const col = searchParams.get('collection');
    if (col && collections.some((c) => c.id === col)) {
      setSelectedCollection(col);
    }
  }, [searchParams, collections]);
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortByPrice, setSortByPrice] = useState('Aucun');
  const [added, setAdded] = useState({});

  // Collections dynamiques depuis le contexte
  const COLLECTIONS = [
    { value: 'Tous', label: 'Toutes les collections' },
    ...collections.map(c => ({ value: c.id, label: c.name })),
  ];

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const min = priceMin !== '' ? Number(priceMin) : null;
    const max = priceMax !== '' ? Number(priceMax) : null;

    let list = products.filter((p) => {
      const matchType = selectedType === 'Tous' || p.type === selectedType;
      const matchCol = selectedCollection === 'Tous' || p.collection === selectedCollection;
      const matchStock = !hideOutOfStock || p.inStock;
      const matchNew = !onlyNew || p.isNew;
      if (!matchType || !matchCol || !matchStock || !matchNew) return false;
      if (min != null && !Number.isNaN(min) && p.price < min) return false;
      if (max != null && !Number.isNaN(max) && p.price > max) return false;
      if (!q) return true;
      const colName = collectionLabel(p.collection, collections).toLowerCase();
      const haystack = [
        p.name,
        p.description,
        p.collection,
        colName,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });

    if (sortByPrice === 'Croissant') return [...list].sort((a, b) => a.price - b.price);
    if (sortByPrice === 'Decroissant') return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [
    products, collections, selectedType, selectedCollection, hideOutOfStock,
    onlyNew, searchQuery, priceMin, priceMax, sortByPrice,
  ]);

  const hasActiveFilters = searchQuery || onlyNew || priceMin || priceMax
    || selectedType !== 'Tous' || selectedCollection !== 'Tous' || hideOutOfStock;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('Tous');
    setSelectedCollection('Tous');
    setHideOutOfStock(false);
    setOnlyNew(false);
    setPriceMin('');
    setPriceMax('');
    setSortByPrice('Aucun');
  };

  const handleAdd = (e, product) => {
    e.preventDefault(); // ne pas naviguer sur le click "Ajouter"
    addToCart(product);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1400);
  };

  const inputStyle = {
    appearance: 'none', WebkitAppearance: 'none',
    background: '#FFFCF8', border: '1px solid #D4C4B0',
    padding: '10px 16px', fontSize: '13px', letterSpacing: '0.3px',
    color: '#56352c', cursor: 'pointer', width: '100%',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FFFCF8', minHeight: '100vh' }}>
      <PageMeta
        title="Catalogue"
        description="Découvrez tous les bijoux Maison Julie — bagues, colliers, bracelets et boucles d'oreilles."
        path="/catalogue"
      />

      {/* ── HEADER ── */}
      <div style={{
        textAlign: 'center',
        padding: 'clamp(48px, 7vw, 96px) 24px 40px',
        borderBottom: '1px solid #D4C4B0',
      }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#620017', marginBottom: '14px' }}>
          Toute la boutique
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 400, color: '#56352c',
        }}>
          Nos bijoux
        </h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── RECHERCHE ── */}
        <div style={{ paddingTop: '32px', marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A6B5C', marginBottom: '8px' }}>
            Rechercher
          </label>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nom, collection…"
            style={{ ...inputStyle, width: '100%', maxWidth: '480px' }}
          />
        </div>

        {/* ── FILTRES ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px', alignItems: 'end',
          padding: '0 0 32px', borderBottom: '1px solid #D4C4B0',
          marginBottom: '24px',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A6B5C', marginBottom: '8px' }}>
              Type
            </label>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={inputStyle}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A6B5C', marginBottom: '8px' }}>
              Collection
            </label>
            <select value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)} style={inputStyle}>
              {COLLECTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A6B5C', marginBottom: '8px' }}>
              Prix min (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A6B5C', marginBottom: '8px' }}>
              Prix max (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="—"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8A6B5C', marginBottom: '8px' }}>
              Trier
            </label>
            <select value={sortByPrice} onChange={e => setSortByPrice(e.target.value)} style={inputStyle}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {selectedType === 'bague' && (
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingTop: '4px' }}>
              <RingSizeGuide compact />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
            <button
              onClick={() => setHideOutOfStock(v => !v)}
              aria-pressed={hideOutOfStock}
              style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: hideOutOfStock ? '#56352c' : '#D4C4B0',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.25s ease', flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: '3px',
                left: hideOutOfStock ? '23px' : '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#FFFCF8', transition: 'left 0.25s ease',
              }} />
            </button>
            <span style={{ fontSize: '13px', color: '#8A6B5C', userSelect: 'none' }}>
              Masquer les épuisés
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={() => setOnlyNew((v) => !v)}
              aria-pressed={onlyNew}
              style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: onlyNew ? '#620017' : '#D4C4B0',
                border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
                transition: 'background 0.25s ease',
              }}
            >
              <span style={{
                position: 'absolute', top: '3px',
                left: onlyNew ? '23px' : '3px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#FFFCF8', transition: 'left 0.25s ease',
              }} />
            </button>
            <span style={{ fontSize: '13px', color: '#8A6B5C', userSelect: 'none' }}>
              Nouveautés uniquement
            </span>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            style={{
              marginBottom: '24px',
              background: 'transparent',
              border: '1px solid #D4C4B0',
              color: '#620017',
              padding: '8px 16px',
              fontSize: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Réinitialiser les filtres
          </button>
        )}

        <p style={{ fontSize: '12px', letterSpacing: '1px', color: '#A89488', marginBottom: '32px', textTransform: 'uppercase' }}>
          {filtered.length} produit{filtered.length > 1 ? 's' : ''}
        </p>

        {/* ── GRILLE ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#A89488' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '12px' }}>Aucun bijou trouvé</p>
            <p style={{ fontSize: '14px' }}>Essayez de modifier vos filtres.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '2px',
          }}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={handleAdd}
                justAdded={!!added[product.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd, justAdded }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/produit/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          background: hovered ? '#E8DCC4' : '#FFFCF8',
          transition: 'background 0.3s ease',
          position: 'relative', overflow: 'hidden',
          cursor: 'pointer',
          height: '100%',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {product.isNew && product.inStock && (
            <div style={{
              background: '#620017', color: '#FFFCF8',
              padding: '4px 12px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
            }}>
              Nouveauté
            </div>
          )}
          {!product.inStock && (
            <div style={{
              background: '#56352c', color: '#FFFCF8',
              padding: '4px 12px', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
            }}>
              Épuisé
            </div>
          )}
        </div>

        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1 / 1' }}>
          <img
            src={product.images?.[0]}
            alt={product.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              background: '#F5EFE6',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.5s ease',
              opacity: product.inStock ? 1 : 0.55,
            }}
          />
        </div>

        <div style={{ padding: '20px 20px 24px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#620017', marginBottom: '6px' }}>
            {product.collection}
          </p>
          <h3 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '17px', fontWeight: 400, color: '#56352c', marginBottom: '6px',
          }}>
            {product.name}
          </h3>
          <p style={{ fontSize: '14px', color: '#8A6B5C', marginBottom: '20px' }}>
            {product.price.toFixed(2)} €
            {product.showShippingPrice && product.shippingCost > 0 && (
              <span style={{ fontSize: '12px', color: '#A89488' }}> + {product.shippingCost.toFixed(2)} €</span>
            )}
          </p>

          <button
            disabled={!product.inStock}
            onClick={(e) => onAdd(e, product)}
            style={{
              width: '100%',
              background: justAdded ? '#620017' : (product.inStock ? '#56352c' : '#D4C4B0'),
              color: product.inStock ? '#FFFCF8' : '#A89488',
              border: 'none', padding: '12px',
              fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
              fontWeight: 500, cursor: product.inStock ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'background 0.3s ease',
            }}
          >
            {justAdded ? '✓ Ajouté' : (product.inStock ? 'Ajouter au panier' : 'Indisponible')}
          </button>
        </div>
      </div>
    </Link>
  );
}
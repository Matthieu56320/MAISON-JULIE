import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import RingSizeGuide from '../components/RingSizeGuide';
import ProductRecommendations from '../components/ProductRecommendations';
import PageMeta from '../components/PageMeta';
import { C } from '../theme/colors';

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useProducts();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  const product = products.find((p) => String(p.id) === String(id));
  const [activeImg, setActiveImg] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px',
      }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: C.chocolate, marginBottom: '12px' }}>
          Bijou introuvable
        </p>
        <p style={{ color: C.muted, marginBottom: '32px' }}>Ce produit n&apos;existe pas ou a été retiré.</p>
        <Link to="/catalogue" style={{
          background: C.chocolate, color: C.white, padding: '14px 36px',
          textDecoration: 'none', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase',
        }}>
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const cartItem = cart.find((i) => i.id === product.id);
  const metaDescription = (product.description || '').slice(0, 155);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const images = product.images || [];
  const isRing = product.type === 'bague';

  const handleAdd = () => {
    if (!product.inStock) return;
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/panier');
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: '100vh' }}>
      <PageMeta
        title={product.name}
        description={metaDescription}
        path={`/produit/${product.id}`}
        image={images[0]}
      />

      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '20px 24px 0',
        display: 'flex', gap: '8px', alignItems: 'center',
        fontSize: '12px', color: C.mutedLight,
      }}>
        <Link to="/" style={{ color: C.mutedLight, textDecoration: 'none' }}>Accueil</Link>
        <span>›</span>
        <Link to="/catalogue" style={{ color: C.mutedLight, textDecoration: 'none' }}>Catalogue</Link>
        <span>›</span>
        <span style={{ color: C.chocolate }}>{product.name}</span>
      </div>

      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '32px 24px 48px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '80px',
        alignItems: 'start',
      }} className="product-grid">

        <div>
          <div style={{
            aspectRatio: '1 / 1', overflow: 'hidden',
            background: C.bgSoft, marginBottom: '12px', position: 'relative',
          }}>
            <img
              src={images[activeImg]}
              alt={product.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                opacity: product.inStock ? 1 : 0.6,
              }}
            />
            {!product.inStock && (
              <div style={{
                position: 'absolute', top: '20px', left: '20px',
                background: C.bordeauxDark, color: C.white,
                padding: '6px 14px', fontSize: '10px',
                letterSpacing: '2px', textTransform: 'uppercase',
              }}>
                Épuisé
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                  style={{
                    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,252,248,0.92)', border: `1px solid ${C.border}`,
                    width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                    fontSize: '18px', color: C.chocolate,
                  }}
                >‹</button>
                <button
                  type="button"
                  onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,252,248,0.92)', border: `1px solid ${C.border}`,
                    width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                    fontSize: '18px', color: C.chocolate,
                  }}
                >›</button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: '72px', height: '72px', padding: 0, cursor: 'pointer',
                    border: `2px solid ${activeImg === i ? C.bordeaux : C.border}`,
                    overflow: 'hidden', background: C.bgSoft, flexShrink: 0,
                  }}
                >
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ paddingTop: '8px' }}>
          <p style={{
            fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase',
            color: C.bordeaux, marginBottom: '12px',
          }}>
            Collection {product.collection}
          </p>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400,
            color: C.chocolate, marginBottom: '16px', lineHeight: 1.2,
          }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '28px' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: C.chocolate }}>
              {product.price.toFixed(2)} €
            </span>
            {product.showShippingPrice && product.shippingCost > 0 ? (
              <span style={{ fontSize: '13px', color: C.muted }}>+ {product.shippingCost.toFixed(2)} € de livraison</span>
            ) : (
              <span style={{ fontSize: '13px', color: C.bordeaux }}>Livraison offerte</span>
            )}
          </div>

          <p style={{
            fontSize: '15px', color: C.muted, lineHeight: 1.75,
            marginBottom: isRing ? '20px' : '36px',
            borderTop: `1px solid ${C.border}`, paddingTop: '28px',
          }}>
            {product.description}
          </p>

          {isRing && (
            <div style={{ marginBottom: '28px' }}>
              <RingSizeGuide compact />
            </div>
          )}

          {cartQty > 0 && (
            <p style={{ fontSize: '13px', color: C.bordeaux, marginBottom: '16px' }}>
              ✓ {cartQty} dans votre panier
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              disabled={!product.inStock}
              onClick={handleAdd}
              style={{
                background: justAdded ? C.bordeaux : (product.inStock ? C.chocolate : C.border),
                color: product.inStock ? C.white : C.mutedLight,
                border: 'none', padding: '16px',
                fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase',
                fontWeight: 500, cursor: product.inStock ? 'pointer' : 'not-allowed',
                fontFamily: "'DM Sans', sans-serif", width: '100%',
              }}
            >
              {justAdded ? '✓ Ajouté au panier' : (product.inStock ? 'Ajouter au panier' : 'Indisponible')}
            </button>

            {product.inStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                style={{
                  background: 'transparent', color: C.bordeaux,
                  border: `1px solid ${C.bordeaux}`, padding: '15px',
                  fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase',
                  fontWeight: 500, cursor: 'pointer', width: '100%',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Commander maintenant
              </button>
            )}
          </div>

          <div style={{
            marginTop: '36px', borderTop: `1px solid ${C.border}`, paddingTop: '28px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            {[
              'Acier inoxydable hypoallergénique',
              'Plaqué or 18k longue durée',
              'Livraison offerte partout en France',
            ].map((text) => (
              <div key={text} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ color: C.bordeaux, fontSize: '10px' }}>✦</span>
                <span style={{ fontSize: '13px', color: C.muted }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductRecommendations
        title="Vous aimerez aussi"
        subtitle="Recommandations"
        currentProduct={product}
        excludeIds={[product.id]}
        limit={4}
      />

      <style>{`
        @media (max-width: 700px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </div>
  );
}

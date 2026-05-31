import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useSearchParams } from 'react-router-dom';
import ProductRecommendations from '../components/ProductRecommendations';
import PageMeta from '../components/PageMeta';
import { createCheckoutSession } from '../api/stripeCheckout';
import { C } from '../theme/colors';

const FLAT_SHIPPING_FEE = 5.00;

export default function Cart() {
  const { cart, addToCart, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const canceled = searchParams.get('annule') === '1';
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Frais de livraison fixes par commande
  const totalShippingCost = cart.length > 0 ? FLAT_SHIPPING_FEE : 0;

  // Total avec frais de livraison
  const totalWithShipping = totalPrice + totalShippingCost;

  const handleCheckout = async () => {
    setCheckoutError('');
    setCheckoutLoading(true);
    try {
      const url = await createCheckoutSession(cart);
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err.message || 'Paiement indisponible. Vérifiez que le serveur API tourne (npm run dev).');
      setCheckoutLoading(false);
    }
  };

  const dismissCanceled = () => {
    searchParams.delete('annule');
    setSearchParams(searchParams, { replace: true });
  };

  if (cart.length === 0) {
    return (
      <>
      <PageMeta title="Panier" description="Votre panier Maison Julie." path="/panier" />
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: C.bg, minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px',
      }}>
        <div style={{
          width: '64px', height: '64px',
          border: `1px solid ${C.border}`, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '32px',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.bordeaux} strokeWidth="1.3">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '32px', fontWeight: 400, color: C.chocolate, marginBottom: '14px',
        }}>
          Votre panier est vide
        </h2>
        <p style={{ fontSize: '15px', color: C.muted, marginBottom: '40px', maxWidth: '340px', lineHeight: 1.65 }}>
          Il semblerait que vous n&apos;ayez pas encore trouvé votre bonheur.
        </p>
        <Link to="/catalogue" style={{
          display: 'inline-block',
          background: C.chocolate, color: C.white,
          padding: '14px 40px', textDecoration: 'none',
          fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          Découvrir nos bijoux
        </Link>

        <div style={{ width: '100%', marginTop: '48px' }}>
          <ProductRecommendations
            title="Coup de cœur du moment"
            subtitle="Pour commencer"
            limit={4}
          />
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <PageMeta title="Panier" description="Votre panier Maison Julie." path="/panier" />
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: '100vh' }}>

      <div style={{
        textAlign: 'center',
        padding: 'clamp(48px, 7vw, 80px) 24px 40px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.bordeaux, marginBottom: '14px' }}>
          {totalItems} article{totalItems > 1 ? 's' : ''}
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 400, color: C.chocolate,
        }}>
          Votre panier
        </h1>
      </div>

      <div style={{
        maxWidth: '1000px', margin: '0 auto',
        padding: '48px 24px 64px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) min(340px, 100%)',
        gap: '48px',
        alignItems: 'start',
      }}
        className="cart-grid"
      >
        <div>
          {canceled && (
            <div style={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              padding: '14px 18px',
              marginBottom: '24px',
              fontSize: '14px',
              color: C.muted,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span>Paiement annulé — votre panier est intact.</span>
              <button
                type="button"
                onClick={dismissCanceled}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: C.bordeaux,
                  fontSize: '18px',
                  lineHeight: 1,
                }}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          )}

          {checkoutError && (
            <div style={{
              background: '#F7F0DB',
              border: '1px solid #A3701A',
              padding: '14px 18px',
              marginBottom: '24px',
              fontSize: '14px',
              color: C.chocolate,
            }}>
              {checkoutError}
            </div>
          )}

          {cart.map((item) => (
            <div key={item.id} style={{
              display: 'grid',
              gridTemplateColumns: '88px 1fr auto',
              gap: '20px',
              alignItems: 'center',
              padding: '24px 0',
              borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{
                width: '88px', height: '88px', overflow: 'hidden',
                background: C.bgSoft, flexShrink: 0,
              }}>
                <img
                  src={item.images?.[0] || item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.bordeaux, marginBottom: '4px' }}>
                  {item.collection}
                </p>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '17px', fontWeight: 400, color: C.chocolate, marginBottom: '4px',
                }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: '13px', color: C.muted }}>{item.price.toFixed(2)} € / pièce</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}` }}>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      width: '36px', height: '36px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '18px', color: C.muted,
                    }}
                  >−</button>
                  <span style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: C.chocolate }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => addToCart(item)}
                    style={{
                      width: '36px', height: '36px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '18px', color: C.muted,
                    }}
                  >+</button>
                </div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: C.chocolate }}>
                  {(item.price * item.quantity).toFixed(2)} €
                </p>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '24px' }}>
            <button
              onClick={clearCart}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
                color: C.mutedLight, textDecoration: 'underline', padding: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Vider le panier
            </button>
          </div>
        </div>

        <div style={{
          background: C.panel,
          padding: '36px 28px',
          border: `1px solid ${C.border}`,
          position: 'sticky',
          top: '88px',
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '22px', fontWeight: 400, color: C.chocolate,
            marginBottom: '28px', paddingBottom: '20px',
            borderBottom: `1px solid ${C.border}`,
          }}>
            Récapitulatif
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: C.muted }}>
              <span>Sous-total</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: C.muted }}>
              <span>Livraison</span>
              <span style={{ color: totalShippingCost > 0 ? C.chocolate : C.bordeaux }}>
                {totalShippingCost > 0 ? `${totalShippingCost.toFixed(2)} €` : '0,00 €'}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: C.mutedLight, lineHeight: 1.6, marginBottom: '24px' }}>
            Frais de livraison fixes de 5 € par commande. Expéditions à partir du lundi, sauf indisponibilité.
          </p>

          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            borderTop: `1px solid ${C.border}`, paddingTop: '20px', marginBottom: '28px',
          }}>
            <span style={{ fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: C.chocolate }}>
              Total
            </span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 400, color: C.chocolate }}>
              {totalWithShipping.toFixed(2)} €
            </span>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={checkoutLoading}
            style={{
              width: '100%',
              background: checkoutLoading ? C.muted : C.chocolate,
              color: C.white,
              border: 'none', padding: '16px',
              fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase',
              fontWeight: 500, cursor: checkoutLoading ? 'wait' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: '14px',
            }}
            onMouseEnter={(e) => { if (!checkoutLoading) e.currentTarget.style.background = C.bordeaux; }}
            onMouseLeave={(e) => { if (!checkoutLoading) e.currentTarget.style.background = C.chocolate; }}
          >
            {checkoutLoading ? 'Redirection…' : 'Passer la commande'}
          </button>

          <p style={{ fontSize: '11px', color: C.mutedLight, textAlign: 'center', marginBottom: '14px', lineHeight: 1.5 }}>
            Paiement sécurisé par Stripe
          </p>

          <Link to="/catalogue" style={{
            display: 'block', textAlign: 'center',
            fontSize: '12px', letterSpacing: '1px', color: C.muted,
            textDecoration: 'underline',
          }}>
            Continuer mes achats
          </Link>
        </div>
      </div>

      {/* Respiration entre panier et recommandations */}
      <div style={{ height: 'clamp(40px, 6vw, 64px)', background: C.bg }} aria-hidden />

      <ProductRecommendations
        title="Complétez votre sélection"
        subtitle="Recommandations"
        excludeIds={cart.map((i) => i.id)}
        limit={4}
        separated
      />

      <style>{`
        @media (max-width: 700px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
    </>
  );
}

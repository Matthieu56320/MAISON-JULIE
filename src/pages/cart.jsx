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

  // Nouvel état pour le mode de livraison : 'shipping' ou 'pickup'
  const [shippingMode, setShippingMode] = useState('shipping');

  // Les frais de port s'annulent si retrait sur place
  const totalShippingCost = (cart.length > 0 && shippingMode === 'shipping') ? FLAT_SHIPPING_FEE : 0;
  const totalWithShipping = totalPrice + totalShippingCost;

  const handleCheckout = async () => {
    setCheckoutError('');
    setCheckoutLoading(true);
    try {
      // On passe le panier ET le mode de livraison choisi à Stripe
      const url = await createCheckoutSession(cart, { shippingMode });
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err.message || 'Paiement indisponible. Vérifiez que le serveur API tourne.');
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
        fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '60px 24px',
      }}>
        <div style={{
          width: '64px', height: '64px', border: `1px solid ${C.border}`, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.bordeaux} strokeWidth="1.3">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 400, color: C.chocolate, marginBottom: '14px' }}>
          Votre panier est vide
        </h2>
        <p style={{ fontSize: '15px', color: C.muted, marginBottom: '40px', maxWidth: '340px', lineHeight: 1.65 }}>
          Il semblerait que vous n&apos;ayez pas encore trouvé votre bonheur.
        </p>
        <Link to="/catalogue" style={{
          display: 'inline-block', background: C.chocolate, color: C.white,
          padding: '14px 40px', textDecoration: 'none', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500,
        }}>
          Découvrir nos bijoux
        </Link>
      </div>
      </>
    );
  }

  return (
    <>
    <PageMeta title="Panier" description="Votre panier Maison Julie." path="/panier" />
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: '100vh' }}>

      <div style={{ textAlign: 'center', padding: 'clamp(48px, 7vw, 80px) 24px 40px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.bordeaux, marginBottom: '14px' }}>
          {totalItems} article{totalItems > 1 ? 's' : ''}
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 400, color: C.chocolate }}>
          Votre panier
        </h1>
      </div>

      <div style={{
        maxWidth: '1000px', margin: '0 auto', padding: '48px 24px 64px',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) min(360px, 100%)', gap: '48px', alignItems: 'start',
      }} className="cart-grid">
        
        {/* COLONNE GAUCHE : LISTE DES ARTICLES */}
        <div>
          {canceled && (
            <div style={{
              background: C.panel, border: `1px solid ${C.border}`, padding: '14px 18px', marginBottom: '24px',
              fontSize: '14px', color: C.muted, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
            }}>
              <span>Paiement annulé — votre panier est intact.</span>
              <button type="button" onClick={dismissCanceled} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.bordeaux, fontSize: '18px', lineHeight: 1 }} aria-label="Fermer">×</button>
            </div>
          )}

          {checkoutError && (
            <div style={{ background: '#F7F0DB', border: '1px solid #A3701A', padding: '14px 18px', marginBottom: '24px', fontSize: '14px', color: C.chocolate }}>
              {checkoutError}
            </div>
          )}

          {cart.map((item) => (
            <div key={`${item.id}_${item.size || 'no-size'}`} style={{
              display: 'grid', gridTemplateColumns: '88px 1fr auto', gap: '20px', alignItems: 'center', padding: '24px 0', borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{ width: '88px', height: '88px', overflow: 'hidden', background: C.bgSoft, flexShrink: 0 }}>
                <img src={item.images?.[0] || item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div>
                <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.bordeaux, marginBottom: '4px' }}>
                  {item.collection}
                </p>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 400, color: C.chocolate, marginBottom: '4px' }}>
                  {item.name}
                </h3>
                {item.size && (
                  <p style={{ fontSize: '12px', color: C.bordeaux, fontWeight: 500, marginBottom: '4px' }}>
                    Taille : FR/EU {item.size}
                  </p>
                )}
                <p style={{ fontSize: '13px', color: C.muted }}>{item.price.toFixed(2)} € / pièce</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}` }}>
                  <button onClick={() => removeFromCart(item.id, item.size)} style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: C.muted }}>−</button>
                  <span style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: 500, color: C.chocolate }}>{item.quantity}</span>
                  <button onClick={() => addToCart(item, item.size)} style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: C.muted }}>+</button>
                </div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: C.chocolate }}>{(item.price * item.quantity).toFixed(2)} €</p>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '24px' }}>
            <button onClick={clearCart} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: C.mutedLight, textDecoration: 'underline', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
              Vider le panier
            </button>
          </div>
        </div>

        {/* COLONNE DROITE : RÉCAPITULATIF & CHOIX DE LIVRAISON */}
        <div style={{ background: C.panel, padding: '36px 28px', border: `1px solid ${C.border}`, position: 'sticky', top: '88px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 400, color: C.chocolate, marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${C.border}` }}>
            Récapitulatif
          </h2>

          {/* BLOC SÉLECTEUR DE LIVRAISON */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: C.chocolate, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Mode de livraison :
            </p>
            
            {/* Option 1 : Colissimo / Domicile */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
              border: `1px solid ${shippingMode === 'shipping' ? C.bordeaux : C.border}`,
              background: shippingMode === 'shipping' ? C.bg : C.white,
              cursor: 'pointer', marginBottom: '10px', fontSize: '14px', color: C.chocolate
            }}>
              <input 
                type="radio" name="shipping_mode" value="shipping" 
                checked={shippingMode === 'shipping'} 
                onChange={() => setShippingMode('shipping')}
                style={{ accentColor: C.bordeaux }}
              />
              <div style={{ flex: 1 }}>
                <strong>Livraison à domicile</strong>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>Suivi Colissimo (5,00 €)</div>
              </div>
            </label>

            {/* Option 2 : Click & Collect */}
            <label style={{
              display: 'flex', alignItems: 'start', gap: '10px', padding: '12px',
              border: `1px solid ${shippingMode === 'pickup' ? C.bordeaux : C.border}`,
              background: shippingMode === 'pickup' ? C.bg : C.white,
              cursor: 'pointer', fontSize: '14px', color: C.chocolate
            }}>
              <input 
                type="radio" name="shipping_mode" value="pickup" 
                checked={shippingMode === 'pickup'} 
                onChange={() => setShippingMode('pickup')}
                style={{ accentColor: C.bordeaux, marginTop: '3px' }}
              />
              <div style={{ flex: 1 }}>
                <strong>Retrait sur place (Gratuit)</strong>
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px', lineHeight: 1.4 }}>
                  À l'adresse : <br />
                  <span style={{ color: C.chocolate, fontWeight: 500 }}>8 rue Joseph Fortune<br />56320 Le Faouët</span>
                </div>
                <div style={{ fontSize: '11px', color: C.bordeaux, marginTop: '6px', fontStyle: 'italic' }}>
                  Aux horaires d'ouverture
                </div>
              </div>
            </label>
          </div>

          {/* CALCULS FINAUX */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: C.muted }}>
              <span>Sous-total</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: C.muted }}>
              <span>Frais de port</span>
              <span style={{ color: totalShippingCost > 0 ? C.chocolate : C.bordeaux, fontWeight: totalShippingCost === 0 ? 600 : 400 }}>
                {totalShippingCost > 0 ? `${totalShippingCost.toFixed(2)} €` : 'Offert'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1px solid ${C.border}`, paddingTop: '20px', marginBottom: '28px' }}>
            <span style={{ fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: C.chocolate }}>Total</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 400, color: C.chocolate }}>
              {totalWithShipping.toFixed(2)} €
            </span>
          </div>

          <button
            type="button" onClick={handleCheckout} disabled={checkoutLoading}
            style={{ width: '100%', background: checkoutLoading ? C.muted : C.chocolate, color: C.white, border: 'none', padding: '16px', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500, cursor: checkoutLoading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: '14px' }}
            onMouseEnter={(e) => { if (!checkoutLoading) e.currentTarget.style.background = C.bordeaux; }}
            onMouseLeave={(e) => { if (!checkoutLoading) e.currentTarget.style.background = C.chocolate; }}
          >
            {checkoutLoading ? 'Redirection…' : 'Passer la commande'}
          </button>
          <p style={{ fontSize: '11px', color: C.mutedLight, textAlign: 'center', marginBottom: '14px', lineHeight: 1.5 }}>
            Paiement sécurisé par Stripe
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

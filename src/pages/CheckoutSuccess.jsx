import React, { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PageMeta from '../components/PageMeta';
import { apiUrl } from '../api/apiBase';
import { C } from '../theme/colors';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    clearCart();
    if (!sessionId) return;
    fetch(apiUrl('/api/record-order'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {});
  }, []);

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: C.bg,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '60px 24px',
    }}>
      <PageMeta
        title="Commande confirmée"
        description="Merci pour votre commande chez Maison Julie."
        path="/commande/merci"
      />

      <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.bordeaux, marginBottom: '16px' }}>
        Merci
      </p>
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(28px, 5vw, 44px)',
        fontWeight: 400,
        color: C.chocolate,
        marginBottom: '16px',
      }}>
        Paiement reçu
      </h1>
      <p style={{ fontSize: '15px', color: C.muted, maxWidth: '440px', lineHeight: 1.7, marginBottom: '8px' }}>
        Votre commande est confirmée. Un e-mail de confirmation vous sera envoyé par Stripe si vous l&apos;avez indiqué.
      </p>
      {sessionId && (
        <p style={{ fontSize: '12px', color: C.mutedLight, marginBottom: '32px' }}>
          Référence : {sessionId.slice(0, 20)}…
        </p>
      )}

      <Link
        to="/catalogue"
        style={{
          display: 'inline-block',
          background: C.chocolate,
          color: C.white,
          padding: '14px 36px',
          textDecoration: 'none',
          fontSize: '12px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
        }}
      >
        Continuer mes achats
      </Link>
    </div>
  );
}

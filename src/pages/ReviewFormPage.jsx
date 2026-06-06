import React, { useState } from 'react';

function Stars({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '28px', padding: '0 2px', lineHeight: 1,
            color: s <= (hovered || value) ? '#620017' : '#D4C4B0',
            transition: 'color 0.15s',
          }}
        >★</button>
      ))}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 0',
  border: 'none',
  borderBottom: '1px solid #D4C4B0',
  background: 'transparent',
  fontSize: '15px',
  color: '#56352c',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: '10px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#8A6B5C',
  display: 'block',
  marginBottom: '4px',
};

export default function ReviewFormPage() {
  const [form, setForm] = useState({
    author: '',
    location: '',
    rating: 5,
    text: '',
    orderRef: '',
  });
  const [focused, setFocused] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.author.trim()) return setErrorMsg('Votre prénom et nom sont requis.');
    if (!form.text.trim() || form.text.trim().length < 20) return setErrorMsg('Votre témoignage doit faire au moins 20 caractères.');
    setErrorMsg('');
    setStatus('sending');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Une erreur est survenue, veuillez réessayer.');
      setStatus('error');
    }
  };

  // ── Écran succès ──
  if (status === 'success') {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        minHeight: '80vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
        background: 'transparent',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '40px', marginBottom: '24px' }}>✦</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 400, color: '#56352c', marginBottom: '16px',
          }}>
            Merci pour votre avis
          </h2>
          <p style={{ fontSize: '15px', color: '#8A6B5C', lineHeight: 1.7, marginBottom: '36px' }}>
            Votre témoignage a bien été reçu. Il sera examiné et publié prochainement sur notre page d'accueil.
          </p>
          <a href="/" style={{
            display: 'inline-block', background: '#56352c', color: '#FFFCF8',
            padding: '13px 32px', textDecoration: 'none',
            fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500,
          }}>
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: 'transparent',
      minHeight: '100vh',
    }}>
      {/* En-tête */}
      <section style={{
        padding: 'clamp(64px, 10vw, 120px) 24px clamp(40px, 6vw, 72px)',
        textAlign: 'center',
        borderBottom: '1px solid #D4C4B0',
      }}>
        <p style={{
          fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
          color: '#620017', marginBottom: '20px',
        }}>
          Témoignages
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 400, color: '#56352c',
          marginBottom: '20px', lineHeight: 1.1,
        }}>
          Partagez votre expérience
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 2vw, 16px)', color: '#8A6B5C',
          maxWidth: '460px', margin: '0 auto', lineHeight: 1.7,
        }}>
          Votre avis compte beaucoup. Il aide d'autres clientes à choisir en confiance et nous encourage à continuer.
        </p>
      </section>

      {/* Formulaire */}
      <section style={{
        maxWidth: '640px', margin: '0 auto',
        padding: 'clamp(48px, 7vw, 96px) 24px clamp(64px, 10vw, 120px)',
      }}>

        {/* Note */}
        <div style={{ marginBottom: '36px' }}>
          <label style={labelStyle}>Votre note *</label>
          <Stars value={form.rating} onChange={(r) => set('rating', r)} />
        </div>

        {/* Nom + Ville */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div>
            <label style={labelStyle}>Prénom Nom *</label>
            <input
              style={{
                ...inputStyle,
                borderBottomColor: focused === 'author' ? '#620017' : '#D4C4B0',
                borderBottomWidth: focused === 'author' ? '2px' : '1px',
              }}
              value={form.author}
              placeholder="Marie D."
              onFocus={() => setFocused('author')}
              onBlur={() => setFocused('')}
              onChange={(e) => set('author', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Ville / Région</label>
            <input
              style={{
                ...inputStyle,
                borderBottomColor: focused === 'location' ? '#620017' : '#D4C4B0',
                borderBottomWidth: focused === 'location' ? '2px' : '1px',
              }}
              value={form.location}
              placeholder="Rennes"
              onFocus={() => setFocused('location')}
              onBlur={() => setFocused('')}
              onChange={(e) => set('location', e.target.value)}
            />
          </div>
        </div>

        {/* Témoignage */}
        <div style={{ marginBottom: '32px' }}>
          <label style={labelStyle}>Votre témoignage *</label>
          <textarea
            style={{
              ...inputStyle,
              border: 'none',
              borderBottom: `${focused === 'text' ? '2px' : '1px'} solid ${focused === 'text' ? '#620017' : '#D4C4B0'}`,
              resize: 'vertical',
              lineHeight: 1.7,
              minHeight: '120px',
              padding: '12px 0',
            }}
            rows={5}
            value={form.text}
            placeholder="Décrivez votre expérience — le bijou, la livraison, ce que vous avez aimé..."
            onFocus={() => setFocused('text')}
            onBlur={() => setFocused('')}
            onChange={(e) => set('text', e.target.value)}
          />
          <p style={{ fontSize: '12px', color: '#A89488', marginTop: '6px' }}>
            {form.text.length} caractère{form.text.length > 1 ? 's' : ''} {form.text.length < 20 && form.text.length > 0 ? `— encore ${20 - form.text.length} minimum` : ''}
          </p>
        </div>

        {/* Référence commande (optionnel) */}
        <div style={{ marginBottom: '40px' }}>
          <label style={labelStyle}>Référence commande (optionnel)</label>
          <input
            style={{
              ...inputStyle,
              borderBottomColor: focused === 'orderRef' ? '#620017' : '#D4C4B0',
              borderBottomWidth: focused === 'orderRef' ? '2px' : '1px',
            }}
            value={form.orderRef}
            placeholder="cs_live_... (visible dans votre email de confirmation)"
            onFocus={() => setFocused('orderRef')}
            onBlur={() => setFocused('')}
            onChange={(e) => set('orderRef', e.target.value)}
          />
          <p style={{ fontSize: '12px', color: '#A89488', marginTop: '6px' }}>
            Facultatif — permet de vérifier que vous êtes bien cliente Maison Julie.
          </p>
        </div>

        {/* Erreur */}
        {(status === 'error' || errorMsg) && (
          <div style={{
            background: '#FDF2F2', border: '1px solid #E8BCBC',
            padding: '14px 18px', marginBottom: '24px',
            fontSize: '13px', color: '#8B3333', lineHeight: 1.5,
          }}>
            {errorMsg}
          </div>
        )}

        {/* Bouton */}
        <button
          type="button"
          disabled={status === 'sending'}
          onClick={handleSubmit}
          onMouseEnter={(e) => { if (status !== 'sending') e.currentTarget.style.background = '#620017'; }}
          onMouseLeave={(e) => { if (status !== 'sending') e.currentTarget.style.background = '#56352c'; }}
          style={{
            background: status === 'sending' ? '#A89488' : '#56352c',
            color: '#FFFCF8', border: 'none',
            padding: '14px 40px',
            fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500,
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'background 0.2s',
            width: '100%',
          }}
        >
          {status === 'sending' ? 'Envoi en cours...' : 'Envoyer mon témoignage'}
        </button>

        <p style={{ fontSize: '12px', color: '#A89488', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
          Votre avis sera relu avant publication. Aucun compte requis.
        </p>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea { font-family: 'DM Sans', sans-serif; }
        @media (max-width: 500px) {
          .review-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
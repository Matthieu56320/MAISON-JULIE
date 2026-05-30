import React, { useState } from 'react';
import PageMeta from '../components/PageMeta';
import { useConfig } from '../context/ConfigContext';


const inputBase = {
  width: '100%',
  padding: '14px 16px',
  border: '1px solid #D4C4B0',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  background: 'transparent',
  fontSize: '15px',
  color: '#56352c',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  borderRadius: 0,
};

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{
        fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase',
        color: '#8A6B5C',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Contact() {
  const { siteConfig } = useConfig();
  const contactEmail = siteConfig.footer?.email || 'contact@maison-julie.fr';

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      if (FORMSPREE_ID) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/contact/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            message: formData.message,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Envoi impossible. Réessayez plus tard.');
        }
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/contact/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || undefined,
            message: formData.message,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Envoi impossible. Réessayez plus tard.');
        }
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSending(false);
    }
  };

  const getInputStyle = (name) => ({
    ...inputBase,
    borderBottomColor: focused === name ? '#620017' : '#D4C4B0',
    borderBottomWidth: focused === name ? '2px' : '1px',
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FFFCF8', minHeight: '100vh' }}>
      <PageMeta
        title="Contact"
        description="Contactez Maison Julie pour une question, une commande personnalisée ou un conseil bijou."
        path="/contact"
      />

      <div style={{
        textAlign: 'center',
        padding: 'clamp(48px, 7vw, 96px) 24px 40px',
        borderBottom: '1px solid #D4C4B0',
      }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#620017', marginBottom: '14px' }}>
          Écrivez-nous
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 400, color: '#56352c',
          marginBottom: '16px',
        }}>
          Contact
        </h1>
        <p style={{ fontSize: '15px', color: '#8A6B5C', maxWidth: '420px', margin: '0 auto', lineHeight: 1.7 }}>
          Une question sur un bijou, une commande personnalisée ? Nous vous répondons dans les plus brefs délais.
        </p>
      </div>

      <div style={{
        maxWidth: '1000px', margin: '0 auto',
        padding: '64px 24px 80px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) min(380px,100%)',
        gap: '80px',
        alignItems: 'start',
      }}
        className="contact-grid"
      >
        <div>
          {submitted && (
            <div style={{
              background: '#E8DCC4', border: '1px solid #620017',
              padding: '20px 24px', marginBottom: '40px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <span style={{ fontSize: '20px', color: '#620017' }}>✨</span>
              <div>
                <p style={{ fontWeight: 500, color: '#56352c', marginBottom: '2px' }}>Message envoyé !</p>
                <p style={{ fontSize: '13px', color: '#8A6B5C' }}>Merci, nous vous répondons très vite.</p>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: '#F7F0DB', border: '1px solid #A3701A',
              padding: '16px 20px', marginBottom: '24px', fontSize: '14px', color: '#56352c',
            }}>
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            <Field label="Nom complet *">
              <input
                type="text" name="name" value={formData.name}
                onChange={handleChange} required placeholder="Votre nom"
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                style={getInputStyle('name')}
              />
            </Field>

            <Field label="Adresse e-mail *">
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} required placeholder="exemple@domaine.com"
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                style={getInputStyle('email')}
              />
            </Field>

            <Field label="Téléphone (facultatif)">
              <input
                type="tel" name="phone" value={formData.phone}
                onChange={handleChange} placeholder="06 12 34 56 78"
                onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                style={getInputStyle('phone')}
              />
            </Field>

            <Field label="Message *">
              <textarea
                name="message" value={formData.message}
                onChange={handleChange} required
                rows={6} placeholder="Comment pouvons-nous vous aider ?"
                onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                style={{
                  ...getInputStyle('message'),
                  resize: 'vertical', lineHeight: 1.65,
                  border: `1px solid ${focused === 'message' ? '#620017' : '#D4C4B0'}`,
                  padding: '14px 16px',
                }}
              />
            </Field>

            <button
              type="submit"
              disabled={sending}
              style={{
                alignSelf: 'flex-start',
                background: sending ? '#8A6B5C' : '#56352c',
                color: '#FFFCF8',
                border: 'none', padding: '16px 44px',
                fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase',
                fontWeight: 500, cursor: sending ? 'wait' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'background 0.25s ease',
              }}
              onMouseEnter={(e) => { if (!sending) e.currentTarget.style.background = '#620017'; }}
              onMouseLeave={(e) => { if (!sending) e.currentTarget.style.background = '#56352c'; }}
            >
              {sending ? 'Envoi…' : 'Envoyer le message'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#620017', marginBottom: '16px' }}>
              Nous trouver
            </p>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '22px', fontWeight: 400, color: '#56352c', marginBottom: '12px',
            }}>
              {siteConfig.footer?.brandName || 'Maison Julie'}
            </h3>
            <p style={{ fontSize: '14px', color: '#8A6B5C', lineHeight: 1.7 }}>
              {siteConfig.footer?.address}<br />
              <a href={`mailto:${contactEmail}`} style={{ color: '#620017' }}>{contactEmail}</a>
            </p>
          </div>

          <div style={{ borderTop: '1px solid #D4C4B0', paddingTop: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#620017', marginBottom: '16px' }}>
              Horaires
            </p>
            <p style={{ fontSize: '14px', color: '#8A6B5C', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {siteConfig.footer?.hours}
            </p>
          </div>

          <div style={{ borderTop: '1px solid #D4C4B0', paddingTop: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#620017', marginBottom: '16px' }}>
              Délai de réponse
            </p>
            <p style={{ fontSize: '14px', color: '#8A6B5C', lineHeight: 1.7 }}>
              Nous répondons sous <strong style={{ color: '#56352c', fontWeight: 500 }}>24 à 48h</strong>, du lundi au vendredi.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </div>
  );
}

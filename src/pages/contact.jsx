import React, { useEffect, useRef } from 'react';
import PageMeta from '../components/PageMeta';
import { useConfig } from '../context/ConfigContext';

const channels = [
  {
    name: 'Instagram',
    handle: '@maisonjuliestudio',
    url: 'https://instagram.com/maisonjuliestudio',
    description: 'Découvrez nos créations, coulisses et nouveautés',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    handle: '@julieeetco',
    url: 'https://tiktok.com/@julieeetco',
    description: 'Vidéos de création, tendances bijoux et inspirations',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 26, height: 26 }}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
      </svg>
    ),
  },
  {
    name: 'Email',
    handle: 'julieberthier9@gmail.com',
    url: 'mailto:julieberthier9@gmail.com',
    description: 'Pour toute demande, commande personnalisée ou question',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m2 7 10 7 10-7"/>
      </svg>
    ),
  },
];

export default function Contact() {
  const { siteConfig } = useConfig();
  const cardsRef = useRef([]);

  useEffect(() => {
    const cards = cardsRef.current;
    cards.forEach((card, i) => {
      if (!card) return;
      card.style.opacity = '0';
      card.style.transform = 'translateY(32px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 200 + i * 120);
    });
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FFFCF8', minHeight: '100vh' }}>
      <PageMeta
        title="Contact"
        description="Contactez Maison Julie sur Instagram, TikTok ou par email."
        path="/contact"
      />

      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: 'clamp(64px, 10vw, 120px) 24px 56px',
        borderBottom: '1px solid #D4C4B0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Décoration fond */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(98,0,23,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <p style={{
          fontSize: '11px', letterSpacing: '3.5px', textTransform: 'uppercase',
          color: '#620017', marginBottom: '20px',
        }}>
          Écrivez-nous
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 400, color: '#56352c',
          marginBottom: '20px', lineHeight: 1.1,
        }}>
          Contact
        </h1>
        <p style={{
          fontSize: '16px', color: '#8A6B5C',
          maxWidth: '400px', margin: '0 auto', lineHeight: 1.8,
        }}>
          Retrouvez-nous sur nos réseaux ou écrivez-nous directement — nous répondons sous 24&nbsp;à&nbsp;48h.
        </p>
      </div>

      {/* Cards */}
      <div style={{
        maxWidth: '760px', margin: '0 auto',
        padding: 'clamp(48px, 8vw, 96px) 24px',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        {channels.map((ch, i) => (
          <a
            key={ch.name}
            href={ch.url}
            target={ch.name !== 'Email' ? '_blank' : undefined}
            rel="noopener noreferrer"
            ref={el => cardsRef.current[i] = el}
            style={{
              display: 'flex', alignItems: 'center', gap: '28px',
              padding: '32px 36px',
              background: '#fff',
              border: '1px solid #E8DCC4',
              textDecoration: 'none',
              transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#620017';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(98,0,23,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E8DCC4';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Icône */}
            <div style={{
              flexShrink: 0,
              width: 56, height: 56,
              background: '#F7F0E8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#620017',
            }}>
              {ch.icon}
            </div>

            {/* Texte */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                color: '#620017', marginBottom: '4px',
              }}>
                {ch.name}
              </p>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                fontWeight: 400, color: '#56352c',
                marginBottom: '6px',
              }}>
                {ch.handle}
              </p>
              <p style={{ fontSize: '13px', color: '#8A6B5C', lineHeight: 1.6 }}>
                {ch.description}
              </p>
            </div>

            {/* Flèche */}
            <div style={{
              flexShrink: 0, color: '#D4C4B0',
              transition: 'color 0.2s, transform 0.2s',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* Bas de page */}
      <div style={{
        textAlign: 'center',
        padding: '0 24px clamp(48px, 8vw, 96px)',
        color: '#8A6B5C', fontSize: '13px', lineHeight: 1.8,
      }}>
        <div style={{ width: 40, height: 1, background: '#D4C4B0', margin: '0 auto 24px' }} />
        <p>Nous répondons sous <strong style={{ color: '#56352c', fontWeight: 500 }}>24 à 48h</strong>, du lundi au vendredi.</p>
        <p style={{ marginTop: 6 }}>France</p>
      </div>

      <style>{`
        @media (max-width: 560px) {
          a[href] > div:last-child { display: none; }
        }
      `}</style>
    </div>
  );
}
import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';

function Stars({ rating = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '14px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: '14px', color: s <= rating ? '#620017' : '#D4C4B0' }}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsSection({ preview = false }) {
  const { siteConfig } = useConfig();
  const reviews = siteConfig?.reviews;
  const [current, setCurrent] = useState(0);

  // Section masquée ou sans avis
  if (!reviews || reviews.enabled === false) return null;
  const items = reviews.items ?? [];
  if (items.length === 0) return null;

  const eyebrow = reviews.eyebrow || 'Témoignages';
  const title = reviews.title || "Ce qu'elles disent";

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);

  return (
    <section style={{
      background: '#E8DCC4',
      padding: 'clamp(56px, 8vw, 96px) 24px',
      borderTop: '1px solid #D4C4B0',
      borderBottom: '1px solid #D4C4B0',
    }}>
      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
        <p style={{
          fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase',
          color: '#620017', marginBottom: '14px',
        }}>
          {eyebrow}
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(26px, 4vw, 42px)',
          fontWeight: 400, color: '#56352c',
        }}>
          {title}
        </h2>
      </div>

      {/* Grille desktop / carrousel mobile */}
      <>
        {/* Grille desktop : jusqu'à 3 avis côte à côte */}
        <div className="mj-reviews-grid" style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`,
          gap: '24px',
        }}>
          {items.slice(0, 6).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Carrousel mobile */}
        <div className="mj-reviews-carousel" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <ReviewCard review={items[current]} />
          {items.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
              <button onClick={prev} style={navBtn}>‹</button>
              <div style={{ display: 'flex', gap: '6px' }}>
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    style={{
                      width: i === current ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: i === current ? '#620017' : '#D4C4B0',
                      border: 'none', cursor: 'pointer',
                      transition: 'all 0.3s',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
              <button onClick={next} style={navBtn}>›</button>
            </div>
          )}
        </div>
      </>

      {/* Appel à l'action */}
      <div style={{ textAlign: 'center', marginTop: 'clamp(40px, 5vw, 64px)' }}>
        <p style={{ fontSize: '14px', color: '#8A6B5C', marginBottom: '16px' }}>
          Vous aussi, partagez votre expérience
        </p>
        <a href="/avis" style={{
          display: 'inline-block', background: 'transparent', color: '#56352c',
          padding: '12px 32px', textDecoration: 'none',
          fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500,
          border: '1px solid #56352c',
        }}>
          Laisser un avis
        </a>
      </div>

      <style>{`
        .mj-reviews-grid { display: grid !important; }
        .mj-reviews-carousel { display: none !important; }
        @media (max-width: 700px) {
          .mj-reviews-grid { display: none !important; }
          .mj-reviews-carousel { display: block !important; }
        }
      `}</style>
    </section>
  );
}

function ReviewCard({ review }) {
  if (!review) return null;
  return (
    <div style={{
      background: '#FFFCF8',
      border: '1px solid #D4C4B0',
      padding: '32px 28px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Stars rating={review.rating ?? 5} />

      {/* Guillemets décoratifs */}
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '13px', lineHeight: 1.8,
        color: '#56352c', flex: 1,
        fontStyle: 'italic',
      }}>
        « {review.text} »
      </p>

      {/* Auteur */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #D4C4B0' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#56352c', marginBottom: '2px' }}>
          {review.author}
        </p>
        <p style={{ fontSize: '12px', color: '#8A6B5C' }}>
          {[review.location, review.date].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  );
}

const navBtn = {
  background: 'none',
  border: '1px solid #D4C4B0',
  width: '36px', height: '36px',
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: '18px',
  color: '#56352c',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  lineHeight: 1,
};
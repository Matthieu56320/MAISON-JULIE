import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { getHeroSectionStyle } from '../utils/heroBackground';
import HomeBestSellers from './HomeBestSellers';
import ReviewsSection from './Reviewssection';
import { C } from '../theme/colors';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Section({ preview, children, delay = 0, style = {} }) {
  if (preview) {
    return <div style={style}>{children}</div>;
  }
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CtaLink({ preview, to, style, children, ...hover }) {
  if (preview) {
    return <span style={{ ...style, cursor: 'default' }}>{children}</span>;
  }
  return (
    <Link to={to} style={style} {...hover}>
      {children}
    </Link>
  );
}

function universCardLink(collectionId) {
  if (collectionId) {
    return `/catalogue?collection=${encodeURIComponent(collectionId)}`;
  }
  return '/catalogue';
}

export default function HomePageContent({ preview = false }) {
  const { siteConfig } = useConfig();
  const { hero, univers, engagements, cta } = siteConfig;

  const heroBackground = getHeroSectionStyle(hero);
  const veilAmount = hero.showBgImage ? Math.min(100, Math.max(0, Number(hero.overlayOpacity ?? 85))) : 100;

  const heroMinHeight = preview ? 'min(520px, 70vh)' : '96vh';

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: 'transparent',
      minHeight: preview ? 'auto' : '100vh',
      pointerEvents: preview ? 'none' : 'auto',
    }}>
      <section style={{
        minHeight: heroMinHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: preview ? '64px 20px 48px' : '100px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
        ...heroBackground,
      }}>
        <div style={{
          position: 'absolute', top: '-120px', right: '-120px',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, #E8DECE 0%, transparent 70%)',
          opacity: hero.showBgImage ? Math.max(0.1, 0.6 - veilAmount / 200) : 0.6,
          pointerEvents: 'none',
        }} />

        {hero.eyebrow && (
          <p style={{
            fontSize: preview ? '10px' : '11px', letterSpacing: '3px', textTransform: 'uppercase',
            color: '#620017', marginBottom: preview ? '16px' : '28px',
          }}>
            {hero.eyebrow}
          </p>
        )}

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: preview ? 'clamp(32px, 6vw, 52px)' : 'clamp(42px, 8vw, 88px)',
          fontWeight: 400, lineHeight: 1.08,
          color: '#56352c', marginBottom: preview ? '16px' : '28px', maxWidth: '720px',
        }}>
          {hero.title}
        </h1>

        {hero.description && (
          <p style={{
            fontSize: preview ? '14px' : 'clamp(15px, 2vw, 18px)', fontWeight: 300,
            color: '#8A6B5C', marginBottom: preview ? '28px' : '48px', maxWidth: '440px', lineHeight: 1.7,
          }}>
            {hero.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <CtaLink preview={preview} to="/catalogue" style={{
            display: 'inline-block', background: '#56352c', color: '#FFFCF8',
            padding: preview ? '10px 24px' : '14px 36px', textDecoration: 'none',
            fontSize: preview ? '11px' : '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500,
          }}>
            {hero.primaryCta}
          </CtaLink>
          <CtaLink preview={preview} to="/contact" style={{
            display: 'inline-block', background: 'transparent', color: '#56352c',
            padding: preview ? '10px 24px' : '14px 36px', textDecoration: 'none',
            fontSize: preview ? '11px' : '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500,
            border: '1px solid #56352c',
          }}>
            {hero.secondaryCta}
          </CtaLink>
        </div>
      </section>

      <HomeBestSellers preview={preview} />
      <ReviewsSection preview={preview} />

      {univers.cards.length > 0 && (
        <section style={{ padding: preview ? '48px 16px' : 'clamp(60px, 8vw, 120px) 24px', maxWidth: '1100px', margin: '0 auto' }}>
          <Section preview={preview}>
            <div style={{ textAlign: 'center', marginBottom: preview ? '32px' : '64px' }}>
              {univers.eyebrow && (
                <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#620017', marginBottom: '16px' }}>
                  {univers.eyebrow}
                </p>
              )}
              {univers.title && (
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: preview ? '28px' : 'clamp(28px, 4vw, 48px)', fontWeight: 400, color: '#56352c' }}>
                  {univers.title}
                </h2>
              )}
            </div>
          </Section>

          <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {univers.cards.map((col, i) => {
              const cardInner = (
                <div
                  style={{
                    background: '#E8DCC4', padding: col.image?.trim() ? 0 : (preview ? '32px 24px' : '48px 36px'),
                    position: 'relative', overflow: 'hidden', border: '1px solid #D4C4B0',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: col.accent || '#620017' }} />
                  {col.image?.trim() && (
                    <img src={col.image.trim()} alt="" style={{ width: '100%', height: preview ? '140px' : '200px', objectFit: 'cover', display: 'block' }} />
                  )}
                  <div style={{ padding: col.image?.trim() ? (preview ? '20px' : '32px 36px') : 0 }}>
                    {col.eyebrow && (
                      <p style={{ fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#620017', marginBottom: '12px' }}>
                        {col.eyebrow}
                      </p>
                    )}
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: preview ? '22px' : '26px', fontWeight: 400, color: '#56352c', marginBottom: '8px' }}>
                      {col.name}
                    </h3>
                    {col.tagline && (
                      <p style={{ fontSize: '14px', color: '#8A6B5C', lineHeight: 1.6, marginBottom: '20px' }}>{col.tagline}</p>
                    )}
                    <span style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#56352c', borderBottom: '1px solid #620017', paddingBottom: '2px' }}>
                      {col.linkLabel || 'Voir la collection →'}
                    </span>
                  </div>
                </div>
              );

              return (
                <Section key={col.id} preview={preview} delay={i * 120}>
                  {preview ? cardInner : (
                    <Link to={universCardLink(col.collectionId)} style={{ textDecoration: 'none' }}>
                      <div
                        style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {cardInner}
                      </div>
                    </Link>
                  )}
                </Section>
              );
            })}
          </div>
        </section>
      )}

      {engagements.items.length > 0 && (
        <section style={{ background: '#620017', padding: preview ? '48px 16px' : 'clamp(60px, 8vw, 100px) 24px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <Section preview={preview}>
              {engagements.eyebrow && (
                <p style={{ textAlign: 'center', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#E8DCC4', marginBottom: '16px' }}>
                  {engagements.eyebrow}
                </p>
              )}
              {engagements.title && (
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: preview ? '26px' : 'clamp(26px, 4vw, 40px)', fontWeight: 400, color: '#FFFCF8', textAlign: 'center', marginBottom: preview ? '32px' : '64px' }}>
                  {engagements.title}
                </h2>
              )}
            </Section>

            <div style={{ display: 'grid', gridTemplateColumns: preview ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: preview ? '28px' : '40px' }}>
              {engagements.items.map((f, i) => (
                <Section key={f.id} preview={preview} delay={i * 100}>
                  <div style={{ textAlign: 'center' }}>
                    {f.icon && <div style={{ fontSize: '20px', color: '#E8DCC4', marginBottom: '16px' }}>{f.icon}</div>}
                    <h4 style={{ fontSize: '15px', fontWeight: 500, color: '#FFFCF8', marginBottom: '8px' }}>{f.label}</h4>
                    {f.desc && <p style={{ fontSize: '13px', color: '#A89488', lineHeight: 1.65 }}>{f.desc}</p>}
                  </div>
                </Section>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: preview ? '48px 16px' : 'clamp(80px, 10vw, 140px) 24px', textAlign: 'center', background: 'transparent' }}>
        <Section preview={preview}>
          {cta.eyebrow && (
            <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#620017', marginBottom: '16px' }}>
              {cta.eyebrow}
            </p>
          )}
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: preview ? '28px' : 'clamp(30px, 5vw, 56px)', fontWeight: 400, color: '#56352c', marginBottom: '16px', lineHeight: 1.15 }}>
            {cta.title}
            {cta.titleEmphasis && (
              <>
                <br />
                <em style={{ fontStyle: 'italic', color: '#620017' }}>{cta.titleEmphasis}</em>
              </>
            )}
          </h2>
          {cta.description && (
            <p style={{ fontSize: '15px', color: '#8A6B5C', maxWidth: '380px', margin: '0 auto 28px' }}>{cta.description}</p>
          )}
          <CtaLink preview={preview} to="/catalogue" style={{
            display: 'inline-block', background: '#620017', color: '#FFFCF8',
            padding: '14px 36px', textDecoration: 'none',
            fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500,
          }}>
            {cta.buttonText}
          </CtaLink>
        </Section>
      </section>
    </div>
  );
}

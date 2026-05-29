import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { C } from '../theme/colors';

export default function Footer() {
  const { siteConfig } = useConfig();
  const { footer } = siteConfig;

  return (
    <footer style={{
      background: C.bordeaux,
      color: C.announcementText,
      marginTop: 'auto',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: 'clamp(48px, 6vw, 72px) 24px 32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
      }}>
        <div>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '22px',
            marginBottom: '16px',
            color: C.white,
          }}>
            {footer.brandName}
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.7, opacity: 0.9 }}>
            {footer.tagline}
          </p>
        </div>

        <div>
          <p style={sectionLabel}>Contact</p>
          <p style={{ fontSize: '14px', lineHeight: 1.85 }}>
            <a href={`mailto:${footer.email}`} style={linkStyle}>{footer.email}</a>
            <br />
            {footer.address}
          </p>
        </div>

        <div>
          <p style={sectionLabel}>Horaires</p>
          <p style={{ fontSize: '14px', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
            {footer.hours}
          </p>
        </div>

        <div>
          <p style={sectionLabel}>Suivez-nous</p>
          {footer.instagramUrl && (
            <a
              href={footer.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...linkStyle, display: 'inline-block', marginBottom: '16px' }}
            >
              Instagram {footer.instagramHandle}
            </a>
          )}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/catalogue" style={linkStyle}>Catalogue</Link>
            <Link to="/contact" style={linkStyle}>Contact</Link>
            <Link to="/cgv" style={linkStyle}>CGV</Link>
            <Link to="/mentions-legales" style={linkStyle}>Mentions légales</Link>
          </nav>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,252,248,0.15)',
        textAlign: 'center',
        padding: '20px 24px',
        fontSize: '12px',
        letterSpacing: '0.5px',
        opacity: 0.85,
      }}>
        © {new Date().getFullYear()} {footer.brandName}. Tous droits réservés.
      </div>
    </footer>
  );
}

const sectionLabel = {
  fontSize: '10px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  marginBottom: '14px',
  opacity: 0.75,
};

const linkStyle = {
  color: '#F5EFE8',
  textDecoration: 'none',
  fontSize: '14px',
  transition: 'opacity 0.2s',
};

import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { C } from '../theme/colors';

export default function Footer() {
  const { siteConfig } = useConfig();
  const { footer } = siteConfig;
  const defaultFooter = {
    email: 'julieberthier9@gmail.com',
    address: 'France — expéditions à partir du lundi, 5 € de livraison',
    hours: 'Commandes en ligne 7j/7\nExpéditions à partir du lundi, sauf indisponibilité',
    instagramUrl: 'https://instagram.com/maisonjuliestudio',
    instagramHandle: '@maisonjuliestudio',
    tiktokUrl: 'https://tiktok.com/@julieeetco',
    tiktokHandle: '@julieeetco',
  };
  const email = footer.email === 'contact@maison-julie.fr' ? defaultFooter.email : (footer.email || defaultFooter.email);
  const address = footer.address?.includes('livraison offerte') ? defaultFooter.address : (footer.address || defaultFooter.address);
  const hours = footer.hours?.includes('Lundi – Vendredi') ? defaultFooter.hours : (footer.hours || defaultFooter.hours);
  const sanitizedInstagramUrl = footer.instagramUrl?.trim();
  const instagramUrl = sanitizedInstagramUrl && !/instagram\.com\/?$/i.test(sanitizedInstagramUrl)
    ? sanitizedInstagramUrl
    : defaultFooter.instagramUrl;
  const instagramHandle = footer.instagramHandle || defaultFooter.instagramHandle;
  const sanitizedTiktokUrl = footer.tiktokUrl?.trim();
  const tiktokUrl = sanitizedTiktokUrl && !/tiktok\.com\/?(\@.*)?$/i.test(sanitizedTiktokUrl)
    ? sanitizedTiktokUrl
    : defaultFooter.tiktokUrl;
  const tiktokHandle = footer.tiktokHandle || defaultFooter.tiktokHandle;

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
            <a href={`mailto:${email}`} style={linkStyle}>{email}</a>
            <br />
            {address}
          </p>
        </div>

        <div>
          <p style={sectionLabel}>Horaires</p>
          <p style={{ fontSize: '14px', lineHeight: 1.85, whiteSpace: 'pre-line' }}>
            {hours}
          </p>
        </div>

        <div>
          <p style={sectionLabel}>Suivez-nous</p>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...linkStyle, display: 'inline-block', marginBottom: '16px' }}
            >
              Instagram {instagramHandle}
            </a>
          )}
          {tiktokUrl && (
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...linkStyle, display: 'inline-block', marginBottom: '16px' }}
            >
              TikTok {tiktokHandle}
            </a>
          )}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/catalogue" style={linkStyle}>Catalogue</Link>
            <Link to="/contact" style={linkStyle}>Contact</Link>
            <Link to="/avis" style={linkStyle}>Laisser un avis</Link>
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

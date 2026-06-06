import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext'; // ✦ Import du contexte d'authentification

export default function Navbar() {
  const { totalItems } = useCart();
  const { siteConfig } = useConfig();
  const { user } = useAuth(); // ✦ Récupération de l'utilisateur connecté
  const location = useLocation();
  const { announcement } = siteConfig;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (to) => location.pathname === to;

  const navBg = (!isHome || scrolled)
    ? 'rgba(255,252,248,0.97)'
    : 'transparent';
  const navBorder = (!isHome || scrolled)
    ? '1px solid #D4C4B0'
    : '1px solid transparent';

  // ✦ Détermination du lien du compte selon l'état Firebase
  const accountLink = user ? '/mon-compte' : '/connexion';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --cream: #FFFCF8;
          --gold: #620017;
          --charcoal: #56352c;
          --muted: #8A6B5C;
          --border: #D4C4B0;
        }

        *, *::before, *::after { box-sizing: border-box; }

        body {
          background: #FFFCF8;
          color: #56352c;
          font-family: 'DM Sans', sans-serif;
          margin: 0;
          -webkit-font-smoothing: antialiased;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes mobileIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .mj-nav-link {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-decoration: none;
          position: relative;
          padding-bottom: 3px;
          transition: color 0.2s;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
        }
        .mj-nav-link::after {
          content: '';
          position: absolute; bottom: -1px; left: 0;
          width: 0; height: 1px;
          background: #620017;
          transition: width 0.3s ease;
        }
        .mj-nav-link:hover::after,
        .mj-nav-link.active::after { width: 100%; }
        .mj-nav-link.active { color: #620017 !important; }
        .mj-nav-link:hover { color: #620017 !important; }

        .mj-mobile-link {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 7vw, 40px);
          font-weight: 400;
          color: #FFFCF8;
          text-decoration: none;
          display: block;
          padding: 8px 0;
          transition: color 0.2s;
          animation: fadeDown 0.35s ease both;
        }
        .mj-mobile-link:hover { color: #620017; }

        .mj-icon-btn {
          background: none; border: none; cursor: pointer;
          position: relative; padding: 0;
          display: flex; align-items: center;
          transition: opacity 0.2s;
          text-decoration: none;
        }
        .mj-icon-btn:hover { opacity: 0.55; }

        .mj-hamburger {
          display: none;
          background: none; border: none; cursor: pointer;
          flex-direction: column; gap: 5px; padding: 4px;
        }
        .mj-hamburger span {
          display: block; width: 22px; height: 1.5px;
          background: #56352c;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        @media (max-width: 680px) {
          .mj-nav-links { display: none !important; }
          .mj-hamburger { display: flex !important; }
        }
      `}</style>

      {announcement.enabled && announcement.text?.trim() && (
        <div style={{
          background: '#620017',
          color: '#E8DCC4',
          textAlign: 'center',
          padding: '10px 24px',
          fontSize: '10px',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          ✦&nbsp;&nbsp;{announcement.text.trim()}&nbsp;&nbsp;✦
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: navBg,
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: navBorder,
        transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
        boxShadow: scrolled ? '0 1px 24px rgba(60,36,21,0.07)' : 'none',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 32px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              fontWeight: 400,
              color: '#56352c',
              letterSpacing: '0.3px',
            }}>
              Maison Julie
            </span>
          </Link>

          {/* Liens desktop */}
          <div className="mj-nav-links" style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`mj-nav-link${isActive(link.to) ? ' active' : ''}`}
                style={{ color: '#56352c' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Droite : compte + panier + burger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            {/* ✦ Icône Compte / Profil */}
            <Link to={accountLink} className="mj-icon-btn" aria-label="Mon compte">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={user ? "#620017" : "#56352c"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Icône Panier */}
            <Link to="/panier" className="mj-icon-btn" aria-label="Panier">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#56352c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-7px', right: '-8px',
                  background: '#620017',
                  color: '#FFFCF8',
                  borderRadius: '50%',
                  width: '17px', height: '17px',
                  fontSize: '9px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              className="mj-hamburger"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <span style={{ transform: menuOpen ? 'rotate(45deg) translate(4.5px, 4.5px)' : 'none' }} />
              <span style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'scaleX(0)' : 'none' }} />
              <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(4.5px, -4.5px)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── OVERLAY MENU MOBILE ── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99,
          background: '#56352c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          animation: 'mobileIn 0.25s ease both',
        }}>
          <div style={{ width: '24px', height: '1px', background: '#620017', marginBottom: '32px' }} />

          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className="mj-mobile-link"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {link.label}
            </Link>
          ))}

          {/* ✦ Lien Compte Mobile */}
          <Link
            to={accountLink}
            className="mj-mobile-link"
            style={{ animationDelay: `${navLinks.length * 70}ms` }}
          >
            {user ? 'Mon Compte' : 'Se Connecter'}
          </Link>

          <Link
            to="/panier"
            className="mj-mobile-link"
            style={{
              marginTop: '28px',
              fontSize: '14px',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: '#E8DCC4',
              fontFamily: "'DM Sans', sans-serif",
              animationDelay: `${(navLinks.length + 1) * 70}ms`,
            }}
          >
            Panier {totalItems > 0 ? `(${totalItems})` : ''}
          </Link>
        </div>
      )}
    </>
  );
}
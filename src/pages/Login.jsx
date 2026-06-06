import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/mon-compte');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email ou mot de passe incorrect.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Veuillez réessayer dans quelques minutes.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .mj-auth-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #D4C4B0;
          border-radius: 4px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #56352c;
          background: #FFFCF8;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .mj-auth-input:focus { border-color: #620017; }
        .mj-auth-input::placeholder { color: #B8A898; }
        .mj-auth-btn {
          width: 100%;
          padding: 15px;
          background: #620017;
          color: #FFFCF8;
          border: none;
          border-radius: 4px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s;
          margin-top: 8px;
        }
        .mj-auth-btn:hover:not(:disabled) { background: #8A0020; }
        .mj-auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .mj-auth-link { color: #620017; text-decoration: none; }
        .mj-auth-link:hover { text-decoration: underline; }
      `}</style>

      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        background: '#FFFCF8',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Titre */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '40px', height: '1px',
              background: '#D4C4B0',
              margin: '0 auto 24px',
            }} />
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '28px',
              fontWeight: 400,
              color: '#56352c',
              margin: '0 0 8px',
            }}>
              Connexion
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#8A6B5C', margin: 0 }}>
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <div style={{
              background: '#FFF0F0',
              border: '1px solid #F5C4C4',
              borderRadius: '4px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#8B2020',
            }}>
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: '#8A6B5C',
                marginBottom: '8px',
              }}>
                Adresse e-mail
              </label>
              <input
                className="mj-auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#8A6B5C',
                }}>
                  Mot de passe
                </label>
                <Link to="/mot-de-passe-oublie" className="mj-auth-link" style={{ fontSize: '12px' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                className="mj-auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button className="mj-auth-btn" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            margin: '32px 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: '#D4C4B0' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#B8A898' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: '#D4C4B0' }} />
          </div>

          {/* Lien inscription */}
          <p style={{
            textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: '#8A6B5C',
            margin: 0,
          }}>
            Pas encore de compte ?{' '}
            <Link to="/inscription" className="mj-auth-link" style={{ fontWeight: 500 }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

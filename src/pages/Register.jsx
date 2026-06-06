import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await register(email, password, displayName);
      navigate('/mon-compte');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Un compte existe déjà avec cet email. Essayez de vous connecter.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Adresse email invalide.');
      } else if (err.code === 'auth/weak-password') {
        setError('Mot de passe trop faible. Utilisez au moins 6 caractères.');
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
        .mj-two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .mj-two-cols { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        background: '#FFFCF8',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>

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
              Créer un compte
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#8A6B5C', margin: 0 }}>
              Suivez vos commandes et gérez votre espace
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

            {/* Prénom + Nom */}
            <div className="mj-two-cols">
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
                  Prénom
                </label>
                <input
                  className="mj-auth-input"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Marie"
                  required
                  autoComplete="given-name"
                />
              </div>
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
                  Nom
                </label>
                <input
                  className="mj-auth-input"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Mot de passe */}
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
                Mot de passe
              </label>
              <input
                className="mj-auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                required
                autoComplete="new-password"
              />
            </div>

            {/* Confirmation */}
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
                Confirmer le mot de passe
              </label>
              <input
                className="mj-auth-input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <button className="mj-auth-btn" type="submit" disabled={loading}>
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Lien connexion */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#D4C4B0' }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#B8A898' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: '#D4C4B0' }} />
          </div>

          <p style={{
            textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: '#8A6B5C',
            margin: 0,
          }}>
            Déjà un compte ?{' '}
            <Link to="/connexion" className="mj-auth-link" style={{ fontWeight: 500 }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

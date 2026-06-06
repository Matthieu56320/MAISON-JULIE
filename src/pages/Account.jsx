import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';

const STATUS_LABELS = {
  paid: { label: 'Payée', color: '#1A6B3C', bg: '#F0FFF4', border: '#C4E8D1' },
  pending: { label: 'En attente', color: '#8A5C00', bg: '#FFFBF0', border: '#E8D5A0' },
  shipped: { label: 'Expédiée', color: '#185FA5', bg: '#EEF5FF', border: '#B5CEFF' },
  delivered: { label: 'Livrée', color: '#1A6B3C', bg: '#F0FFF4', border: '#C4E8D1' },
  cancelled: { label: 'Annulée', color: '#8B2020', bg: '#FFF0F0', border: '#F5C4C4' },
};

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] || { label: status || 'En cours', color: '#8A6B5C', bg: '#F5F0EC', border: '#D4C4B0' };
  return (
    <span style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.5px',
      fontWeight: 500,
    }}>
      {s.label}
    </span>
  );
}

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [tab, setTab] = useState('orders');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/connexion');
      return;
    }
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('customerEmail', '==', user.email),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Erreur chargement commandes:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  const displayName = user.displayName || user.email;
  const firstName = user.displayName ? user.displayName.split(' ')[0] : '';

  const tabs = [
    { key: 'orders', label: 'Mes commandes' },
    { key: 'infos', label: 'Mes informations' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .mj-account-tab {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #B8A898;
          padding: 12px 0;
          position: relative;
          transition: color 0.2s;
        }
        .mj-account-tab.active {
          color: #620017;
        }
        .mj-account-tab::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: #620017;
          transition: width 0.3s ease;
        }
        .mj-account-tab.active::after { width: 100%; }
        .mj-account-tab:hover { color: #620017; }
        .mj-logout-btn {
          background: none;
          border: 1px solid #D4C4B0;
          color: #8A6B5C;
          padding: '8px 20px';
          border-radius: 4px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          padding: 8px 20px;
        }
        .mj-logout-btn:hover {
          border-color: #620017;
          color: #620017;
        }
        .mj-order-card {
          border: 1px solid #D4C4B0;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 12px;
          transition: box-shadow 0.2s;
        }
        .mj-order-card:hover { box-shadow: 0 2px 12px rgba(86,53,44,0.08); }
        .mj-order-toggle {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #620017;
          padding: 0;
          text-decoration: underline;
        }
        .mj-order-toggle:hover { color: #8A0020; }
        @media (max-width: 600px) {
          .mj-order-header { flex-direction: column !important; gap: 8px !important; }
        }
      `}</style>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '60px 24px 80px',
        background: '#FFFCF8',
        minHeight: 'calc(100vh - 64px)',
      }}>

        {/* En-tête */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ width: '40px', height: '1px', background: '#D4C4B0', marginBottom: '24px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '28px',
                fontWeight: 400,
                color: '#56352c',
                margin: '0 0 6px',
              }}>
                {firstName ? `Bonjour, ${firstName}` : 'Mon compte'}
              </h1>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#8A6B5C',
                margin: 0,
              }}>
                {user.email}
              </p>
            </div>
            <button className="mj-logout-btn" onClick={handleLogout}>
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div style={{
          display: 'flex',
          gap: '32px',
          borderBottom: '1px solid #D4C4B0',
          marginBottom: '40px',
        }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`mj-account-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ONGLET COMMANDES */}
        {tab === 'orders' && (
          <div>
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#B8A898' }}>
                  Chargement de vos commandes...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>✦</div>
                <p style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '20px',
                  color: '#56352c',
                  margin: '0 0 8px',
                }}>
                  Aucune commande pour l'instant
                </p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: '#8A6B5C',
                  margin: '0 0 28px',
                }}>
                  Vos prochaines commandes apparaîtront ici
                </p>
                <Link
                  to="/catalogue"
                  style={{
                    display: 'inline-block',
                    padding: '12px 28px',
                    background: '#620017',
                    color: '#FFFCF8',
                    textDecoration: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    transition: 'background 0.2s',
                  }}
                >
                  Découvrir la collection
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrder === order.id;
                const date = order.createdAt?.toDate?.()
                  ? order.createdAt.toDate().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—';
                const orderNum = order.stripeSessionId
                  ? order.stripeSessionId.slice(-8).toUpperCase()
                  : order.id.slice(-8).toUpperCase();

                return (
                  <div key={order.id} className="mj-order-card">
                    {/* En-tête de la commande */}
                    <div
                      className="mj-order-header"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        background: '#FAF7F4',
                        borderBottom: isExpanded ? '1px solid #D4C4B0' : 'none',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '12px',
                          color: '#8A6B5C',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                        }}>
                          Commande #{orderNum}
                        </span>
                        <p style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '13px',
                          color: '#B8A898',
                          margin: '4px 0 0',
                        }}>
                          {date}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <StatusBadge status={order.fulfillmentStatus || order.status || 'paid'} />
                        <span style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: '16px',
                          color: '#56352c',
                        }}>
                          {typeof order.total === 'number' ? order.total.toFixed(2) : '—'} €
                        </span>
                        <button
                          className="mj-order-toggle"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        >
                          {isExpanded ? 'Réduire' : 'Voir le détail'}
                        </button>
                      </div>
                    </div>

                    {/* Détail de la commande */}
                    {isExpanded && (
                      <div style={{ padding: '20px' }}>
                        {order.items && order.items.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {order.items.map((item, i) => (
                              <div key={i} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 0',
                                borderBottom: i < order.items.length - 1 ? '1px solid #F0EAE4' : 'none',
                              }}>
                                <div>
                                  <p style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '14px',
                                    color: '#56352c',
                                    margin: '0 0 4px',
                                    fontWeight: 500,
                                  }}>
                                    {item.name || item.description}
                                  </p>
                                  {item.variant && (
                                    <p style={{
                                      fontFamily: "'DM Sans', sans-serif",
                                      fontSize: '12px',
                                      color: '#8A6B5C',
                                      margin: 0,
                                    }}>
                                      {item.variant}
                                    </p>
                                  )}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <p style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '13px',
                                    color: '#56352c',
                                    margin: 0,
                                  }}>
                                    {item.quantity > 1 && `${item.quantity} ×  `}
                                    {typeof item.price === 'number' ? item.price.toFixed(2) : item.amount_total ? (item.amount_total / 100).toFixed(2) : '—'} €
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#B8A898' }}>
                            Détail des articles non disponible.
                          </p>
                        )}

                        {order.shippingAddress && (
                          <div style={{
                            marginTop: '20px',
                            padding: '14px 16px',
                            background: '#FAF7F4',
                            borderRadius: '4px',
                            border: '1px solid #EAE0D8',
                          }}>
                            <p style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '11px',
                              letterSpacing: '1.5px',
                              textTransform: 'uppercase',
                              color: '#8A6B5C',
                              margin: '0 0 8px',
                            }}>
                              Adresse de livraison
                            </p>
                            <p style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '13px',
                              color: '#56352c',
                              margin: 0,
                              lineHeight: '1.6',
                            }}>
                              {order.shippingAddress.line1}<br />
                              {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                              {order.shippingAddress.postal_code} {order.shippingAddress.city}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ONGLET INFORMATIONS */}
        {tab === 'infos' && (
          <div style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div style={{
                padding: '20px',
                border: '1px solid #D4C4B0',
                borderRadius: '6px',
              }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#8A6B5C',
                  margin: '0 0 6px',
                }}>
                  Nom complet
                </p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: '#56352c',
                  margin: 0,
                  fontWeight: 500,
                }}>
                  {user.displayName || '—'}
                </p>
              </div>

              <div style={{
                padding: '20px',
                border: '1px solid #D4C4B0',
                borderRadius: '6px',
              }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#8A6B5C',
                  margin: '0 0 6px',
                }}>
                  Adresse e-mail
                </p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  color: '#56352c',
                  margin: 0,
                  fontWeight: 500,
                }}>
                  {user.email}
                </p>
              </div>

              <div style={{
                padding: '16px 20px',
                background: '#FAF7F4',
                borderRadius: '6px',
                border: '1px solid #EAE0D8',
              }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: '#8A6B5C',
                  margin: '0 0 10px',
                }}>
                  Besoin de modifier vos informations ou votre mot de passe ?
                </p>
                <Link
                  to="/mot-de-passe-oublie"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    color: '#620017',
                    textDecoration: 'none',
                    letterSpacing: '0.5px',
                  }}
                >
                  Réinitialiser mon mot de passe →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useProducts } from '../../context/ProductsContext';
import SiteContentEditor from './SiteContentEditor';
import ImageUploadField from '../../components/ImageUploadField';
import {
  setAdminSessionKey,
  clearAdminSessionKey,
  fetchAdminOrders,
  fetchAdminCustomers,
  syncStripeOrders,
  updateOrderFulfillment,
} from '../../api/adminApi';

function formatOrderDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─────────────────────────────────────────────
// Styles partagés
// ─────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1px solid #D4C4B0', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  background: 'transparent', fontSize: '14px', color: '#56352c',
  fontFamily: "'DM Sans', sans-serif", outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};
const labelStyle = {
  fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
  color: '#8A6B5C', display: 'block', marginBottom: '6px',
};
const btnPrimary = {
  background: '#56352c', color: '#FFFCF8', border: 'none',
  padding: '12px 24px', fontSize: '11px', letterSpacing: '1.5px',
  textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s',
};
const btnGold = {
  ...btnPrimary, background: 'transparent', color: '#620017',
  border: '1px solid #620017',
};
const btnDanger = {
  ...btnPrimary, background: 'transparent', color: '#D44B4B',
  border: '1px solid #D44B4B',
};

// ─────────────────────────────────────────────
// Composant : Formulaire Produit (ajout ou édition)
// ─────────────────────────────────────────────
function ProductForm({ initial, collections, onSave, onCancel }) {
  const buildEmpty = () => ({
    name: '', collection: collections[0]?.id || '', type: 'bracelet',
    price: '', shippingCost: '0', showShippingPrice: true, inStock: true, bestseller: false, isNew: false, description: '', images: '',
  });
  const [form, setForm] = useState(initial ? {
    ...initial,
    images: (initial.images || []).join('\n'),
  } : buildEmpty());

  useEffect(() => {
    if (initial) return;
    setForm((f) => {
      const valid = collections.some((c) => c.id === f.collection);
      if (valid) return f;
      return { ...f, collection: collections[0]?.id || '' };
    });
  }, [collections, initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!collections.length) {
      return alert('Créez d\'abord une collection dans l\'onglet Collections.');
    }
    const price = parseFloat(String(form.price).replace(',', '.'));
    const shippingCost = parseFloat(String(form.shippingCost).replace(',', '.'));
    if (!form.name.trim()) return alert('Le nom du bijou est requis.');
    if (form.price === '' || Number.isNaN(price) || price < 0) return alert('Indiquez un prix valide.');
    if (Number.isNaN(shippingCost) || shippingCost < 0) return alert('Indiquez un frais de livraison valide.');
    if (!form.collection) return alert('Choisissez une collection.');
    const parsed = {
      name: form.name.trim(),
      collection: form.collection,
      type: form.type,
      price,
      shippingCost,
      showShippingPrice: Boolean(form.showShippingPrice),
      inStock: Boolean(form.inStock),
      bestseller: Boolean(form.bestseller),
      isNew: Boolean(form.isNew),
      description: form.description.trim(),
      images: String(form.images).split('\n').map(s => s.trim()).filter(Boolean),
    };
    onSave(parsed);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <label style={labelStyle}>Nom du bijou *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex : Bague Agate Rose" />
        </div>
        <div>
          <label style={labelStyle}>Prix (€) *</label>
          <input style={inputStyle} type="number" step="0.5" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label style={labelStyle}>Frais de livraison (€)</label>
          <input style={inputStyle} type="number" step="0.5" value={form.shippingCost} onChange={e => set('shippingCost', e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label style={labelStyle}>Collection</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.collection} onChange={e => set('collection', e.target.value)}>
            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Type</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.type} onChange={e => set('type', e.target.value)}>
            {['bague', 'collier', 'boucles', 'bracelet'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, border: '1px solid #D4C4B0', borderRadius: 0, resize: 'vertical', lineHeight: 1.65, padding: '12px 14px' }}
          rows={4}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Décrivez le bijou : matière, dimensions, finitions..."
        />
      </div>

      <ImageUploadField
        label="Importer une photo"
        value=""
        allowUrl
        onChange={(url) => {
          const lines = form.images.split('\n').map((s) => s.trim()).filter(Boolean);
          set('images', [...lines, url].join('\n'));
        }}
        hint="Ordinateur ou téléphone — chaque import ajoute une photo au bijou."
      />
      {form.images.split('\n').filter(Boolean).length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {form.images.split('\n').filter(Boolean).map((src, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <img src={src.trim()} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', border: '1px solid #D4C4B0' }} />
              <button
                type="button"
                onClick={() => {
                  const lines = form.images.split('\n').filter(Boolean);
                  lines.splice(i, 1);
                  set('images', lines.join('\n'));
                }}
                style={{
                  position: 'absolute', top: 2, right: 2, width: 20, height: 20,
                  background: '#56352c', color: '#FFFCF8', border: 'none', cursor: 'pointer', fontSize: '12px',
                }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => set('inStock', !form.inStock)}
          style={{
            width: '44px', height: '24px', borderRadius: '12px',
            background: form.inStock ? '#56352c' : '#D4C4B0',
            border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
            transition: 'background 0.25s',
          }}
        >
          <span style={{
            position: 'absolute', top: '3px',
            left: form.inStock ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#FFFCF8', transition: 'left 0.25s',
          }} />
        </button>
        <span style={{ fontSize: '13px', color: '#8A6B5C' }}>
          {form.inStock ? 'En stock' : 'Épuisé'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={() => set('bestseller', !form.bestseller)}
          style={{
            width: '44px', height: '24px', borderRadius: '12px',
            background: form.bestseller ? '#620017' : '#D4C4B0',
            border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: '3px', left: form.bestseller ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%', background: '#FFFCF8',
            transition: 'left 0.25s',
          }} />
        </button>
        <span style={{ fontSize: '13px', color: '#8A6B5C' }}>
          Afficher dans les best-sellers (accueil)
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={() => set('isNew', !form.isNew)}
          style={{
            width: '44px', height: '24px', borderRadius: '12px',
            background: form.isNew ? '#620017' : '#D4C4B0',
            border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: '3px', left: form.isNew ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%', background: '#FFFCF8',
            transition: 'left 0.25s',
          }} />
        </button>
        <span style={{ fontSize: '13px', color: '#8A6B5C' }}>
          Nouveauté (filtre catalogue)
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={() => set('showShippingPrice', !form.showShippingPrice)}
          style={{
            width: '44px', height: '24px', borderRadius: '12px',
            background: form.showShippingPrice ? '#620017' : '#D4C4B0',
            border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: '3px', left: form.showShippingPrice ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%', background: '#FFFCF8',
            transition: 'left 0.25s',
          }} />
        </button>
        <span style={{ fontSize: '13px', color: '#8A6B5C' }}>
          Afficher le prix de livraison
        </span>
      </div>

      <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: '1px solid #D4C4B0' }}>
        <button style={btnPrimary} onClick={handleSave}
          onMouseEnter={e => e.currentTarget.style.background = '#620017'}
          onMouseLeave={e => e.currentTarget.style.background = '#56352c'}
        >
          {initial ? 'Enregistrer les modifications' : 'Créer le bijou'}
        </button>
        <button style={{ ...btnPrimary, background: 'transparent', color: '#8A6B5C', border: '1px solid #D4C4B0' }} onClick={onCancel}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#56352c'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#D4C4B0'}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Composant : Formulaire Collection
// ─────────────────────────────────────────────
function CollectionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { id: '', name: '', description: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSave = () => {
    const id = form.id.trim();
    const name = form.name.trim();
    if (!id || !name) return alert('Identifiant et nom requis.');
    onSave({ id, name, description: form.description.trim() });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Identifiant * (ex : "Perle")</label>
          <input style={inputStyle} value={form.id} onChange={e => set('id', e.target.value)} placeholder="Perle" disabled={!!initial} />
          {!initial && <p style={{ fontSize: '12px', color: '#A89488', marginTop: '4px' }}>Utilisé comme clé interne. Ne plus changer après création.</p>}
        </div>
        <div>
          <label style={labelStyle}>Nom affiché *</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Collection Perle" />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Description courte</label>
        <input style={inputStyle} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Une ligne qui décrit l'esprit de la collection" />
      </div>
      <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #D4C4B0', paddingTop: '16px' }}>
        <button style={btnPrimary} onClick={handleSave}
          onMouseEnter={e => e.currentTarget.style.background = '#620017'}
          onMouseLeave={e => e.currentTarget.style.background = '#56352c'}
        >
          {initial ? 'Enregistrer' : 'Créer la collection'}
        </button>
        <button style={{ ...btnPrimary, background: 'transparent', color: '#8A6B5C', border: '1px solid #D4C4B0' }} onClick={onCancel}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#56352c'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#D4C4B0'}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TABLEAU DE BORD PRINCIPAL
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const { products, collections, addProduct, updateProduct, deleteProduct, addCollection, updateCollection, deleteCollection } = useProducts();

  // Auth
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pwFocused, setPwFocused] = useState(false);

  // Navigation onglets
  const [tab, setTab] = useState('site'); // site | orders | products | collections

  // UI état
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, name }
  const [successMsg, setSuccessMsg] = useState('');

  const [orders, setOrders] = useState([]);
  const [registeredClients, setRegisteredClients] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSyncing, setOrdersSyncing] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const loadOrdersData = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const { orders: list } = await fetchAdminOrders();
      const { customers } = await fetchAdminCustomers();
      setOrders(list);
      setRegisteredClients(customers);
    } catch (err) {
      setOrdersError(err.message || 'Impossible de charger les commandes Stripe.');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized && tab === 'orders') {
      loadOrdersData();
    }
  }, [isAuthorized, tab, loadOrdersData]);

  const handleSyncStripe = async () => {
    setOrdersSyncing(true);
    setOrdersError('');
    try {
      const data = await syncStripeOrders();
      setOrders(data.orders || []);
      setRegisteredClients(data.customers || []);
      flash(`✓ ${data.synced} commande(s) importée(s) depuis Stripe.`);
    } catch (err) {
      setOrdersError(err.message || 'Synchronisation échouée.');
    } finally {
      setOrdersSyncing(false);
    }
  };

  // Flash message
  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ── Handlers produits
  const handleSaveProduct = (data) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      flash('✓ Bijou mis à jour avec succès.');
    } else {
      addProduct(data);
      flash('✓ Bijou ajouté au catalogue.');
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    deleteProduct(id);
    setDeleteConfirm(null);
    flash('Bijou supprimé du catalogue.');
  };

  // ── Handlers collections
  const handleSaveCollection = (data) => {
    if (editingCollection) {
      updateCollection(editingCollection.id, {
        name: data.name,
        description: data.description,
      });
      flash('✓ Collection mise à jour.');
    } else {
      if (collections.some((c) => c.id === data.id)) {
        return alert(`Une collection avec l'identifiant « ${data.id} » existe déjà.`);
      }
      const added = addCollection(data);
      if (!added) {
        return alert('Impossible de créer la collection. Vérifiez l\'identifiant.');
      }
      flash('✓ Nouvelle collection créée.');
    }
    setShowCollectionForm(false);
    setEditingCollection(null);
  };

  const handleDeleteCollection = (id) => {
    deleteCollection(id);
    setDeleteConfirm(null);
    flash('Collection supprimée (et ses produits retirés du catalogue).');
  };

  const toggleOrderStatus = async (order) => {
    const next = order.fulfillmentStatus === 'En préparation' ? 'Expédié' : 'En préparation';
    try {
      const { order: updated } = await updateOrderFulfillment(order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      flash(`✓ Commande ${updated.shortId || updated.id} : ${next}`);
    } catch (err) {
      alert(err.message || 'Mise à jour impossible');
    }
  };

  // ─── ÉCRAN LOGIN ───
  if (!isAuthorized) {
    return (
      <div style={{
        fontFamily: "'DM Sans', sans-serif", background: '#FFFCF8', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div style={{
          background: '#E8DCC4', border: '1px solid #D4C4B0',
          padding: '48px 32px', maxWidth: '400px', width: '100%', textAlign: 'center',
        }}>
          <div style={{
            width: '54px', height: '54px', border: '1px solid #D4C4B0', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', background: '#FFFCF8', fontSize: '20px',
          }}>🔒</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 400, color: '#56352c', marginBottom: '10px' }}>
            Espace Privé
          </h2>
          <p style={{ fontSize: '13px', color: '#8A6B5C', marginBottom: '32px', lineHeight: 1.6 }}>
            Accès réservé à l'administration de Maison Julie.
          </p>
          <form onSubmit={e => {
            e.preventDefault();
            if (password === 'admin123') {
              setIsAuthorized(true);
              setAuthError('');
              setAdminSessionKey();
            }
            else setAuthError('Mot de passe incorrect ❌');
          }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={labelStyle}>Mot de passe maître</label>
              <input
                type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPwFocused(true)} onBlur={() => setPwFocused(false)}
                style={{
                  ...inputStyle,
                  borderBottomColor: pwFocused ? '#620017' : '#D4C4B0',
                  borderBottomWidth: pwFocused ? '2px' : '1px',
                  textAlign: 'center',
                }}
              />
            </div>
            <button type="submit" style={btnPrimary}
              onMouseEnter={e => e.currentTarget.style.background = '#620017'}
              onMouseLeave={e => e.currentTarget.style.background = '#56352c'}
            >Se connecter</button>
          </form>
          {authError && <p style={{ color: '#D44B4B', marginTop: '16px', fontSize: '13px' }}>{authError}</p>}
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&family=DM+Sans:wght@300;400;500&display=swap'); * { box-sizing: border-box; }`}</style>
      </div>
    );
  }

  // ─── TABLEAU DE BORD ───
  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const totalSales = paidOrders.reduce((s, o) => s + (o.total || 0), 0);
  const inStockCount = products.filter(p => p.inStock).length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FFFCF8', minHeight: '100vh' }}>

      {/* Flash */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 200,
          background: '#E8DCC4', border: '1px solid #620017',
          padding: '14px 20px', fontSize: '13px', color: '#56352c',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          {successMsg}
        </div>
      )}

      {/* Modale de confirmation suppression */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(60,36,21,0.6)', zIndex: 150,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{ background: '#FFFCF8', border: '1px solid #D4C4B0', padding: '40px 32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#56352c', marginBottom: '12px' }}>
              Confirmer la suppression
            </p>
            <p style={{ fontSize: '14px', color: '#8A6B5C', marginBottom: '28px', lineHeight: 1.6 }}>
              Supprimer définitivement <strong style={{ color: '#56352c' }}>« {deleteConfirm.name} »</strong> ?
              {deleteConfirm.type === 'collection' && ' Tous les bijoux de cette collection seront aussi supprimés.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button style={btnDanger}
                onClick={() => deleteConfirm.type === 'product' ? handleDeleteProduct(deleteConfirm.id) : handleDeleteCollection(deleteConfirm.id)}
                onMouseEnter={e => { e.currentTarget.style.background = '#D44B4B'; e.currentTarget.style.color = '#FFFCF8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#D44B4B'; }}
              >Supprimer</button>
              <button style={{ ...btnPrimary, background: 'transparent', color: '#8A6B5C', border: '1px solid #D4C4B0' }}
                onClick={() => setDeleteConfirm(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        borderBottom: '1px solid #D4C4B0',
        background: '#FFFCF8', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: tab === 'site' ? '1600px' : '1200px', margin: '0 auto', padding: '0 24px',
          height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#56352c' }}>
              Maison Julie · Admin
            </span>
            <span style={{ width: '1px', height: '20px', background: '#D4C4B0' }} />
            {[
              { key: 'site', label: 'Site' },
              { key: 'orders', label: 'Commandes' },
              { key: 'products', label: 'Catalogue' },
              { key: 'collections', label: 'Collections' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase',
                color: tab === t.key ? '#620017' : '#8A6B5C',
                fontFamily: "'DM Sans', sans-serif",
                borderBottom: `2px solid ${tab === t.key ? '#620017' : 'transparent'}`,
                padding: '4px 0', transition: 'color 0.2s',
              }}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={() => { clearAdminSessionKey(); setIsAuthorized(false); }} style={{
            background: 'transparent', color: '#8A6B5C', border: '1px solid #D4C4B0',
            padding: '8px 16px', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#56352c'; e.currentTarget.style.color = '#56352c'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4C4B0'; e.currentTarget.style.color = '#8A6B5C'; }}
          >Déconnexion</button>
        </div>
      </div>

      <div style={{
        maxWidth: tab === 'site' ? '1600px' : '1200px',
        margin: '0 auto',
        padding: tab === 'site' ? '32px 20px 80px' : '40px 24px 80px',
      }}>

        {tab === 'site' && (
          <SiteContentEditor onSaved={flash} />
        )}

        {/* ─── STATS RAPIDES ─── */}
        {tab !== 'site' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {[
            { label: 'Chiffre d\'affaires', value: `${totalSales.toFixed(2)} €`, accent: true },
            { label: 'Bijoux en stock', value: `${inStockCount} / ${products.length}` },
            { label: 'Collections actives', value: collections.length },
            { label: 'Commandes payées', value: paidOrders.length },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#E8DCC4', border: '1px solid #D4C4B0', padding: '24px 20px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#8A6B5C', marginBottom: '8px' }}>
                {stat.label}
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', color: stat.accent ? '#620017' : '#56352c' }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        )}

        {/* ─── ONGLET COMMANDES ─── */}
        {tab === 'orders' && (
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              flexWrap: 'wrap', gap: '16px', marginBottom: '24px',
            }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 400, color: '#56352c', marginBottom: '8px' }}>
                  Logistique & Commandes (Stripe)
                </h2>
                <p style={{ fontSize: '13px', color: '#8A6B5C', maxWidth: '520px', lineHeight: 1.6 }}>
                  Les paiements réussis apparaissent ici. En local, cliquez sur « Synchroniser Stripe » après un test de paiement.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={loadOrdersData}
                  disabled={ordersLoading}
                  style={{ ...btnPrimary, background: 'transparent', color: '#56352c', border: '1px solid #D4C4B0' }}
                >
                  {ordersLoading ? 'Chargement…' : 'Actualiser'}
                </button>
                <button
                  type="button"
                  onClick={handleSyncStripe}
                  disabled={ordersSyncing}
                  style={{ ...btnPrimary, opacity: ordersSyncing ? 0.7 : 1 }}
                  onMouseEnter={(e) => { if (!ordersSyncing) e.currentTarget.style.background = '#620017'; }}
                  onMouseLeave={(e) => { if (!ordersSyncing) e.currentTarget.style.background = '#56352c'; }}
                >
                  {ordersSyncing ? 'Sync…' : 'Synchroniser Stripe'}
                </button>
              </div>
            </div>

            {ordersError && (
              <p style={{ color: '#D44B4B', fontSize: '14px', marginBottom: '20px' }}>{ordersError}</p>
            )}

            <div style={{ overflowX: 'auto', border: '1px solid #D4C4B0', marginBottom: '48px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#E8DCC4', borderBottom: '1px solid #D4C4B0' }}>
                    {['Réf.', 'Date', 'Client', 'Articles', 'Montant', 'Paiement', 'Expédition', ''].map((h) => (
                      <th key={h} style={{ padding: '14px 18px', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: '#8A6B5C', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && !ordersLoading && (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#8A6B5C' }}>
                        Aucune commande pour l&apos;instant. Faites un paiement test puis « Synchroniser Stripe ».
                      </td>
                    </tr>
                  )}
                  {orders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #D4C4B0' }}>
                      <td style={{ padding: '18px', fontWeight: 500, color: '#56352c' }}>{o.shortId || o.id}</td>
                      <td style={{ padding: '18px', color: '#8A6B5C', whiteSpace: 'nowrap' }}>{formatOrderDate(o.paidAt || o.createdAt)}</td>
                      <td style={{ padding: '18px', color: '#8A6B5C' }}>
                        <div>{o.email || '—'}</div>
                        {o.name && <div style={{ fontSize: '12px', color: '#A89488' }}>{o.name}</div>}
                      </td>
                      <td style={{ padding: '18px', color: '#56352c', maxWidth: '220px' }}>{o.item}</td>
                      <td style={{ padding: '18px', fontWeight: 500 }}>{(o.total || 0).toFixed(2)} €</td>
                      <td style={{ padding: '18px' }}>
                        <span style={{
                          background: o.paymentStatus === 'paid' ? '#E3EDDE' : '#F7F0DB',
                          color: o.paymentStatus === 'paid' ? '#447334' : '#A3701A',
                          padding: '4px 10px', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 500,
                        }}>
                          {o.paymentStatus === 'paid' ? 'Payé' : o.paymentStatus || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '18px' }}>
                        <span style={{
                          background: o.fulfillmentStatus === 'Expédié' ? '#E3EDDE' : '#F7F0DB',
                          color: o.fulfillmentStatus === 'Expédié' ? '#447334' : '#A3701A',
                          padding: '4px 10px', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 500,
                        }}>
                          {o.fulfillmentStatus || 'En préparation'}
                        </span>
                      </td>
                      <td style={{ padding: '18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => toggleOrderStatus(o)}
                          style={{ ...btnPrimary, padding: '8px 14px', fontSize: '11px' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#620017'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#56352c'; }}
                        >
                          {o.fulfillmentStatus === 'En préparation' ? 'Expédier' : 'Remettre en prépa'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 400, color: '#56352c', marginBottom: '24px' }}>
              Clients (ayant commandé)
            </h2>
            <div style={{ overflowX: 'auto', border: '1px solid #D4C4B0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#E8DCC4', borderBottom: '1px solid #D4C4B0' }}>
                    {['Email', 'Nom', 'Commandes', 'Total dépensé', 'Dernière commande'].map((h) => (
                      <th key={h} style={{ padding: '14px 18px', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: '#8A6B5C', textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registeredClients.length === 0 && !ordersLoading && (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#8A6B5C' }}>
                        Aucun client pour l&apos;instant.
                      </td>
                    </tr>
                  )}
                  {registeredClients.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #D4C4B0' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 500, color: '#56352c' }}>{c.email}</td>
                      <td style={{ padding: '14px 18px', color: '#8A6B5C' }}>{c.name || '—'}</td>
                      <td style={{ padding: '14px 18px', color: '#56352c' }}>{c.orderCount}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 500 }}>{(c.totalSpent || 0).toFixed(2)} €</td>
                      <td style={{ padding: '14px 18px', color: '#8A6B5C' }}>{formatOrderDate(c.lastOrderAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── ONGLET CATALOGUE (PRODUITS) ─── */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 400, color: '#56352c' }}>
                Gestion du catalogue
              </h2>
              {!showProductForm && !editingProduct && (
                <button
                  style={{ ...btnPrimary, opacity: collections.length ? 1 : 0.45 }}
                  disabled={!collections.length}
                  title={collections.length ? '' : 'Créez une collection avant d\'ajouter un bijou'}
                  onClick={() => {
                    if (!collections.length) return alert('Créez d\'abord une collection dans l\'onglet Collections.');
                    setShowProductForm(true);
                    setEditingProduct(null);
                  }}
                  onMouseEnter={e => { if (collections.length) e.currentTarget.style.background = '#620017'; }}
                  onMouseLeave={e => { if (collections.length) e.currentTarget.style.background = '#56352c'; }}
                >
                  + Ajouter un bijou
                </button>
              )}
            </div>

            {/* Formulaire d'ajout / édition */}
            {(showProductForm || editingProduct) && (
              <div style={{ background: '#E8DCC4', border: '1px solid #D4C4B0', padding: '32px', marginBottom: '40px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 400, color: '#56352c', marginBottom: '28px' }}>
                  {editingProduct ? `Modifier · ${editingProduct.name}` : 'Nouveau bijou'}
                </h3>
                <ProductForm
                  initial={editingProduct}
                  collections={collections}
                  onSave={handleSaveProduct}
                  onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
                />
              </div>
            )}

            {/* Liste produits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {products.map(p => (
                <div key={p.id} style={{
                  background: '#FFFCF8', border: '1px solid #D4C4B0',
                  display: 'grid', gridTemplateColumns: '64px 1fr auto',
                  gap: '16px', alignItems: 'center', padding: '16px 20px',
                }}>
                  {/* Vignette */}
                  <div style={{ width: '64px', height: '64px', overflow: 'hidden', background: '#F5EFE6', flexShrink: 0 }}>
                    {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: p.inStock ? 1 : 0.5 }} />}
                  </div>

                  {/* Infos */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#56352c' }}>{p.name}</span>
                      <span style={{
                        fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', padding: '2px 8px',
                        background: p.inStock ? '#E3EDDE' : '#F7F0DB',
                        color: p.inStock ? '#447334' : '#A3701A',
                      }}>
                        {p.inStock ? 'En stock' : 'Épuisé'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#A89488' }}>
                      {p.collection} · {p.type} · {p.price.toFixed(2)} €
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button style={{ ...btnGold, padding: '8px 14px', fontSize: '11px' }}
                      onClick={() => { setEditingProduct(p); setShowProductForm(false); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#620017'; e.currentTarget.style.color = '#FFFCF8'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#620017'; }}
                    >Modifier</button>
                    <button style={{ ...btnDanger, padding: '8px 14px', fontSize: '11px' }}
                      onClick={() => setDeleteConfirm({ type: 'product', id: p.id, name: p.name })}
                      onMouseEnter={e => { e.currentTarget.style.background = '#D44B4B'; e.currentTarget.style.color = '#FFFCF8'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#D44B4B'; }}
                    >Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ONGLET COLLECTIONS ─── */}
        {tab === 'collections' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 400, color: '#56352c' }}>
                Collections
              </h2>
              {!showCollectionForm && !editingCollection && (
                <button style={btnPrimary} onClick={() => { setShowCollectionForm(true); setEditingCollection(null); }}
                  onMouseEnter={e => e.currentTarget.style.background = '#620017'}
                  onMouseLeave={e => e.currentTarget.style.background = '#56352c'}
                >
                  + Nouvelle collection
                </button>
              )}
            </div>

            {(showCollectionForm || editingCollection) && (
              <div style={{ background: '#E8DCC4', border: '1px solid #D4C4B0', padding: '32px', marginBottom: '40px' }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 400, color: '#56352c', marginBottom: '24px' }}>
                  {editingCollection ? `Modifier · ${editingCollection.name}` : 'Nouvelle collection'}
                </h3>
                <CollectionForm
                  initial={editingCollection}
                  onSave={handleSaveCollection}
                  onCancel={() => { setShowCollectionForm(false); setEditingCollection(null); }}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {collections.map(col => {
                const count = products.filter(p => p.collection === col.id).length;
                return (
                  <div key={col.id} style={{
                    background: '#FFFCF8', border: '1px solid #D4C4B0',
                    display: 'grid', gridTemplateColumns: '1fr auto',
                    gap: '16px', alignItems: 'center', padding: '20px 24px',
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#56352c' }}>{col.name}</span>
                        <span style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: '#620017' }}>
                          {count} bijou{count > 1 ? 'x' : ''}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#8A6B5C' }}>{col.description}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ ...btnGold, padding: '8px 14px', fontSize: '11px' }}
                        onClick={() => { setEditingCollection(col); setShowCollectionForm(false); }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#620017'; e.currentTarget.style.color = '#FFFCF8'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#620017'; }}
                      >Modifier</button>
                      <button style={{ ...btnDanger, padding: '8px 14px', fontSize: '11px' }}
                        onClick={() => setDeleteConfirm({ type: 'collection', id: col.id, name: col.name })}
                        onMouseEnter={e => { e.currentTarget.style.background = '#D44B4B'; e.currentTarget.style.color = '#FFFCF8'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#D44B4B'; }}
                      >Supprimer</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
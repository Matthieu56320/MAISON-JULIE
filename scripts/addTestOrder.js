// Script de test — node scripts/addTestOrder.js ton@email.com

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Chargement manuel du .env (sans dotenv, sans --env-file) ────────────────
// Cela évite tout conflit de double-chargement et parse correctement
// les valeurs entre guillemets doubles (comme la FIREBASE_PRIVATE_KEY).
function loadEnv(envPath) {
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();

    // Retire les guillemets doubles englobants s'il y en a
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }

    // Convertit les \n littéraux en vrais sauts de ligne
    val = val.replace(/\\n/g, '\n');

    // N'écrase pas une variable déjà définie dans l'environnement
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnv(resolve(__dirname, '../.env'));

// ─── Vérification des variables obligatoires ─────────────────────────────────
const PROJECT_ID   = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY  = process.env.FIREBASE_PRIVATE_KEY;

if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.error('❌  Variables Firebase manquantes dans .env :');
  console.error('   FIREBASE_PROJECT_ID  :', PROJECT_ID  ?? 'MANQUANT');
  console.error('   FIREBASE_CLIENT_EMAIL:', CLIENT_EMAIL ?? 'MANQUANT');
  console.error('   FIREBASE_PRIVATE_KEY :', PRIVATE_KEY  ? '(présente)' : 'MANQUANTE');
  process.exit(1);
}

console.log('✔  PROJECT_ID   :', PROJECT_ID);
console.log('✔  CLIENT_EMAIL :', CLIENT_EMAIL);
console.log('✔  PRIVATE_KEY  : lignes =', PRIVATE_KEY.split('\n').length,
            '| début =', PRIVATE_KEY.slice(0, 27));

// ─── Email cible ──────────────────────────────────────────────────────────────
const email = process.argv[2];
if (!email) {
  console.error('❌  Utilisation : node scripts/addTestOrder.js ton@email.com');
  process.exit(1);
}

// ─── Firebase Admin ───────────────────────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   PROJECT_ID,
      clientEmail: CLIENT_EMAIL,
      privateKey:  PRIVATE_KEY,
    }),
  });
}

const db = getFirestore();

// ─── Commande de test ─────────────────────────────────────────────────────────
const fakeOrder = {
  stripeSessionId:   'cs_test_FAKEORDER_' + Date.now(),
  customerEmail:     email,
  customerName:      'Marie Dupont (test)',
  total:             89.90,
  status:            'paid',
  fulfillmentStatus: 'pending',
  items: [
    { name: 'Bracelet Lumière Dorée', quantity: 1, price: 49.90, variant: 'Taille S' },
    { name: 'Bague Éclat Rosé',       quantity: 2, price: 20.00 },
  ],
  shippingAddress: {
    line1:       '12 rue des Lilas',
    line2:       'Appartement 3B',
    postal_code: '75011',
    city:        'Paris',
    country:     'FR',
  },
  createdAt:  FieldValue.serverTimestamp(),
  updatedAt:  FieldValue.serverTimestamp(),
};

try {
  const ref = await db.collection('orders').add(fakeOrder);
  console.log('');
  console.log('✅  Commande de test créée avec succès !');
  console.log('   ID Firestore :', ref.id);
  console.log('   Email client :', email);
  console.log('');
  console.log('👉  Va sur http://localhost:5173/mon-compte pour la voir.');
} catch (err) {
  console.error('❌  Erreur Firestore :', err.message);
  console.error('   Code :', err.code);
}

process.exit(0);
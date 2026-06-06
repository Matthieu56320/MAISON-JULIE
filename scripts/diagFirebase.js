// Diagnostic Firebase — node scripts/diagFirebase.js
// Teste l'auth étape par étape pour identifier la vraie cause

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(envPath) {
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    val = val.replace(/\\n/g, '\n');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(resolve(__dirname, '../.env'));

const PROJECT_ID   = process.env.FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const PRIVATE_KEY  = process.env.FIREBASE_PRIVATE_KEY;

console.log('\n══════════════════════════════════════════');
console.log('  DIAGNOSTIC FIREBASE ADMIN');
console.log('══════════════════════════════════════════\n');

// ── 1. Vérification de la clé PEM ──────────────────────────────────────────
console.log('1️⃣  Vérification format clé PEM');
const lines = PRIVATE_KEY.split('\n').filter(l => l.length > 0);
console.log('   Première ligne :', lines[0]);
console.log('   Dernière ligne :', lines[lines.length - 1]);
console.log('   Nombre de lignes (sans vides) :', lines.length);

const validStart = lines[0] === '-----BEGIN PRIVATE KEY-----';
const validEnd   = lines[lines.length - 1] === '-----END PRIVATE KEY-----';
console.log('   ✔ Début valide :', validStart);
console.log('   ✔ Fin valide   :', validEnd);

if (!validStart || !validEnd) {
  console.error('\n❌  Format PEM invalide — la clé est corrompue.');
  process.exit(1);
}

// ── 2. Test de décodage de la clé avec le crypto natif Node ────────────────
console.log('\n2️⃣  Test crypto Node.js (décodage de la clé)');
try {
  const { createPrivateKey } = await import('crypto');
  const keyObj = createPrivateKey({ key: PRIVATE_KEY, format: 'pem' });
  console.log('   ✔ Clé décodée avec succès — type :', keyObj.asymmetricKeyType);
} catch (err) {
  console.error('   ❌  Erreur décodage clé :', err.message);
  console.error('   → La clé est corrompue ou tronquée dans le .env');
  process.exit(1);
}

// ── 3. Test de génération d'un token OAuth2 manuellement ──────────────────
console.log('\n3️⃣  Test génération token OAuth2 (JWT → Google)');
try {
  const { createSign } = await import('crypto');

  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now     = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss:   CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud:   'https://oauth2.googleapis.com/token',
    exp:   now + 3600,
    iat:   now,
  })).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(PRIVATE_KEY, 'base64url');
  const jwt = `${header}.${payload}.${sig}`;
  console.log('   ✔ JWT signé avec succès');

  // Échange du JWT contre un access token Google
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const data = await res.json();

  if (data.access_token) {
    console.log('   ✔ Token OAuth2 obtenu — expire dans', data.expires_in, 'secondes');
  } else {
    console.error('   ❌  Erreur Google OAuth2 :', JSON.stringify(data, null, 2));
    console.error('\n   → Causes possibles :');
    console.error('     • Le compte de service a été supprimé ou désactivé');
    console.error('     • La clé privée a été révoquée (regénérer dans Firebase Console)');
    console.error('     • Le project_id ne correspond pas à ce compte de service');
    process.exit(1);
  }

  // ── 4. Test direct Firestore REST ────────────────────────────────────────
  console.log('\n4️⃣  Test accès Firestore REST');
  const fsRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders?pageSize=1`,
    { headers: { Authorization: `Bearer ${data.access_token}` } }
  );

  if (fsRes.ok) {
    console.log('   ✔ Firestore accessible — statut :', fsRes.status);
    console.log('\n✅  TOUT EST OK — le problème vient du SDK firebase-admin lui-même.');
    console.log('   → Lance : npm install firebase-admin@latest');
  } else {
    const fsErr = await fsRes.json();
    console.error('   ❌  Erreur Firestore REST :', fsRes.status, JSON.stringify(fsErr, null, 2));
    if (fsRes.status === 403) {
      console.error('\n   → L\'API Cloud Firestore n\'est pas activée OU le compte de service');
      console.error('     n\'a pas le rôle "Cloud Datastore User" ou "Firebase Admin".');
      console.error('   → Vérifie sur : https://console.cloud.google.com/iam-admin/iam?project=' + PROJECT_ID);
    }
  }

} catch (err) {
  console.error('   ❌  Erreur réseau ou crypto :', err.message);
}

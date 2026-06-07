import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defaultSiteConfig } from '../src/config/defaultSiteConfig.js';

const COLLECTION = 'config';
const DOC_ID = 'siteConfig';

function getAdminDb() {
  try {
    if (!getApps().length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY_BASE64
        ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
        : process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }
    return getFirestore();
  } catch (err) {
    console.warn('[siteConfigStore] Firebase Admin non initialisé:', err.message);
    return null;
  }
}

export async function loadSiteConfig() {
  const db = getAdminDb();
  if (!db) {
    console.warn('[siteConfigStore] Firestore indisponible, retour config par défaut');
    return defaultSiteConfig;
  }
  try {
    const snap = await db.collection(COLLECTION).doc(DOC_ID).get();
    if (!snap.exists) return defaultSiteConfig;
    const data = snap.data();
    if (!data || typeof data !== 'object') return defaultSiteConfig;
    return data;
  } catch (err) {
    console.error('[siteConfigStore] loadSiteConfig error:', err.message);
    return defaultSiteConfig;
  }
}

export async function saveSiteConfig(config) {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore indisponible');
  try {
    await db.collection(COLLECTION).doc(DOC_ID).set(config);
    return true;
  } catch (err) {
    console.error('[siteConfigStore] saveSiteConfig error:', err.message);
    throw err;
  }
}

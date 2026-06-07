import { getFirestore } from 'firebase-admin/firestore';
import { defaultSiteConfig } from '../src/config/defaultSiteConfig.js';

const COLLECTION = 'config';
const DOC_ID = 'siteConfig';

export async function loadSiteConfig() {
  try {
    const db = getFirestore();
    const snap = await db.collection(COLLECTION).doc(DOC_ID).get();
    if (!snap.exists) return defaultSiteConfig;
    const data = snap.data();
    if (!data || typeof data !== 'object') return defaultSiteConfig;
    return data;
  } catch (err) {
    console.error('[siteConfigStore] loadSiteConfig error:', err);
    return defaultSiteConfig;
  }
}

export async function saveSiteConfig(config) {
  try {
    const db = getFirestore();
    await db.collection(COLLECTION).doc(DOC_ID).set(config);
    return true;
  } catch (err) {
    console.error('[siteConfigStore] saveSiteConfig error:', err);
    throw err;
  }
}

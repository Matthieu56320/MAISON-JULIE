import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultSiteConfig } from '../src/config/defaultSiteConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storagePath = path.join(__dirname, 'data');
const storageFile = path.join(storagePath, 'siteConfig.json');

export async function loadSiteConfig() {
  try {
    const raw = await fs.readFile(storageFile, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaultSiteConfig;
    return parsed;
  } catch {
    return defaultSiteConfig;
  }
}

export async function saveSiteConfig(config) {
  try {
    await fs.mkdir(storagePath, { recursive: true });
    await fs.writeFile(storageFile, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[siteConfigStore] save error', err);
    throw err;
  }
}

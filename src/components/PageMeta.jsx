import { useEffect } from 'react';

const SITE_NAME = 'Maison Julie';
const DEFAULT_DESCRIPTION = 'Bijoux et accessoires faits avec soin — acier inoxydable, plaqué or. Frais de livraison 5 € par commande.';
const DEFAULT_OG_IMAGE = '/textures/beige-chaux.png';

function getBaseUrl() {
  const env = import.meta.env.VITE_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

function setMeta(attr, key, content, isProperty = false) {
  if (!content) return;
  const selector = isProperty ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (isProperty) el.setAttribute('property', key);
    else el.setAttribute('name', key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

export default function PageMeta({ title, description, path = '', image }) {
  useEffect(() => {
    const base = getBaseUrl();
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Bijoux & Accessoires`;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = path ? `${base}${path.startsWith('/') ? path : `/${path}`}` : base;
    const ogImage = image
      ? (image.startsWith('http') ? image : `${base}${image}`)
      : `${base}${DEFAULT_OG_IMAGE}`;

    document.title = fullTitle;
    document.documentElement.lang = 'fr';

    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle, true);
    setMeta('property', 'og:description', desc, true);
    setMeta('property', 'og:type', 'website', true);
    setMeta('property', 'og:url', url, true);
    setMeta('property', 'og:image', ogImage, true);
    setMeta('property', 'og:locale', 'fr_FR', true);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', ogImage);

    if (url) setCanonical(url);
  }, [title, description, path, image]);

  return null;
}

/** URL de l’API (ex. http://localhost:4242). Vide = même origine + proxy Vite. */
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

console.log('[apiBase] VITE_API_URL env:', import.meta.env.VITE_API_URL);
console.log('[apiBase] API_BASE:', API_BASE);

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${API_BASE}${p}`;
  console.log('[apiUrl]', p, '->', fullUrl);
  return fullUrl;
}

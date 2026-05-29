/** URL de l’API (ex. http://localhost:4242). Vide = même origine + proxy Vite. */
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

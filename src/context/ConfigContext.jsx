import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  defaultSiteConfig,
  mergeSiteConfig,
  newUniversCard,
  newEngagementItem,
} from '../config/defaultSiteConfig';
import { apiUrl } from '../api/apiBase';
import { saveAdminSiteConfig } from '../api/adminApi';

const STORAGE_KEY = 'maison-julie-site-config';

function loadStoredConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    if (parsed?.footer) {
      if (parsed.footer.email === 'contact@maison-julie.fr') {
        parsed.footer.email = defaultSiteConfig.footer.email;
      }
      if (parsed.footer.address?.includes('livraison offerte')) {
        parsed.footer.address = defaultSiteConfig.footer.address;
      }
      if (parsed.footer.hours?.includes('Lundi – Vendredi')) {
        parsed.footer.hours = defaultSiteConfig.footer.hours;
      }
      if (parsed.footer.instagramUrl && /instagram\.com\/?$/i.test(parsed.footer.instagramUrl.trim())) {
        parsed.footer.instagramUrl = defaultSiteConfig.footer.instagramUrl;
      }
      if (parsed.footer.tiktokUrl && /tiktok\.com\/?$/i.test(parsed.footer.tiktokUrl.trim())) {
        parsed.footer.tiktokUrl = defaultSiteConfig.footer.tiktokUrl;
      }
    }

    return mergeSiteConfig(parsed);
  } catch {
    return null;
  }
}

function saveConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // quota ou navigation privée
  }
}

async function loadRemoteConfig() {
  try {
    const res = await fetch(apiUrl('/api/site-config'));
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== 'object') return null;
    return mergeSiteConfig(data);
  } catch {
    return null;
  }
}

async function persistConfigRemotely(config) {
  if (typeof window === 'undefined') return;
  const adminKey = sessionStorage.getItem('mj_admin_key');
  if (!adminKey) return;
  try {
    await saveAdminSiteConfig(config);
  } catch (err) {
    console.warn('[ConfigContext] Échec enregistrement serveur :', err.message || err);
  }
}

// ── Helpers avis ──
export function newReview() {
  return {
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author: '',
    location: '',
    rating: 5,
    text: '',
    date: '',
  };
}

const stored = typeof window !== 'undefined' ? loadStoredConfig() : null;

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [siteConfig, setSiteConfig] = useState(stored ?? { ...defaultSiteConfig });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const remote = await loadRemoteConfig();
      if (remote) {
        setSiteConfig(remote);
      } else {
        const saved = loadStoredConfig();
        if (saved) setSiteConfig(saved);
      }
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveConfig(siteConfig);
    // Ne persiste vers le serveur que si c'est l'admin qui modifie
    if (sessionStorage.getItem('mj_admin_key')) {
      persistConfigRemotely(siteConfig);
    }
  }, [siteConfig, hydrated]);

  const updateConfig = useCallback((partial) => {
    setSiteConfig((prev) => mergeSiteConfig({ ...prev, ...partial }));
  }, []);

  const patchSection = useCallback((section, partial) => {
    setSiteConfig((prev) => mergeSiteConfig({
      ...prev,
      [section]: { ...prev[section], ...partial },
    }));
  }, []);

  // ── Univers ──
  const setUniversCards = useCallback((cards) => {
    patchSection('univers', { cards });
  }, [patchSection]);

  const addUniversCard = useCallback(() => {
    setSiteConfig((prev) => mergeSiteConfig({
      ...prev,
      univers: { ...prev.univers, cards: [...prev.univers.cards, newUniversCard()] },
    }));
  }, []);

  const updateUniversCard = useCallback((id, partial) => {
    setSiteConfig((prev) => mergeSiteConfig({
      ...prev,
      univers: {
        ...prev.univers,
        cards: prev.univers.cards.map((c) => (c.id === id ? { ...c, ...partial } : c)),
      },
    }));
  }, []);

  const removeUniversCard = useCallback((id) => {
    setSiteConfig((prev) => mergeSiteConfig({
      ...prev,
      univers: {
        ...prev.univers,
        cards: prev.univers.cards.filter((c) => c.id !== id),
      },
    }));
  }, []);

  // ── Engagements ──
  const setEngagementItems = useCallback((items) => {
    patchSection('engagements', { items });
  }, [patchSection]);

  const addEngagementItem = useCallback(() => {
    setSiteConfig((prev) => mergeSiteConfig({
      ...prev,
      engagements: {
        ...prev.engagements,
        items: [...prev.engagements.items, newEngagementItem()],
      },
    }));
  }, []);

  const updateEngagementItem = useCallback((id, partial) => {
    setSiteConfig((prev) => mergeSiteConfig({
      ...prev,
      engagements: {
        ...prev.engagements,
        items: prev.engagements.items.map((item) =>
          (item.id === id ? { ...item, ...partial } : item)
        ),
      },
    }));
  }, []);

  const removeEngagementItem = useCallback((id) => {
    setSiteConfig((prev) => mergeSiteConfig({
      ...prev,
      engagements: {
        ...prev.engagements,
        items: prev.engagements.items.filter((item) => item.id !== id),
      },
    }));
  }, []);

  // ── Avis clients ──
  const addReview = useCallback(() => {
    setSiteConfig((prev) => {
      const reviews = prev.reviews ?? { enabled: true, eyebrow: 'Témoignages', title: 'Ce qu\'elles disent', items: [] };
      return mergeSiteConfig({
        ...prev,
        reviews: { ...reviews, items: [...(reviews.items ?? []), newReview()] },
      });
    });
  }, []);

  const updateReview = useCallback((id, partial) => {
    setSiteConfig((prev) => {
      const reviews = prev.reviews ?? { enabled: true, eyebrow: 'Témoignages', title: 'Ce qu\'elles disent', items: [] };
      return mergeSiteConfig({
        ...prev,
        reviews: {
          ...reviews,
          items: (reviews.items ?? []).map((r) => (r.id === id ? { ...r, ...partial } : r)),
        },
      });
    });
  }, []);

  const removeReview = useCallback((id) => {
    setSiteConfig((prev) => {
      const reviews = prev.reviews ?? { enabled: true, eyebrow: 'Témoignages', title: 'Ce qu\'elles disent', items: [] };
      return mergeSiteConfig({
        ...prev,
        reviews: {
          ...reviews,
          items: (reviews.items ?? []).filter((r) => r.id !== id),
        },
      });
    });
  }, []);

  const resetSiteConfig = useCallback(() => {
    const resetConfig = { ...defaultSiteConfig };
    setSiteConfig(resetConfig);
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined' && sessionStorage.getItem('mj_admin_key')) {
      saveAdminSiteConfig(resetConfig).catch((err) => {
        console.warn('[ConfigContext] Échec reset serveur :', err.message || err);
      });
    }
  }, []);

  return (
    <ConfigContext.Provider value={{
      siteConfig,
      updateConfig,
      patchSection,
      // univers
      setUniversCards,
      addUniversCard,
      updateUniversCard,
      removeUniversCard,
      // engagements
      setEngagementItems,
      addEngagementItem,
      updateEngagementItem,
      removeEngagementItem,
      // avis
      addReview,
      updateReview,
      removeReview,
      resetSiteConfig,
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useConfig doit être utilisé dans un ConfigProvider');
  }
  return ctx;
}
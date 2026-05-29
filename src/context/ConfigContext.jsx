import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  defaultSiteConfig,
  mergeSiteConfig,
  newUniversCard,
  newEngagementItem,
} from '../config/defaultSiteConfig';

const STORAGE_KEY = 'maison-julie-site-config';

function loadStoredConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return mergeSiteConfig(JSON.parse(raw));
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

const stored = typeof window !== 'undefined' ? loadStoredConfig() : null;

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [siteConfig, setSiteConfig] = useState(stored ?? { ...defaultSiteConfig });
  const [hydrated, setHydrated] = useState(!!stored);

  useEffect(() => {
    if (!hydrated) {
      const saved = loadStoredConfig();
      if (saved) setSiteConfig(saved);
      setHydrated(true);
    }
  }, [hydrated]);

  useEffect(() => {
    if (hydrated) saveConfig(siteConfig);
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

  const resetSiteConfig = useCallback(() => {
    setSiteConfig({ ...defaultSiteConfig });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ConfigContext.Provider value={{
      siteConfig,
      updateConfig,
      patchSection,
      setUniversCards,
      addUniversCard,
      updateUniversCard,
      removeUniversCard,
      setEngagementItems,
      addEngagementItem,
      updateEngagementItem,
      removeEngagementItem,
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

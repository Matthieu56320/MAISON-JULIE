export const defaultSiteConfig = {
  announcement: {
    enabled: true,
    text: 'Fête des mères le 31 mai — Livraison offerte',
  },
  hero: {
    eyebrow: 'Bijoux & Accessoires',
    title: 'Maison Julie',
    description: 'Viens trouver ton bonheur chez Maison Julie — des bijoux pensés pour sublimer chaque moment.',
    bgImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1920',
    showBgImage: false,
    /** 0 = pas de voile, 100 = voile fort (crème par-dessus la photo) */
    overlayOpacity: 85,
    primaryCta: 'Découvrir la collection',
    secondaryCta: 'Nous contacter',
  },
  bestsellers: {
    enabled: true,
    eyebrow: 'Les plus vendus',
    title: 'Nos best-sellers',
    subtitle: 'Les pièces préférées de nos clientes, sélectionnées pour vous.',
    productIds: [],
  },
  univers: {
    eyebrow: 'Nos univers',
    title: 'Collections capsules',
    cards: [
      {
        id: 'home-capsule',
        eyebrow: 'Nouvelle saison',
        name: 'Collection Capsule',
        tagline: 'Les dernières nouveautés de la saison',
        accent: '#620017',
        image: '',
        collectionId: 'Capsule',
        linkLabel: 'Voir la collection →',
      },
      {
        id: 'home-agate',
        eyebrow: 'Nouvelle saison',
        name: 'Collection Agate',
        tagline: 'Une élégance raffinée et intemporelle',
        accent: '#56352c',
        image: '',
        collectionId: 'Agate',
        linkLabel: 'Voir la collection →',
      },
    ],
  },
  engagements: {
    eyebrow: 'Nos engagements',
    title: 'La qualité avant tout',
    items: [
      { id: 'eng-1', icon: '✦', label: 'Acier inoxydable', desc: 'Résistant, hypoallergénique, durable' },
      { id: 'eng-2', icon: '✦', label: 'Plaqué or 18k', desc: 'Finitions dorées longue durée' },
      { id: 'eng-3', icon: '✦', label: 'Fait avec soin', desc: 'Chaque pièce sélectionnée avec amour' },
    ],
  },
  cta: {
    eyebrow: 'Fête des mères · 31 mai',
    title: 'Le cadeau parfait',
    titleEmphasis: 'existe déjà.',
    description: 'Offrez un bijou qui traversera le temps.',
    buttonText: 'Voir tous les bijoux',
  },
  footer: {
    brandName: 'Maison Julie',
    tagline: 'Bijoux & accessoires — élégance au quotidien.',
    email: 'contact@maison-julie.fr',
    address: 'France — livraison offerte',
    hours: 'Lundi – Vendredi : 9h – 18h\nSamedi : 10h – 13h\nDimanche : fermé',
    instagramUrl: 'https://www.instagram.com/',
    instagramHandle: '@maisonjulie',
  },
};

export function mergeSiteConfig(saved) {
  if (!saved || typeof saved !== 'object') return { ...defaultSiteConfig };

  return {
    announcement: { ...defaultSiteConfig.announcement, ...saved.announcement },
    hero: { ...defaultSiteConfig.hero, ...saved.hero },
    bestsellers: { ...defaultSiteConfig.bestsellers, ...saved.bestsellers },
    univers: {
      ...defaultSiteConfig.univers,
      ...saved.univers,
      cards: Array.isArray(saved.univers?.cards) && saved.univers.cards.length > 0
        ? saved.univers.cards
        : defaultSiteConfig.univers.cards,
    },
    engagements: {
      ...defaultSiteConfig.engagements,
      ...saved.engagements,
      items: Array.isArray(saved.engagements?.items) && saved.engagements.items.length > 0
        ? saved.engagements.items
        : defaultSiteConfig.engagements.items,
    },
    cta: { ...defaultSiteConfig.cta, ...saved.cta },
    footer: { ...defaultSiteConfig.footer, ...saved.footer },
  };
}

export function newUniversCard() {
  return {
    id: `card-${Date.now()}`,
    eyebrow: 'Nouvelle saison',
    name: 'Nouvelle collection',
    tagline: '',
    accent: '#620017',
    image: '',
    collectionId: '',
    linkLabel: 'Voir la collection →',
  };
}

export function newEngagementItem() {
  return {
    id: `eng-${Date.now()}`,
    icon: '✦',
    label: 'Nouvel engagement',
    desc: '',
  };
}

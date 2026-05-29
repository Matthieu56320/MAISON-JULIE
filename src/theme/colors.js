/** Palette Maison Julie — chocolat, bordeaux, blanc, chaux texturé */
export const C = {
  white: '#FFFCF8',
  bg: '#FDFAF6',
  bgChaux: '#E5D9C8',
  bgSoft: '#F0E8DC',
  panel: '#E8DCC8',
  beige: '#E8DCC8',
  bordeaux: '#620017',
  bordeauxDark: '#620017',
  bordeauxLight: '#8B2940',
  chocolate: '#56352c',
  muted: '#8A6B5C',
  mutedLight: '#A89488',
  border: '#D4C4B0',
  onDark: '#FFFCF8',
  accent: '#620017',
  announcementBg: '#620017',
  announcementText: '#F5EFE8',
  successBg: '#EDE8DC',
  successText: '#56352c',
  warnBg: '#F5E6D0',
  warnText: '#620017',
  error: '#620017',
};

export const CHAUX_TEXTURE = '/textures/beige-chaux.png';

/** Texture chaux en fond cover + léger voile (lisible, pas en damier) */
export function chauxStyle(overlay = 0.18) {
  const o = Math.min(0.5, Math.max(0, overlay));
  return {
    backgroundColor: C.bgChaux,
    backgroundImage: `linear-gradient(rgba(253, 250, 246, ${o}), rgba(237, 228, 216, ${o + 0.02})), url(${CHAUX_TEXTURE})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
}

export const cssThemeVars = `
  --white: ${C.white};
  --bg: ${C.bg};
  --bg-chaux: ${C.bgChaux};
  --panel: ${C.panel};
  --bordeaux: ${C.bordeaux};
  --chocolate: ${C.chocolate};
  --muted: ${C.muted};
  --border: ${C.border};
  --chaux-texture: url(${CHAUX_TEXTURE});
`;

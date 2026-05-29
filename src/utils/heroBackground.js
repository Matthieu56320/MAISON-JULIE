import { CHAUX_TEXTURE, C } from '../theme/colors';

export function getHeroSectionStyle(hero) {
  if (!hero.showBgImage || !hero.bgImage?.trim()) {
    return {
      backgroundColor: C.bgChaux,
      backgroundImage: `linear-gradient(160deg, rgba(253, 250, 246, 0.82) 0%, rgba(237, 228, 216, 0.88) 100%), url(${CHAUX_TEXTURE})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }

  const base = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  const veil = Math.min(100, Math.max(0, Number(hero.overlayOpacity ?? 85)));

  if (veil === 0) {
    return {
      ...base,
      backgroundImage: `url(${hero.bgImage.trim()})`,
    };
  }

  const a1 = (veil / 100) * 0.92;
  const a2 = (veil / 100) * 0.96;

  return {
    ...base,
    backgroundImage: `linear-gradient(160deg, rgba(253, 250, 246, ${a1}) 0%, rgba(229, 217, 200, ${a2}) 100%), url(${hero.bgImage.trim()})`,
  };
}

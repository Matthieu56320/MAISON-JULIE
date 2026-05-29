import React, { useEffect } from 'react';
import HomePageContent from '../components/HomePageContent';
import PageMeta from '../components/PageMeta';
import { useConfig } from '../context/ConfigContext';

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --cream: #FFFCF8;
    --ivory: #E8DCC4;
    --gold: #620017;
    --charcoal: #56352c;
    --muted: #8A6B5C;
    --border: #D4C4B0;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--cream);
    color: var(--charcoal);
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
`;

export default function Home() {
  const { siteConfig } = useConfig();

  useEffect(() => {
    if (document.getElementById('mj-global')) return;
    const s = document.createElement('style');
    s.id = 'mj-global';
    s.textContent = globalStyles;
    document.head.appendChild(s);
  }, []);

  return (
    <>
      <PageMeta
        title="Accueil"
        description={siteConfig.hero?.subtitle || 'Bijoux et accessoires — élégance au quotidien.'}
        path="/"
        image={siteConfig.hero?.image}
      />
      <HomePageContent />
    </>
  );
}

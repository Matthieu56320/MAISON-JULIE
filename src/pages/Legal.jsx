import React from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import { C } from '../theme/colors';

const CONTENT = {
  cgv: {
    title: 'Conditions générales de vente',
    description: 'Conditions générales de vente de la boutique Maison Julie.',
    sections: [
      {
        h: '1. Objet',
        p: 'Les présentes conditions régissent les ventes de bijoux et accessoires proposés par Maison Julie sur son site e-commerce, à destination de clients particuliers en France métropolitaine.',
      },
      {
        h: '2. Prix et paiement',
        p: 'Les prix sont indiqués en euros TTC. Maison Julie se réserve le droit de modifier ses tarifs ; le prix applicable est celui affiché au moment de la validation de la commande. Le paiement est exigible lors de la commande (selon les moyens de paiement proposés sur le site).',
      },
      {
        h: '3. Livraison',
        p: 'Les délais de livraison sont communiqués à titre indicatif. En cas de retard important, le client sera informé. Les risques sont transférés au client à la remise du colis au transporteur.',
      },
      {
        h: '4. Droit de rétractation',
        p: 'Conformément au code de la consommation, vous disposez d’un délai de 14 jours à compter de la réception pour exercer votre droit de rétractation, sous réserve que le bijou soit retourné dans son état d’origine.',
      },
      {
        h: '5. Garanties',
        p: 'Les produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés, dans les conditions prévues par la loi.',
      },
      {
        h: '6. Contact',
        p: 'Pour toute question : utilisez la page Contact ou écrivez à contact@maison-julie.fr.',
      },
    ],
  },
  mentions: {
    title: 'Mentions légales',
    description: 'Mentions légales du site Maison Julie.',
    sections: [
      {
        h: 'Éditeur du site',
        p: 'Maison Julie — Boutique de bijoux en ligne.\nEmail : contact@maison-julie.fr',
      },
      {
        h: 'Hébergement',
        p: 'Le site est hébergé par le prestataire choisi lors de la mise en production (informations complétées à la publication).',
      },
      {
        h: 'Propriété intellectuelle',
        p: 'L’ensemble du contenu du site (textes, visuels, logo) est protégé. Toute reproduction sans autorisation est interdite.',
      },
      {
        h: 'Données personnelles',
        p: 'Les données collectées via le formulaire de contact sont utilisées uniquement pour répondre à vos demandes. Vous pouvez exercer vos droits d’accès et de suppression en nous contactant.',
      },
      {
        h: 'Cookies',
        p: 'Le site peut utiliser des cookies techniques nécessaires à son fonctionnement. Aucune publicité ciblée n’est déployée sans votre consentement.',
      },
    ],
  },
};

export default function Legal({ type }) {
  const page = CONTENT[type] || CONTENT.mentions;
  const path = type === 'cgv' ? '/cgv' : '/mentions-legales';

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: '100vh' }}>
      <PageMeta title={page.title} description={page.description} path={path} />

      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: 'clamp(48px, 7vw, 80px) 24px 64px',
      }}>
        <Link to="/" style={{ fontSize: '13px', color: C.muted, textDecoration: 'none' }}>
          ← Retour à l&apos;accueil
        </Link>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 400,
          color: C.chocolate,
          margin: '32px 0 40px',
        }}>
          {page.title}
        </h1>

        {page.sections.map((s) => (
          <section key={s.h} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              color: C.bordeaux,
              marginBottom: '12px',
              fontWeight: 400,
            }}>
              {s.h}
            </h2>
            <p style={{ fontSize: '15px', color: C.muted, lineHeight: 1.75, whiteSpace: 'pre-line' }}>
              {s.p}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

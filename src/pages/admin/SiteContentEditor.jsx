import React, { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useProducts } from '../../context/ProductsContext';
import HomeLivePreview from '../../components/HomeLivePreview';
import ImageUploadField from '../../components/ImageUploadField';
import {
  inputStyle, textareaStyle, labelStyle, btnPrimary, btnGhost, btnDanger, panelStyle,
} from './adminStyles';

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: '12px', color: '#A89488', marginTop: '6px' }}>{hint}</p>}
    </div>
  );
}

function Toggle({ on, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <button
        type="button"
        onClick={() => onChange(!on)}
        style={{
          width: '44px', height: '24px', borderRadius: '12px',
          background: on ? '#56352c' : '#D4C4B0',
          border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: '3px', left: on ? '23px' : '3px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: '#FFFCF8', transition: 'left 0.25s',
        }} />
      </button>
      <span style={{ fontSize: '13px', color: '#8A6B5C' }}>{label}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{
      fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 400,
      color: '#56352c', marginBottom: '20px',
    }}>
      {children}
    </h3>
  );
}

export default function SiteContentEditor({ onSaved }) {
  const {
    siteConfig,
    patchSection,
    addUniversCard,
    updateUniversCard,
    removeUniversCard,
    addEngagementItem,
    updateEngagementItem,
    removeEngagementItem,
    resetSiteConfig,
  } = useConfig();
  const { collections } = useProducts();
  const [uploadError, setUploadError] = useState('');

  const notify = (msg) => onSaved?.(msg || '✓ Enregistré.');

  const { announcement, hero, univers, engagements, cta } = siteConfig;

  const editorColumn = (
    <div>
      {uploadError && (
        <div style={{
          background: '#F7F0DB', border: '1px solid #D44B4B', color: '#A3701A',
          padding: '12px 16px', marginBottom: '16px', fontSize: '13px',
        }}>
          {uploadError}
        </div>
      )}

      <div style={panelStyle}>
        <SectionTitle>Bandeau d&apos;annonce</SectionTitle>
        <Toggle
          on={announcement.enabled}
          onChange={(enabled) => patchSection('announcement', { enabled })}
          label={announcement.enabled ? 'Bandeau affiché' : 'Bandeau masqué'}
        />
        <Field label="Texte du bandeau">
          <input
            style={inputStyle}
            value={announcement.text}
            disabled={!announcement.enabled}
            onChange={(e) => patchSection('announcement', { text: e.target.value })}
          />
        </Field>
      </div>

      <div style={panelStyle}>
        <SectionTitle>Grande bannière d&apos;accueil</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Field label="Sur-titre">
            <input style={inputStyle} value={hero.eyebrow} onChange={(e) => patchSection('hero', { eyebrow: e.target.value })} />
          </Field>
          <Field label="Titre principal">
            <input style={inputStyle} value={hero.title} onChange={(e) => patchSection('hero', { title: e.target.value })} />
          </Field>
        </div>
        <Field label="Texte d'introduction">
          <textarea style={textareaStyle} rows={3} value={hero.description} onChange={(e) => patchSection('hero', { description: e.target.value })} />
        </Field>
        <Toggle
          on={hero.showBgImage}
          onChange={(showBgImage) => patchSection('hero', { showBgImage })}
          label="Afficher une photo de fond"
        />
        {hero.showBgImage && (
          <>
            <ImageUploadField
              label="Photo de fond"
              value={hero.bgImage}
              onChange={(bgImage) => { patchSection('hero', { bgImage }); notify('✓ Photo de fond mise à jour.'); }}
              onError={setUploadError}
              hint="Importez depuis votre ordi ou téléphone — visible tout de suite dans l'aperçu →"
            />
            <Field
              label={`Voile sur la photo — ${hero.overlayOpacity ?? 85}%`}
              hint="0 % = photo brute, 100 % = voile crème fort (meilleure lisibilité du texte)."
            >
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={hero.overlayOpacity ?? 85}
                onChange={(e) => patchSection('hero', { overlayOpacity: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#620017', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#A89488', marginTop: '6px' }}>
                <span>Aucun voile</span>
                <button
                  type="button"
                  onClick={() => patchSection('hero', { overlayOpacity: 0 })}
                  style={{ background: 'none', border: 'none', color: '#620017', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                >
                  Retirer le voile
                </button>
                <span>Voile fort</span>
              </div>
            </Field>
          </>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Bouton principal">
            <input style={inputStyle} value={hero.primaryCta} onChange={(e) => patchSection('hero', { primaryCta: e.target.value })} />
          </Field>
          <Field label="Bouton secondaire">
            <input style={inputStyle} value={hero.secondaryCta} onChange={(e) => patchSection('hero', { secondaryCta: e.target.value })} />
          </Field>
        </div>
      </div>

      <div style={panelStyle}>
        <SectionTitle>Section best-sellers (accueil)</SectionTitle>
        <Toggle
          on={siteConfig.bestsellers?.enabled !== false}
          onChange={(enabled) => patchSection('bestsellers', { enabled })}
          label="Afficher la section best-sellers"
        />
        <Field label="Petit titre">
          <input
            style={inputStyle}
            value={siteConfig.bestsellers?.eyebrow || ''}
            onChange={(e) => patchSection('bestsellers', { eyebrow: e.target.value })}
          />
        </Field>
        <Field label="Titre">
          <input
            style={inputStyle}
            value={siteConfig.bestsellers?.title || ''}
            onChange={(e) => patchSection('bestsellers', { title: e.target.value })}
          />
        </Field>
        <Field label="Sous-titre">
          <input
            style={inputStyle}
            value={siteConfig.bestsellers?.subtitle || ''}
            onChange={(e) => patchSection('bestsellers', { subtitle: e.target.value })}
          />
        </Field>
        <p style={{ fontSize: '12px', color: '#A89488', lineHeight: 1.55 }}>
          Les bijoux affichés sont ceux marqués « best-seller » dans l&apos;onglet Catalogue (max. 5).
        </p>
      </div>

      <div style={panelStyle}>
        <SectionTitle>Section « Nos univers »</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <Field label="Petit titre">
            <input style={inputStyle} value={univers.eyebrow} onChange={(e) => patchSection('univers', { eyebrow: e.target.value })} />
          </Field>
          <Field label="Titre de section">
            <input style={inputStyle} value={univers.title} onChange={(e) => patchSection('univers', { title: e.target.value })} />
          </Field>
        </div>

        {univers.cards.map((card, index) => (
          <div key={card.id} style={{ border: '1px solid #D4C4B0', padding: '20px', marginBottom: '16px', background: '#FFFCF8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#620017' }}>
                Carte {index + 1}
              </span>
              {univers.cards.length > 1 && (
                <button type="button" style={{ ...btnDanger, padding: '6px 12px', fontSize: '10px' }}
                  onClick={() => removeUniversCard(card.id)}
                >Supprimer</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <Field label="Badge">
                <input style={inputStyle} value={card.eyebrow} onChange={(e) => updateUniversCard(card.id, { eyebrow: e.target.value })} />
              </Field>
              <Field label="Couleur d'accent">
                <input style={inputStyle} value={card.accent} onChange={(e) => updateUniversCard(card.id, { accent: e.target.value })} />
              </Field>
              <Field label="Nom affiché">
                <input style={inputStyle} value={card.name} onChange={(e) => updateUniversCard(card.id, { name: e.target.value })} />
              </Field>
              <Field label="Collection liée">
                <select
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  value={card.collectionId}
                  onChange={(e) => updateUniversCard(card.id, { collectionId: e.target.value })}
                >
                  <option value="">Tout le catalogue</option>
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea style={textareaStyle} rows={2} value={card.tagline} onChange={(e) => updateUniversCard(card.id, { tagline: e.target.value })} />
            </Field>
            <ImageUploadField
              label="Photo de la carte"
              value={card.image}
              onChange={(image) => { updateUniversCard(card.id, { image }); notify('✓ Image de carte mise à jour.'); }}
              onError={setUploadError}
            />
            <Field label="Texte du lien">
              <input style={inputStyle} value={card.linkLabel} onChange={(e) => updateUniversCard(card.id, { linkLabel: e.target.value })} />
            </Field>
          </div>
        ))}

        <button type="button" style={btnPrimary} onClick={() => addUniversCard()}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#620017'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#56352c'; }}
        >
          + Ajouter une carte
        </button>
      </div>

      <div style={panelStyle}>
        <SectionTitle>Section « Nos engagements »</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <Field label="Petit titre">
            <input style={inputStyle} value={engagements.eyebrow} onChange={(e) => patchSection('engagements', { eyebrow: e.target.value })} />
          </Field>
          <Field label="Titre de section">
            <input style={inputStyle} value={engagements.title} onChange={(e) => patchSection('engagements', { title: e.target.value })} />
          </Field>
        </div>

        {engagements.items.map((item, index) => (
          <div key={item.id} style={{ border: '1px solid #D4C4B0', padding: '16px', marginBottom: '12px', background: '#FFFCF8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', color: '#620017', textTransform: 'uppercase' }}>Engagement {index + 1}</span>
              {engagements.items.length > 1 && (
                <button type="button" style={{ ...btnDanger, padding: '4px 10px', fontSize: '10px' }}
                  onClick={() => removeEngagementItem(item.id)}
                >Supprimer</button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 1fr', gap: '10px' }}>
              <Field label="Icône">
                <input style={inputStyle} value={item.icon} onChange={(e) => updateEngagementItem(item.id, { icon: e.target.value })} />
              </Field>
              <Field label="Titre">
                <input style={inputStyle} value={item.label} onChange={(e) => updateEngagementItem(item.id, { label: e.target.value })} />
              </Field>
              <Field label="Description">
                <input style={inputStyle} value={item.desc} onChange={(e) => updateEngagementItem(item.id, { desc: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}

        <button type="button" style={btnPrimary} onClick={() => addEngagementItem()}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#620017'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#56352c'; }}
        >
          + Ajouter un engagement
        </button>
      </div>

      <div style={panelStyle}>
        <SectionTitle>Bloc final de page</SectionTitle>
        <Field label="Petit titre">
          <input style={inputStyle} value={cta.eyebrow} onChange={(e) => patchSection('cta', { eyebrow: e.target.value })} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Field label="Titre — ligne 1">
            <input style={inputStyle} value={cta.title} onChange={(e) => patchSection('cta', { title: e.target.value })} />
          </Field>
          <Field label="Titre — italique (or)">
            <input style={inputStyle} value={cta.titleEmphasis} onChange={(e) => patchSection('cta', { titleEmphasis: e.target.value })} />
          </Field>
        </div>
        <Field label="Texte">
          <textarea style={textareaStyle} rows={2} value={cta.description} onChange={(e) => patchSection('cta', { description: e.target.value })} />
        </Field>
        <Field label="Texte du bouton">
          <input style={inputStyle} value={cta.buttonText} onChange={(e) => patchSection('cta', { buttonText: e.target.value })} />
        </Field>
      </div>

      <button
        type="button"
        style={{ ...btnGhost, fontSize: '10px', marginTop: '8px' }}
        onClick={() => {
          if (window.confirm('Réinitialiser tout le contenu du site ?')) {
            resetSiteConfig();
            notify('Contenu réinitialisé.');
          }
        }}
      >
        Réinitialiser le contenu du site
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 400, color: '#56352c', marginBottom: '8px' }}>
          Personnaliser le site
        </h2>
        <p style={{ fontSize: '14px', color: '#8A6B5C', lineHeight: 1.6 }}>
          Modifiez à gauche, voyez le résultat à droite en temps réel. Importez vos photos depuis l&apos;ordinateur ou le téléphone.
        </p>
      </div>

      <style>{`
        .mj-site-editor {
          position: relative;
        }
        .mj-site-editor-form {
          min-width: 0;
        }
        @media (min-width: 1025px) {
          .mj-site-editor-form {
            padding-right: calc(42% + 32px);
            max-width: 100%;
          }
          .mj-site-preview-wrap {
            position: fixed;
            top: 80px;
            right: max(16px, calc((100vw - min(100vw, 1600px)) / 2 + 16px));
            width: min(520px, calc(42vw - 24px));
            z-index: 45;
          }
          .mj-live-preview-root {
            height: calc(100vh - 96px) !important;
            max-height: calc(100vh - 96px) !important;
          }
        }
        @media (max-width: 1024px) {
          .mj-site-preview-wrap {
            position: sticky;
            top: 72px;
            z-index: 45;
            margin-bottom: 24px;
          }
          .mj-live-preview-root {
            height: min(55vh, 480px) !important;
            max-height: min(55vh, 480px) !important;
          }
        }
      `}</style>

      <div className="mj-site-editor">
        <div className="mj-site-editor-form">{editorColumn}</div>
        <div className="mj-site-preview-wrap">
          <HomeLivePreview />
        </div>
      </div>
    </div>
  );
}

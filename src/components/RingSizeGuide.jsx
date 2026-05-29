import React, { useState } from 'react';
import { C } from '../theme/colors';

const SIZES = [
  { eu: '44', us: '3', uk: 'F', diameter: '14,0 mm' },
  { eu: '46', us: '4', uk: 'G', diameter: '14,6 mm' },
  { eu: '48', us: '4½', uk: 'H', diameter: '15,2 mm' },
  { eu: '50', us: '5½', uk: 'J', diameter: '15,8 mm' },
  { eu: '52', us: '6', uk: 'K', diameter: '16,5 mm' },
  { eu: '54', us: '7', uk: 'L', diameter: '17,2 mm' },
  { eu: '56', us: '7½', uk: 'M', diameter: '17,8 mm' },
  { eu: '58', us: '8½', uk: 'O', diameter: '18,4 mm' },
  { eu: '60', us: '9', uk: 'P', diameter: '19,0 mm' },
  { eu: '62', us: '10', uk: 'R', diameter: '19,6 mm' },
];

export default function RingSizeGuide({ compact = false }) {
  const [open, setOpen] = useState(false);

  const triggerStyle = {
    background: 'transparent',
    border: `1px solid ${C.border}`,
    color: C.bordeaux,
    padding: compact ? '8px 14px' : '10px 18px',
    fontSize: '11px',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={triggerStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = C.bordeaux;
          e.currentTarget.style.background = C.panel;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.background = 'transparent';
        }}
      >
        Guide des tailles bagues
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Guide des tailles"
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(60, 36, 21, 0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: C.white, border: `1px solid ${C.border}`,
              maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
              padding: '36px 28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.bordeaux, marginBottom: '8px' }}>
                  Bagues
                </p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 400, color: C.chocolate }}>
                  Guide des tailles
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: C.muted, lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.65, marginBottom: '24px' }}>
              Mesurez le tour de votre doigt au endroit le plus large, en fin de journée. 
              Entre deux tailles, prenez la plus grande. Besoin d&apos;un ajustement ?{' '}
              <a href="/contact" style={{ color: C.bordeaux }}>Contactez-nous</a>.
            </p>

            <div style={{ overflowX: 'auto', border: `1px solid ${C.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: C.panel }}>
                    {['Taille EU', 'US', 'UK', 'Diamètre int.'].map((h) => (
                      <th key={h} style={{
                        padding: '12px 14px', textAlign: 'left',
                        fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
                        color: C.muted, fontWeight: 500,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((row) => (
                    <tr key={row.eu} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: C.chocolate }}>{row.eu}</td>
                      <td style={{ padding: '12px 14px', color: C.muted }}>{row.us}</td>
                      <td style={{ padding: '12px 14px', color: C.muted }}>{row.uk}</td>
                      <td style={{ padding: '12px 14px', color: C.muted }}>{row.diameter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: '12px', color: C.mutedLight, marginTop: '20px', lineHeight: 1.6 }}>
              Astuce : enroulez une bande de papier autour du doigt, marquez le joint puis mesurez la longueur en mm. 
              Divisez par 3,14 pour obtenir le diamètre intérieur approximatif.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

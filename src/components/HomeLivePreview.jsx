import React from 'react';
import { useConfig } from '../context/ConfigContext';
import HomePageContent from './HomePageContent';
import { C } from '../theme/colors';

export default function HomeLivePreview() {
  const { siteConfig } = useConfig();
  const { announcement } = siteConfig;

  return (
    <div className="mj-live-preview-root" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 88px)',
      maxHeight: 'calc(100vh - 88px)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: '#56352c', color: '#E8DCC4',
        border: '1px solid #D4C4B0', borderBottom: 'none',
      }}>
        <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Aperçu en direct
        </span>
        <span style={{ fontSize: '10px', color: '#A89488' }}>Mise à jour instantanée</span>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        border: '1px solid #D4C4B0',
        background: '#F5EFE6',
        boxShadow: '0 8px 32px rgba(60,36,21,0.12)',
      }}>
        {announcement.enabled && announcement.text?.trim() && (
          <div style={{
          background: C.bordeaux,
          color: C.announcementText,
            textAlign: 'center',
            padding: '8px 12px',
            fontSize: '9px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            ✦ {announcement.text.trim()} ✦
          </div>
        )}

        <div style={{ background: '#FFFCF8', fontFamily: "'DM Sans', sans-serif" }}>
          <HomePageContent preview />
        </div>
      </div>
    </div>
  );
}

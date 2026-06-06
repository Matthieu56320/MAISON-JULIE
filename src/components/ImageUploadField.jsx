import React, { useRef, useState } from 'react';
import { processImageFile } from '../utils/compressImage';

const zoneStyle = {
  border: '2px dashed #D4C4B0',
  background: '#FFFCF8',
  padding: '20px 16px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.2s, background 0.2s',
};

export default function ImageUploadField({
  value,
  onChange,
  disabled = false,
  label,
  hint,
  allowUrl = true,
  onError,
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(false);

  const handleFile = async (file) => {
    if (!file || disabled) return;
    setLoading(true);
    try {
      const compressed = await processImageFile(file);
      onChange(compressed);
    } catch (err) {
      if (err.message === 'NOT_IMAGE') {
        onError?.('Choisissez une image (JPG, PNG, WebP…).');
      } else if (err.message === 'TOO_LARGE') {
        onError?.('Image trop lourde (max. 15 Mo).');
      } else {
        onError?.('Impossible de charger cette image.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  };

  return (
    <div style={{ marginBottom: '4px' }}>
      {label && (
        <label style={{
          fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
          color: '#8A6B5C', display: 'block', marginBottom: '8px',
        }}>
          {label}
        </label>
      )}

      {value?.trim() && (
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <img
            src={value.trim()}
            alt=""
            style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', border: '1px solid #D4C4B0', display: 'block' }}
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange('')}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                background: 'rgba(60,36,21,0.75)', color: '#FFFCF8', border: 'none',
                padding: '6px 10px', fontSize: '10px', letterSpacing: '1px',
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Retirer
            </button>
          )}
        </div>
      )}

      {!disabled && (
        <>
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click(); }}
            onClick={() => !loading && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              ...zoneStyle,
              borderColor: dragOver ? '#620017' : '#D4C4B0',
              background: dragOver ? '#E8DCC4' : '#FFFCF8',
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? 'none' : 'auto',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <p style={{ fontSize: '13px', color: '#56352c', marginBottom: '6px', fontWeight: 500 }}>
              {loading ? 'Chargement…' : 'Importer une photo'}
            </p>
            <p style={{ fontSize: '12px', color: '#A89488', lineHeight: 1.5 }}>
              Depuis votre ordinateur ou votre téléphone
              <br />
              <span style={{ fontSize: '11px' }}>Glisser-déposer · JPG, PNG, WebP</span>
            </p>
          </div>

          {allowUrl && (
            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setUrlMode((v) => !v)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '11px', color: '#620017', letterSpacing: '1px',
                  textTransform: 'uppercase', padding: 0, fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {urlMode ? 'Masquer le lien URL' : 'Ou coller une URL'}
              </button>
              {urlMode && (
                <input
                  type="url"
                  placeholder="https://..."
                  value={value?.startsWith('data:') ? '' : (value || '')}
                  onChange={(e) => onChange(e.target.value)}
                  style={{
                    width: '100%', marginTop: '8px', padding: '10px 12px',
                    border: '1px solid #D4C4B0', background: 'transparent',
                    fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          )}
        </>
      )}

      {hint && <p style={{ fontSize: '12px', color: '#A89488', marginTop: '8px' }}>{hint}</p>}
    </div>
  );
}

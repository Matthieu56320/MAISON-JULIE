export const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1px solid #D4C4B0', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
  background: 'transparent', fontSize: '14px', color: '#56352c',
  fontFamily: "'DM Sans', sans-serif", outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};

export const textareaStyle = {
  ...inputStyle,
  border: '1px solid #D4C4B0',
  borderRadius: 0,
  resize: 'vertical',
  lineHeight: 1.65,
  padding: '12px 14px',
};

export const labelStyle = {
  fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
  color: '#8A6B5C', display: 'block', marginBottom: '6px',
};

export const btnPrimary = {
  background: '#56352c', color: '#FFFCF8', border: 'none',
  padding: '12px 24px', fontSize: '11px', letterSpacing: '1.5px',
  textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s',
};

export const btnGhost = {
  ...btnPrimary,
  background: 'transparent',
  color: '#8A6B5C',
  border: '1px solid #D4C4B0',
};

export const btnDanger = {
  ...btnPrimary,
  background: 'transparent',
  color: '#D44B4B',
  border: '1px solid #D44B4B',
};

export const panelStyle = {
  background: '#E8DCC4',
  border: '1px solid #D4C4B0',
  padding: '28px 32px',
  marginBottom: '24px',
};

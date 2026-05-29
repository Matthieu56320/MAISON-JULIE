export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Redimensionne et compresse une image pour le stockage local (localStorage).
 */
export function compressImage(dataUrl, maxWidth = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export async function processImageFile(file, maxWidth = 1400) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('NOT_IMAGE');
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('TOO_LARGE');
  }
  const dataUrl = await readFileAsDataURL(file);
  return compressImage(dataUrl, maxWidth);
}

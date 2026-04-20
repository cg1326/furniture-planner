export type ImageTransform = 'rotate-cw' | 'rotate-ccw' | 'flip-h' | 'flip-v';

export async function transformImage(
  dataUrl: string,
  transform: ImageTransform,
): Promise<{ dataUrl: string; naturalWidth: number; naturalHeight: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No 2d context')); return; }

      const rotating = transform === 'rotate-cw' || transform === 'rotate-ccw';
      canvas.width  = rotating ? H : W;
      canvas.height = rotating ? W : H;

      if (transform === 'rotate-cw') {
        ctx.translate(H, 0);
        ctx.rotate(Math.PI / 2);
      } else if (transform === 'rotate-ccw') {
        ctx.translate(0, W);
        ctx.rotate(-Math.PI / 2);
      } else if (transform === 'flip-h') {
        ctx.translate(W, 0);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(0, H);
        ctx.scale(1, -1);
      }

      ctx.drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL('image/png'), naturalWidth: canvas.width, naturalHeight: canvas.height });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

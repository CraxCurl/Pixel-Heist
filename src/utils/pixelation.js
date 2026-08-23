/**
 * Pixelation utility for Pixel Heist
 * Renders an HTML Image onto a canvas using nearest-neighbor low-res scaling.
 * Unpixelates over 20 seconds up to maxScale (0.08) so the image stays partially
 * pixelated at 0s until the answer is officially declared/revealed.
 */

export const REVEAL_DURATION_MS = 20000; // 20 seconds per round

/**
 * Calculates current pixel scale factor based on elapsed time (ms).
 * Unpixelates from minScale (0.008) up to a max capped scale of 0.08 at 20 seconds.
 *
 * @param {number} elapsedMs - Time passed in milliseconds (0 to 20000)
 * @param {number} durationMs - Total round duration (default 20000)
 * @returns {number} Scale ratio between minScale (0.008) and maxScale (0.08)
 */
export function calculatePixelScale(elapsedMs, durationMs = REVEAL_DURATION_MS) {
  const progress = Math.min(Math.max(elapsedMs / durationMs, 0), 1);
  
  // Start with heavy pixel blocks at 0s
  const minScale = 0.008; 

  // Max pixelation reveal cap during 20s countdown (0.08 matches partial pixelation reference)
  const maxScale = 0.08;

  // Power curve for progressive reveal over 20 seconds
  const eased = Math.pow(progress, 2.5);
  
  return minScale + (maxScale - minScale) * eased;
}

/**
 * Renders an image onto a target Canvas with nearest-neighbor pixelation effect.
 *
 * @param {HTMLCanvasElement} canvas - Target HTML5 canvas
 * @param {HTMLImageElement} image - Loaded source image
 * @param {number} scale - Current resolution scale factor
 * @param {boolean} isRevealed - True ONLY when admin clicks REVEAL ANSWER
 */
export function drawPixelatedImage(canvas, image, scale, isRevealed = false) {
  if (!canvas || !image || !image.complete || image.naturalWidth === 0) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Render 100% crisp original image ONLY when admin clicks REVEAL ANSWER
  if (isRevealed) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, width, height);
    
    const imgAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = width / height;
    
    let drawW = width;
    let drawH = height;
    let offsetX = 0;
    let offsetY = 0;
    
    if (imgAspect > canvasAspect) {
      drawH = width / imgAspect;
      offsetY = (height - drawH) / 2;
    } else {
      drawW = height * imgAspect;
      offsetX = (width - drawW) / 2;
    }

    ctx.drawImage(image, offsetX, offsetY, drawW, drawH);
    return;
  }

  // Downsample to low-res pixel grid
  const lowResWidth = Math.max(4, Math.floor(width * scale));
  const lowResHeight = Math.max(3, Math.floor(height * scale));

  // Create or reuse offscreen canvas
  let offscreen = drawPixelatedImage.offscreenCanvas;
  if (!offscreen) {
    offscreen = document.createElement('canvas');
    drawPixelatedImage.offscreenCanvas = offscreen;
  }
  
  offscreen.width = lowResWidth;
  offscreen.height = lowResHeight;

  const offscreenCtx = offscreen.getContext('2d');
  if (!offscreenCtx) return;

  // Render downsampled image
  offscreenCtx.imageSmoothingEnabled = true;
  offscreenCtx.imageSmoothingQuality = 'medium';
  offscreenCtx.clearRect(0, 0, lowResWidth, lowResHeight);
  offscreenCtx.drawImage(image, 0, 0, lowResWidth, lowResHeight);

  // Clear target main canvas
  ctx.clearRect(0, 0, width, height);

  // Disable image smoothing for crisp nearest-neighbor pixel blocks
  ctx.imageSmoothingEnabled = false;

  // Scale back up to full canvas dimensions
  ctx.drawImage(
    offscreen,
    0, 0, lowResWidth, lowResHeight,
    0, 0, width, height
  );
}

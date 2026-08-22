/**
 * Pixelation utility for Pixel Heist
 * Renders an HTML Image onto a canvas using nearest-neighbor low-res scaling.
 * Set to 20 seconds duration with steep easing for ultra-slow unpixelation.
 */

export const REVEAL_DURATION_MS = 20000; // 20 seconds per round

/**
 * Calculates the current pixel scale factor based on elapsed time (ms).
 * Unpixelates very slowly over 20 seconds using progress^5.0 power curve.
 *
 * @param {number} elapsedMs - Time passed in milliseconds (0 to 20000)
 * @param {number} durationMs - Total round duration (default 20000)
 * @returns {number} Scale ratio between minScale (0.008) and 1.0
 */
export function calculatePixelScale(elapsedMs, durationMs = REVEAL_DURATION_MS) {
  const progress = Math.min(Math.max(elapsedMs / durationMs, 0), 1);
  
  if (progress >= 1) return 1.0;

  // Heavy pixel block grid at start (~8x5 blocks)
  const minScale = 0.008; 
  const maxScale = 1.0;

  // Steep power curve (progress^5.0) ensures image unpixelates VERY SLOWLY
  // First 14 seconds stay heavily pixelated; detail only emerges in final 5 seconds
  const eased = Math.pow(progress, 5.0);
  
  return minScale + (maxScale - minScale) * eased;
}

/**
 * Renders an image onto a target Canvas with nearest-neighbor pixelation effect.
 *
 * @param {HTMLCanvasElement} canvas - Target HTML5 canvas
 * @param {HTMLImageElement} image - Loaded source image
 * @param {number} scale - Current resolution scale factor (0.008 to 1.0)
 * @param {boolean} isRevealed - True when admin reveals or 20.0s limit reached
 */
export function drawPixelatedImage(canvas, image, scale, isRevealed = false) {
  if (!canvas || !image || !image.complete || image.naturalWidth === 0) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // If fully revealed (or scale hits 1.0 at 20s), render crisp original image
  if (isRevealed || scale >= 0.995) {
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

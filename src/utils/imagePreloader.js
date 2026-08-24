/**
 * Image Preloader & Cache System for Pixel Heist
 * Preloads all question images into browser memory to handle spotty venue networks seamlessly.
 */

const imageCache = new Map();

/**
 * Preloads a single image URL and stores the loaded HTMLImageElement in memory.
 * Handles CORS fallback automatically.
 *
 * @param {string} src - Image URL or base64 string
 * @returns {Promise<HTMLImageElement>}
 */
export function preloadImage(src) {
  if (!src) return Promise.reject(new Error('No image URL provided'));

  if (imageCache.has(src)) {
    const cached = imageCache.get(src);
    if (cached.complete && cached.naturalWidth > 0) {
      return Promise.resolve(cached);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };

    img.onerror = () => {
      // Fallback: try loading without crossOrigin if CORS failed
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        imageCache.set(src, fallbackImg);
        resolve(fallbackImg);
      };
      fallbackImg.onerror = (err) => {
        console.warn(`Failed to preload image: ${src}`);
        reject(err);
      };
      fallbackImg.src = src;
    };

    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

/**
 * Preloads an array of question objects containing .image properties into memory.
 *
 * @param {Array<{image: string}>} questionsList
 */
export function preloadAllQuestions(questionsList) {
  if (!Array.isArray(questionsList) || questionsList.length === 0) return;

  questionsList.forEach((q) => {
    if (q && q.image) {
      preloadImage(q.image).catch(() => {});
    }
  });
}

/**
 * Retrieves a preloaded image element from cache if available.
 *
 * @param {string} src
 * @returns {HTMLImageElement|null}
 */
export function getCachedImage(src) {
  if (!src) return null;
  const cached = imageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return cached;
  }
  return null;
}

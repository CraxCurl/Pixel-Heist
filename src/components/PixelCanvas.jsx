import React, { useRef, useEffect, useState } from 'react';
import { calculatePixelScale, drawPixelatedImage } from '../utils/pixelation';
import { ImageOff, Loader2 } from 'lucide-react';

export function PixelCanvas({ imageSrc, status, elapsedTime, duration = 20000, isBordered = false }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [loadedImage, setLoadedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;

    setLoading(true);
    setError(false);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setLoadedImage(img);
      setLoading(false);
    };

    img.onerror = () => {
      setError(true);
      setLoading(false);
    };

    img.src = imageSrc;
  }, [imageSrc]);

  // ResizeObserver and fullscreenchange handler so image NEVER disappears on resize or fullscreen
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const updateCanvasSizeAndDraw = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const canvas = canvasRef.current;

      const width = Math.max(100, Math.floor(rect.width));
      const height = Math.max(100, Math.floor(rect.height));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      if (loadedImage) {
        const isRevealed = status === 'REVEALED' || status === 'TIMEOUT';
        const currentScale = isRevealed
          ? 1.0
          : calculatePixelScale(elapsedTime, duration);
        drawPixelatedImage(canvas, loadedImage, currentScale, isRevealed);
      }
    };

    updateCanvasSizeAndDraw();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSizeAndDraw();
    });

    resizeObserver.observe(containerRef.current);
    window.addEventListener('fullscreenchange', updateCanvasSizeAndDraw);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('fullscreenchange', updateCanvasSizeAndDraw);
    };
  }, [loadedImage, status, elapsedTime, duration]);

  // Main animation render frame
  useEffect(() => {
    if (!canvasRef.current || !loadedImage) return;

    const isRevealed = status === 'REVEALED' || status === 'TIMEOUT';
    const currentScale = isRevealed
      ? 1.0
      : calculatePixelScale(elapsedTime, duration);

    drawPixelatedImage(canvasRef.current, loadedImage, currentScale, isRevealed);
  }, [loadedImage, status, elapsedTime, duration]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${
        isBordered
          ? 'bg-[#0A0A0A] rounded-lg border border-[#1F1F1F]'
          : 'bg-transparent'
      }`}
    >
      {/* Loading state indicator */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-transparent z-20">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <span className="text-[#A1A1AA] font-mono text-xs uppercase">Loading Image...</span>
        </div>
      )}

      {/* Error state indicator */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-950/20 border border-red-500/20 rounded-lg z-20">
          <ImageOff className="w-10 h-10 text-red-400" />
          <span className="text-red-300 font-semibold text-xs">Failed to load image</span>
        </div>
      )}

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

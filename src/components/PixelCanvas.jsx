import React, { useRef, useEffect, useState } from 'react';
import { calculatePixelScale, drawPixelatedImage } from '../utils/pixelation';
import { ImageOff, Loader2 } from 'lucide-react';

export function PixelCanvas({ imageSrc, status, elapsedTime, duration = 30000, difficultyExponent = 4.5, isBordered = false }) {
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

  // Adjust canvas resolution to parent container size
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const canvas = canvasRef.current;
      
      const width = Math.max(300, Math.floor(rect.width));
      const height = Math.max(200, Math.floor(rect.height));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main rendering draw trigger
  useEffect(() => {
    if (!canvasRef.current || !loadedImage) return;

    const isRevealed = status === 'REVEALED' || status === 'TIMEOUT';
    const currentScale = isRevealed
      ? 1.0
      : calculatePixelScale(elapsedTime, duration, difficultyExponent);

    drawPixelatedImage(canvasRef.current, loadedImage, currentScale, isRevealed);
  }, [loadedImage, status, elapsedTime, duration, difficultyExponent]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300 ${
        isBordered
          ? 'bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      {/* Loading state indicator */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-transparent z-20">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
          <span className="text-slate-400 font-medium text-sm tracking-wider uppercase">Loading Image...</span>
        </div>
      )}

      {/* Error state indicator */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-red-950/20 border border-red-500/20 rounded-2xl z-20">
          <ImageOff className="w-12 h-12 text-red-400" />
          <span className="text-red-300 font-semibold text-base">Failed to load image</span>
        </div>
      )}

      {/* Render Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain transition-all duration-300 ${
          status === 'REVEALED' ? 'scale-100 filter drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]' : ''
        }`}
      />

      {/* Subtle Scanner Line Effect during RUNNING state */}
      {status === 'RUNNING' && (
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#00f0ff] animate-scanline" />
        </div>
      )}
    </div>
  );
}

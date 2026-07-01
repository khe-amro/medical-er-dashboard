import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';

export function XRayViewer() {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleMaximize = () => alert('Opening full-screen viewer...');

  return (
    <div className="bg-card rounded-lg border border-border p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3>Digital X-Ray Viewer</h3>
        <div className="flex gap-2">
          <button onClick={handleZoomIn} className="p-2 hover:bg-muted rounded" title={`Zoom: ${zoom}%`}>
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="p-2 hover:bg-muted rounded" title={`Zoom: ${zoom}%`}>
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleRotate} className="p-2 hover:bg-muted rounded" title={`Rotation: ${rotation}°`}>
            <RotateCw className="w-4 h-4" />
          </button>
          <button onClick={handleMaximize} className="p-2 hover:bg-muted rounded" title="Full screen">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-950 rounded relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="280"
            height="400"
            viewBox="0 0 280 400"
            className="opacity-80 transition-transform duration-300"
            style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
          >
            <defs>
              <radialGradient id="xrayGradient">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.3" />
              </radialGradient>
              <filter id="blur">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
              </filter>
            </defs>

            <ellipse cx="140" cy="80" rx="50" ry="70" fill="url(#xrayGradient)" opacity="0.4" filter="url(#blur)" />

            <ellipse cx="110" cy="180" rx="70" ry="90" fill="url(#xrayGradient)" opacity="0.5" filter="url(#blur)" />
            <ellipse cx="170" cy="180" rx="70" ry="90" fill="url(#xrayGradient)" opacity="0.5" filter="url(#blur)" />

            <path d="M 90 120 Q 85 130, 75 145 L 70 190 Q 68 210, 75 230 L 85 270"
                  stroke="#E2E8F0" strokeWidth="8" fill="none" opacity="0.7" filter="url(#blur)" />
            <path d="M 190 120 Q 195 130, 205 145 L 210 190 Q 212 210, 205 230 L 195 270"
                  stroke="#E2E8F0" strokeWidth="8" fill="none" opacity="0.7" filter="url(#blur)" />

            <ellipse cx="140" cy="150" rx="40" ry="55" fill="none" stroke="#CBD5E1" strokeWidth="2" opacity="0.6" />

            <line x1="60" y1="140" x2="220" y2="140" stroke="#64748B" strokeWidth="1" opacity="0.3" />
            <line x1="60" y1="180" x2="220" y2="180" stroke="#64748B" strokeWidth="1" opacity="0.3" />
            <line x1="60" y1="220" x2="220" y2="220" stroke="#64748B" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>

        <div className="absolute top-2 left-2 text-xs text-slate-400 font-mono">
          <div>Patient: J. DOE</div>
          <div>Date: 2026-05-01</div>
          <div>View: AP Chest</div>
        </div>

        <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
          L
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Resolution: 2048x2048</span>
          <span>kVp: 120 | mAs: 5</span>
        </div>
      </div>
    </div>
  );
}

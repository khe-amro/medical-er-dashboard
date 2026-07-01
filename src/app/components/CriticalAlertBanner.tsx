import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface CriticalAlertBannerProps {
  patientName: string;
  location: string;
}

export function CriticalAlertBanner({ patientName, location }: CriticalAlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className="relative px-6 py-3 flex items-center justify-between overflow-hidden"
      style={{
        backgroundColor: 'var(--esi-1-critical)',
        animation: 'criticalPulse 2s ease-in-out infinite',
      }}
    >
      <div className="absolute inset-0 opacity-20" style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
        animation: 'shimmer 2s linear infinite',
      }} />

      <div className="relative flex items-center gap-3 text-white">
        <AlertTriangle className="w-5 h-5 animate-pulse" />
        <div className="flex items-center gap-2">
          <span className="font-bold">CRITICAL:</span>
          <span>High Severity Patient</span>
          <span className="font-medium">{patientName}</span>
          <span>in {location}</span>
        </div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="relative p-1 hover:bg-white/20 rounded transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <style>{`
        @keyframes criticalPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(220, 38, 38, 0.4);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

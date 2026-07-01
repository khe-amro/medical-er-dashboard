import { useEffect, useRef, useState } from 'react';
import { Activity, Heart, Maximize2 } from 'lucide-react';
import { useRealTimeVitals } from '../hooks/useRealTimeVitals';

interface VitalSignsMonitorProps {
  patientId: string;
  patientName: string;
  heartRate: number;
  bloodPressure: string;
  oxygenSat: number;
  respRate: number;
}

export function VitalSignsMonitor({ patientId, patientName, heartRate, bloodPressure, oxygenSat, respRate }: VitalSignsMonitorProps) {
  const vitals = useRealTimeVitals(patientId, { heartRate, bloodPressure, oxygenSat, respRate });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let offset = 0;

    const drawWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const amplitude = 30;
      const frequency = 0.05;
      const heartbeatInterval = 80;

      for (let x = 0; x < canvas.width; x++) {
        const adjustedX = x + offset;
        let y = canvas.height / 2;

        if (adjustedX % heartbeatInterval < 20) {
          const beatPhase = (adjustedX % heartbeatInterval) / 20;
          y += Math.sin(beatPhase * Math.PI * 4) * amplitude * (1 - beatPhase);
        } else {
          y += Math.sin(adjustedX * frequency) * 3;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      ctx.strokeStyle = '#10B98130';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      offset += 2;
      animationFrame = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: 'var(--esi-4-less-urgent)' }} />
          <h3 className="text-sm">{patientName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 animate-pulse" style={{ color: 'var(--esi-1-critical)' }} />
          <button className="p-1 hover:bg-muted rounded transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={100}
        className="w-full h-24 bg-slate-950 rounded mb-4"
      />

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-muted rounded p-2 hover:bg-muted/80 transition-colors cursor-pointer">
          <div className="text-xs text-muted-foreground">HR</div>
          <div className="text-lg" style={{ color: 'var(--esi-4-less-urgent)' }}>{Math.round(vitals.heartRate)}</div>
          <div className="text-xs text-muted-foreground">bpm</div>
        </div>
        <div className="bg-muted rounded p-2 hover:bg-muted/80 transition-colors cursor-pointer">
          <div className="text-xs text-muted-foreground">BP</div>
          <div className="text-lg">{vitals.bloodPressure}</div>
          <div className="text-xs text-muted-foreground">mmHg</div>
        </div>
        <div className="bg-muted rounded p-2 hover:bg-muted/80 transition-colors cursor-pointer">
          <div className="text-xs text-muted-foreground">SpO₂</div>
          <div className="text-lg" style={{ color: 'var(--esi-5-non-urgent)' }}>{Math.round(vitals.oxygenSat)}%</div>
        </div>
        <div className="bg-muted rounded p-2 hover:bg-muted/80 transition-colors cursor-pointer">
          <div className="text-xs text-muted-foreground">RR</div>
          <div className="text-lg">{Math.round(vitals.respRate)}</div>
          <div className="text-xs text-muted-foreground">/min</div>
        </div>
      </div>
    </div>
  );
}

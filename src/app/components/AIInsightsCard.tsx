import { Brain, AlertTriangle, TrendingUp } from 'lucide-react';

export function AIInsightsCard() {
  return (
    <div className="relative rounded-lg overflow-hidden border border-border/50" style={{
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
      backdropFilter: 'blur(10px)',
    }}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          animation: 'pulse 3s ease-in-out infinite',
        }} />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
        }} />
      </div>

      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-5 h-5" style={{ color: 'var(--esi-5-non-urgent)' }} />
          </div>
          <h3>AI Clinical Insights</h3>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--esi-4-less-urgent)' }} />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-card/80 rounded-lg border border-border/30">
            <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: 'var(--esi-2-emergent)' }} />
            <div>
              <div className="text-sm">Sepsis Risk Detected</div>
              <div className="text-xs text-muted-foreground mt-1">
                Patient J. Smith shows elevated lactate (3.2 mmol/L) and suspected infection. Recommend immediate qSOFA assessment.
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--esi-2-emergent)' }}>Confidence: 87%</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-card/80 rounded-lg border border-border/30">
            <TrendingUp className="w-4 h-4 mt-0.5" style={{ color: 'var(--esi-3-urgent)' }} />
            <div>
              <div className="text-sm">Deterioration Pattern</div>
              <div className="text-xs text-muted-foreground mt-1">
                Patient M. Davis vital trends suggest potential respiratory compromise. BP trending down over last 2hrs.
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--esi-3-urgent)' }}>Confidence: 72%</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-card/80 rounded-lg border border-border/30">
            <Brain className="w-4 h-4 mt-0.5" style={{ color: 'var(--esi-5-non-urgent)' }} />
            <div>
              <div className="text-sm">Resource Optimization</div>
              <div className="text-xs text-muted-foreground mt-1">
                Current census 18/24 beds. Predicted 6-hour influx: +12 patients. Consider staff reallocation to Zone B.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

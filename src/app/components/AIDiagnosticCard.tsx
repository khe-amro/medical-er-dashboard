import { Play, Brain, AlertTriangle } from 'lucide-react';

interface Differential {
  diagnosis: string;
  confidence: number;
  icd10: string;
}

export function AIDiagnosticCard() {
  const differentials: Differential[] = [
    { diagnosis: 'Acute Myocardial Infarction (AMI)', confidence: 87, icd10: 'I21.9' },
    { diagnosis: 'Unstable Angina', confidence: 72, icd10: 'I20.0' },
    { diagnosis: 'Pulmonary Embolism', confidence: 45, icd10: 'I26.9' },
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Brain className="w-5 h-5" style={{ color: 'var(--esi-5-non-urgent)' }} />
        </div>
        <div>
          <h3>AI Diagnostic Intelligence</h3>
          <div className="text-xs text-muted-foreground">Patient: John Smith (A-1)</div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium text-sm">Top 3 Differential Diagnoses</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--esi-4-less-urgent)' }} />
              <span>Live Analysis</span>
            </div>
          </div>

          <div className="space-y-3">
            {differentials.map((diff, idx) => (
              <div key={idx} className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <AlertTriangle className="w-4 h-4" style={{ color: 'var(--esi-2-emergent)' }} />}
                      <div className="font-medium text-sm">{diff.diagnosis}</div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">ICD-10: {diff.icd10}</div>
                  </div>
                  <div className="text-sm font-medium ml-4">{diff.confidence}%</div>
                </div>

                <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${diff.confidence}%`,
                      backgroundColor:
                        diff.confidence >= 80
                          ? 'var(--esi-2-emergent)'
                          : diff.confidence >= 60
                          ? 'var(--esi-3-urgent)'
                          : 'var(--esi-4-less-urgent)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-medium text-sm mb-3">X-Ray AI Analysis</div>
          <div className="relative bg-slate-950 rounded-lg overflow-hidden ai-analyzing" style={{ height: '300px' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 300" className="opacity-80">
              <defs>
                <radialGradient id="xrayGrad">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.3" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <ellipse cx="200" cy="100" rx="80" ry="110" fill="url(#xrayGrad)" opacity="0.5" />
              <ellipse cx="150" cy="200" rx="100" ry="120" fill="url(#xrayGrad)" opacity="0.5" />
              <ellipse cx="250" cy="200" rx="100" ry="120" fill="url(#xrayGrad)" opacity="0.5" />

              <rect
                x="90"
                y="190"
                width="100"
                height="80"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
                strokeDasharray="4 2"
                filter="url(#glow)"
              />

              <text x="95" y="185" fill="#DC2626" fontSize="12" fontWeight="bold">
                Pleural Effusion
              </text>

              <rect
                x="180"
                y="140"
                width="80"
                height="90"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeDasharray="4 2"
                filter="url(#glow)"
              />

              <text x="185" y="135" fill="#F59E0B" fontSize="12" fontWeight="bold">
                Cardiomegaly
              </text>
            </svg>

            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
              AI Confidence: 84%
            </div>
          </div>
        </div>

        <div>
          <div className="font-medium text-sm mb-3">Voice Intake Summary</div>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start gap-3">
              <button className="p-2 bg-primary rounded-full hover:opacity-80 transition-opacity shrink-0">
                <Play className="w-4 h-4 text-primary-foreground fill-current" />
              </button>
              <div className="flex-1">
                <div className="text-sm leading-relaxed">
                  "67-year-old male with acute onset crushing chest pain, radiating to left arm. Pain 8/10, associated with SOB and diaphoresis. Vitals: BP 142/88, HR 92, RR 22, SpO₂ 94%. Patient anxious, in moderate distress."
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Recorded by: Nurse Williams • Duration: 1:23
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes shimmerXray {
              0% {
                background-position: -1000px 0;
              }
              100% {
                background-position: 1000px 0;
              }
            }

            .ai-analyzing::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.2) 50%, transparent 100%);
              animation: shimmerXray 3s ease-in-out infinite;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}

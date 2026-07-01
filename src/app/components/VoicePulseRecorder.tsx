import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play } from 'lucide-react';

interface Props {
  onTranscriptionComplete: (text: string) => void;
  aiAnalysis?: any;
}

export function VoicePulseRecorder({ onTranscriptionComplete, aiAnalysis }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
      };
    }
  }, []);

  useEffect(() => {
    if (!isRecording || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let offset = 0;
    const bars = 40;

    const drawWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / bars;
      const centerY = canvas.height / 2;

      for (let i = 0; i < bars; i++) {
        const amplitude = Math.sin((i + offset) * 0.3) * 30 + Math.random() * 20;
        const x = i * barWidth;
        const barHeight = amplitude;

        ctx.fillStyle = 'var(--esi-5-non-urgent)';
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - 2, barHeight);
      }

      offset += 0.5;
      animationRef.current = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      onTranscriptionComplete(transcript);
    } else {
      setIsRecording(true);
      setTranscript('');
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        // Fallback if not supported
        alert("Speech Recognition not supported in this browser. Please type the chief complaint manually.");
        setIsRecording(false);
      }
    }
  };

  const highlightMedicalTerms = (text: string) => {
    const medicalTerms = [
      'chest pain',
      'radiating',
      'crushing',
      'shortness of breath',
      'diaphoresis',
      'cardiac',
      'Blood pressure',
      'heart rate',
      'respiratory rate',
      'oxygen saturation',
    ];

    let highlighted = text;
    medicalTerms.forEach((term) => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(regex, '<span class="medical-term">$1</span>');
    });

    return highlighted;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="mb-4">Voice Pulse - Clinical Intake</h3>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleToggleRecording}
          className="relative w-32 h-32 rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: isRecording ? 'var(--esi-1-critical)' : 'var(--esi-5-non-urgent)',
            boxShadow: isRecording ? '0 0 0 0 rgba(59, 130, 246, 0.7)' : 'none',
            animation: isRecording ? 'pulse-ring 1.5s infinite' : 'none',
          }}
        >
          {isRecording ? (
            <Square className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </button>

        {isRecording && (
          <div className="w-full">
            <div className="text-sm text-muted-foreground mb-2 text-center">Recording...</div>
            <canvas ref={canvasRef} width={600} height={80} className="w-full h-20 bg-slate-950 rounded" />
          </div>
        )}

        <div className="w-full bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Chief Complaint / Live Transcript</div>
            <button className="p-1 hover:bg-background rounded">
              <Play className="w-4 h-4" />
            </button>
          </div>
          
          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              onTranscriptionComplete(e.target.value);
            }}
            placeholder="Speak into the microphone or type the chief complaint manually here..."
            className="w-full min-h-[100px] p-3 text-sm leading-relaxed bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          />
          
          {aiAnalysis && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                AI Analysis Complete
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded p-3 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Recommended Triage</div>
                  <div className="font-medium" style={{ color: aiAnalysis.esi_level <= 2 ? 'var(--esi-1-critical)' : 'var(--esi-3-urgent)' }}>
                    Level {aiAnalysis.esi_level} ({(aiAnalysis.confidence * 100).toFixed(0)}% confidence)
                  </div>
                </div>
                <div className="bg-background rounded p-3 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Reasoning</div>
                  <div className="text-sm">{aiAnalysis.reasoning}</div>
                </div>
              </div>
              {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                <div className="mt-3 bg-background rounded p-3 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Recommended Actions</div>
                  <ul className="text-sm list-disc pl-4 space-y-1">
                    {aiAnalysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }

        .medical-term {
          color: var(--esi-5-non-urgent);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

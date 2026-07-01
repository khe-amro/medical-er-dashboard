import { useState } from 'react';
import { Upload, FileImage, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  onAnalysisComplete?: (results: any) => void;
}

export function XRayDropzone({ onAnalysisComplete }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      console.log('Files dropped:', files);
      handleUpload(files[0]);
    }
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.dcm';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        console.log('Files selected:', files);
        handleUpload(files[0]);
      }
    };
    input.click();
  };

  const [aiResult, setAiResult] = useState<any>(null);

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setAiResult(null);

    // Fake progress bar animation for UI feel
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Wait at 90 until real API returns
        return prev + 10;
      });
    }, 200);

    try {
      const aiUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${aiUrl}/analyze/xray`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAiResult(data);
      if (onAnalysisComplete) onAnalysisComplete(data);
      
      clearInterval(interval);
      setProgress(100);
      setIsProcessing(false);
      setIsComplete(true);
    } catch (error) {
      console.error("X-Ray AI processing failed", error);
      clearInterval(interval);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="mb-4">Medical Imaging Upload</h3>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/5'
            : isComplete
            ? 'border-green-500 bg-green-50'
            : 'border-border hover:border-primary hover:bg-muted/50'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          {isComplete ? (
            <>
              <CheckCircle2 className="w-12 h-12" style={{ color: 'var(--esi-4-less-urgent)' }} />
              <div className="text-center">
                <div className="font-medium">X-Ray Processed Successfully</div>
                <div className="text-sm text-muted-foreground mt-1">AI analysis complete</div>
              </div>
            </>
          ) : isProcessing ? (
            <>
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--esi-5-non-urgent)' }} />
                <div className="absolute inset-0 rounded-full shimmer-effect" />
              </div>
              <div className="text-center w-full">
                <div className="font-medium mb-2">Processing via AI...</div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden relative">
                  <div className="absolute inset-0 shimmer-effect" />
                  <div
                    className="h-full transition-all duration-300 relative z-10"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: 'var(--esi-5-non-urgent)',
                    }}
                  />
                </div>
                <div className="text-sm text-muted-foreground mt-2">{progress}% complete</div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-muted rounded-full">
                {isDragging ? (
                  <Upload className="w-8 h-8" style={{ color: 'var(--esi-5-non-urgent)' }} />
                ) : (
                  <FileImage className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="text-center">
                <div className="font-medium">Drop X-Ray images here</div>
                <div className="text-sm text-muted-foreground mt-1">
                  or click to browse • PNG, JPEG, DICOM
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isComplete && aiResult && (
        <div className="mt-4 p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-start gap-3 mb-4">
            <FileImage className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--esi-5-non-urgent)' }} />
            <div className="flex-1">
              <div className="text-sm font-medium">Image Processed</div>
              <div className="text-xs text-muted-foreground mt-1">
                AI Confidence: {(aiResult.overall_confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium mb-2">Detected Findings:</div>
            {aiResult.findings && aiResult.findings.map((finding: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-background p-2 rounded border border-border">
                <div>
                  <span className="font-medium text-sm">{finding.condition}</span>
                  <span className="text-xs text-muted-foreground ml-2">({finding.location})</span>
                </div>
                <div className={`text-xs px-2 py-1 rounded ${
                  finding.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  finding.severity === 'mild' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {finding.severity.toUpperCase()}
                </div>
              </div>
            ))}
            {aiResult.normal && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                No significant abnormalities detected.
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .shimmer-effect {
          background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%);
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

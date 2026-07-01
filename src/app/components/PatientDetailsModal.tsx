import { useState, useEffect } from 'react';
import { X, Activity, Heart, Thermometer, Wind, Clock, User } from 'lucide-react';
import api from '@/services/api';

interface PatientDetails {
  id: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  esiLevel: 1 | 2 | 3 | 4 | 5;
  arrivalTime: string;
  bedNumber: string;
  vitals: {
    bp: string;
    hr: number;
    temp: number;
    spo2: number;
    rr: number;
  };
}

interface PatientDetailsModalProps {
  patient: PatientDetails | null;
  onClose: () => void;
}

const esiColors: any = {
  1: 'var(--esi-1-critical)',
  2: 'var(--esi-2-emergent)',
  3: 'var(--esi-3-urgent)',
  4: 'var(--esi-4-less-urgent)',
  5: 'var(--esi-5-non-urgent)',
};

export function PatientDetailsModal({ patient, onClose }: PatientDetailsModalProps) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (patient?.id) {
      api.get(`/patients/${patient.id}/history`)
        .then(res => setHistory(res.data))
        .catch(err => console.error('Failed to load history', err));
    }
  }, [patient?.id]);

  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted rounded-full">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-medium">{patient.name}</h2>
              <div className="text-sm text-muted-foreground mt-1">
                {patient.age}Y • {patient.gender} • Bed {patient.bedNumber}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="px-3 py-1 rounded text-xs text-white" style={{ backgroundColor: esiColors[patient.esiLevel] }}>
                  ESI-{patient.esiLevel}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Arrived: {patient.arrivalTime}
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Chief Complaint</h3>
            <div className="p-3 bg-muted rounded-lg">{patient.chiefComplaint}</div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Current Vital Signs</h3>
            <div className="grid grid-cols-5 gap-3">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Heart className="w-3 h-3" style={{ color: 'var(--esi-1-critical)' }} />
                  <span>BP</span>
                </div>
                <div className="font-medium">{patient.vitals.bp}</div>
                <div className="text-xs text-muted-foreground">mmHg</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Activity className="w-3 h-3" style={{ color: 'var(--esi-4-less-urgent)' }} />
                  <span>HR</span>
                </div>
                <div className="font-medium">{patient.vitals.hr}</div>
                <div className="text-xs text-muted-foreground">bpm</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Thermometer className="w-3 h-3" style={{ color: 'var(--esi-2-emergent)' }} />
                  <span>Temp</span>
                </div>
                <div className="font-medium">{patient.vitals.temp}°F</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Wind className="w-3 h-3" style={{ color: 'var(--esi-5-non-urgent)' }} />
                  <span>SpO₂</span>
                </div>
                <div className="font-medium">{patient.vitals.spo2}%</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Activity className="w-3 h-3" />
                  <span>RR</span>
                </div>
                <div className="font-medium">{patient.vitals.rr}</div>
                <div className="text-xs text-muted-foreground">/min</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Patient Status History</h3>
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((h, idx) => (
                    <div key={idx} className="flex flex-col text-sm p-3 bg-muted rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{h.status.toUpperCase()}</span>
                        <span className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-xs">
                         <span className="text-muted-foreground">Location:</span> {h.location || 'N/A'}
                         {' | '}
                         <span className="text-muted-foreground">Updated By:</span> {h.updated_by_name || 'System'}
                      </div>
                      {h.notes && (
                         <div className="mt-2 text-xs italic">Note: {h.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No history available for this visit.</div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              View Full Chart
            </button>
            <button className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
              Order Labs
            </button>
            <button className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
              Prescribe Medication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

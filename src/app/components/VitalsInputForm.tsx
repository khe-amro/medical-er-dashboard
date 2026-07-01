import { Activity, Heart, Thermometer, Wind, User, Calendar, Hash } from 'lucide-react';

export interface VitalsState {
  systolic: string;
  diastolic: string;
  heartRate: string;
  temperature: string;
  tempUnit: string;
  oxygenSat: string;
  respRate: string;
  painLevel: string;
}

export interface PatientInfoState {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mrn: string;
}

interface Props {
  vitals: VitalsState;
  setVitals: (v: VitalsState) => void;
  patientInfo: PatientInfoState;
  setPatientInfo: (p: PatientInfoState) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function VitalsInputForm({ vitals, setVitals, patientInfo, setPatientInfo, onSubmit, isSubmitting }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-6">
      
      {/* Patient Information Section */}
      <div>
        <h3 className="mb-4 text-lg font-medium">Patient Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              First Name
            </label>
            <input
              type="text"
              placeholder="First Name"
              required
              value={patientInfo.firstName}
              onChange={(e) => setPatientInfo({ ...patientInfo, firstName: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <User className="w-4 h-4 opacity-0" />
              Last Name
            </label>
            <input
              type="text"
              placeholder="Last Name"
              required
              value={patientInfo.lastName}
              onChange={(e) => setPatientInfo({ ...patientInfo, lastName: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date of Birth
            </label>
            <input
              type="date"
              required
              value={patientInfo.dateOfBirth}
              onChange={(e) => setPatientInfo({ ...patientInfo, dateOfBirth: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Gender
            </label>
            <select
              value={patientInfo.gender}
              onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              MRN (Medical Record Number)
            </label>
            <input
              type="text"
              placeholder="Auto-generated if left blank"
              value={patientInfo.mrn}
              onChange={(e) => setPatientInfo({ ...patientInfo, mrn: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* Vitals Section */}
      <div>
        <h3 className="mb-4 text-lg font-medium">Vital Signs</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" style={{ color: 'var(--esi-1-critical)' }} />
              Blood Pressure
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Systolic"
                value={vitals.systolic}
                onChange={(e) => setVitals({ ...vitals, systolic: e.target.value })}
                className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="flex items-center text-muted-foreground">/</span>
              <input
                type="number"
                placeholder="Diastolic"
                value={vitals.diastolic}
                onChange={(e) => setVitals({ ...vitals, diastolic: e.target.value })}
                className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">mmHg</div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: 'var(--esi-4-less-urgent)' }} />
              Heart Rate
            </label>
            <input
              type="number"
              placeholder="0"
              value={vitals.heartRate}
              onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="text-xs text-muted-foreground mt-1">bpm</div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Thermometer className="w-4 h-4" style={{ color: 'var(--esi-2-emergent)' }} />
              Temperature
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={vitals.tempUnit}
                onChange={(e) => setVitals({ ...vitals, tempUnit: e.target.value })}
                className="px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>°F</option>
                <option>°C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Wind className="w-4 h-4" style={{ color: 'var(--esi-5-non-urgent)' }} />
              Oxygen Saturation
            </label>
            <input
              type="number"
              placeholder="0"
              max="100"
              value={vitals.oxygenSat}
              onChange={(e) => setVitals({ ...vitals, oxygenSat: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="text-xs text-muted-foreground mt-1">%</div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Respiratory Rate
            </label>
            <input
              type="number"
              placeholder="0"
              value={vitals.respRate}
              onChange={(e) => setVitals({ ...vitals, respRate: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="text-xs text-muted-foreground mt-1">breaths/min</div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2">Pain Level</label>
            <input
              type="number"
              placeholder="0-10"
              max="10"
              value={vitals.painLevel}
              onChange={(e) => setVitals({ ...vitals, painLevel: e.target.value })}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="text-xs text-muted-foreground mt-1">0-10 scale</div>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
      >
        {isSubmitting ? "Processing AI Triage..." : "Submit Patient Intake & AI Triage"}
      </button>
    </form>
  );
}

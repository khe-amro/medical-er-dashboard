import { useState } from 'react';
import { VitalsInputForm, VitalsState, PatientInfoState } from './VitalsInputForm';
import { VoicePulseRecorder } from './VoicePulseRecorder';
import { XRayDropzone } from './XRayDropzone';
import api from '@/services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  onIntakeComplete?: () => void;
}

export function IntakePortal({ onIntakeComplete }: Props) {
  const [patientInfo, setPatientInfo] = useState<PatientInfoState>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    mrn: ''
  });

  const [vitals, setVitals] = useState<VitalsState>({
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    tempUnit: '°F',
    oxygenSat: '',
    respRate: '',
    painLevel: '',
  });

  const [transcription, setTranscription] = useState('');
  const [xrayFindings, setXrayFindings] = useState<any>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const submitIntake = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Create Patient
      // Auto-generate MRN if not provided
      const finalMrn = patientInfo.mrn || `MRN-${Math.floor(Math.random() * 100000)}`;
      
      let patientId;
      try {
        const patientRes = await api.post('/patients', {
          mrn: finalMrn,
          first_name: patientInfo.firstName,
          last_name: patientInfo.lastName,
          date_of_birth: patientInfo.dateOfBirth,
          gender: patientInfo.gender,
          blood_type: 'Unknown'
        });
        patientId = patientRes.data.id;
      } catch (e: any) {
        if (e.response && e.response.status === 409) {
          throw new Error("A patient with this MRN already exists. Please check the MRN.");
        }
        throw new Error("Failed to create patient record in the database.");
      }

      // 2. Call AI Triage
      let esiLevel = 3;
      let aiReasoning = "Standard protocol.";
      
      if (transcription || vitals.heartRate || vitals.systolic) {
        const aiUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
        try {
          const aiRes = await fetch(`${aiUrl}/predict/triage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              age: new Date().getFullYear() - new Date(patientInfo.dateOfBirth).getFullYear() || 30,
              gender: patientInfo.gender,
              chief_complaint: transcription || "Unknown complaint",
              vitals: {
                heart_rate: parseInt(vitals.heartRate) || 80,
                blood_pressure: `${vitals.systolic}/${vitals.diastolic}`,
                respiratory_rate: parseInt(vitals.respRate) || 16,
                oxygen_saturation: parseInt(vitals.oxygenSat) || 98
              },
              history: []
            })
          });
          const aiData = await aiRes.json();
          esiLevel = aiData.esi_level || 3;
          aiReasoning = aiData.reasoning || "Based on basic vitals.";
        } catch (aiErr) {
          console.error("AI Service unavailable. Defaulting to ESI-3.", aiErr);
        }
      }

      // Append X-Ray findings to reasoning if they exist
      if (xrayFindings && xrayFindings.findings) {
        const xrayNotes = xrayFindings.findings.map((f: any) => `${f.condition} (${f.severity})`).join(', ');
        aiReasoning += ` | X-Ray AI detected: ${xrayNotes}`;
      }

      // 3. Create ER Visit
      const visitRes = await api.post('/visits', {
        patient_id: patientId,
        chief_complaint: transcription || "No transcript provided",
        esi_level: esiLevel,
        bed_number: 'Waiting Room',
        notes: aiReasoning
      });
      const visitId = visitRes.data.id;

      // 4. Save Vitals
      if (vitals.systolic && vitals.heartRate) {
        await api.post('/vitals', {
          visit_id: visitId,
          systolic_bp: parseInt(vitals.systolic),
          diastolic_bp: parseInt(vitals.diastolic),
          heart_rate: parseInt(vitals.heartRate),
          temperature: parseFloat(vitals.temperature) || 98.6,
          temperature_unit: vitals.tempUnit.replace('°', ''), // Fix: PostgreSQL schema only accepts 'F' or 'C' (varchar 1)
          oxygen_saturation: parseInt(vitals.oxygenSat) || 98,
          respiratory_rate: parseInt(vitals.respRate) || 16,
          pain_level: parseInt(vitals.painLevel) || 0
        });
      }

      setSuccessMsg(`Patient created successfully! Assigned ESI-${esiLevel}.`);
      
      // Reset form
      setPatientInfo({ firstName: '', lastName: '', dateOfBirth: '', gender: 'male', mrn: '' });
      setVitals({ systolic: '', diastolic: '', heartRate: '', temperature: '', tempUnit: '°F', oxygenSat: '', respRate: '', painLevel: '' });
      setTranscription('');
      setXrayFindings(null);
      
      if (onIntakeComplete) {
        onIntakeComplete(); // Triggers a reload of patients in App.tsx
      }

    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An error occurred during intake submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg mb-1">Patient Intake Portal</h2>
        <div className="text-sm text-muted-foreground">Comprehensive AI-assisted triage and documentation</div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <VitalsInputForm 
            vitals={vitals} 
            setVitals={setVitals} 
            patientInfo={patientInfo}
            setPatientInfo={setPatientInfo}
            onSubmit={submitIntake}
            isSubmitting={isSubmitting}
          />
          <XRayDropzone onAnalysisComplete={(res) => setXrayFindings(res)} />
        </div>
        <div className="space-y-6">
           <VoicePulseRecorder 
             onTranscriptionComplete={(text) => setTranscription(text)} 
             aiAnalysis={null} 
           />
           {transcription && (
             <div className="bg-card rounded-lg border border-border p-4">
               <h4 className="font-medium text-sm mb-2 text-muted-foreground">Captured Chief Complaint</h4>
               <p className="text-sm">{transcription}</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

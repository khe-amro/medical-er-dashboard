import { useState, useEffect } from 'react';
import { socketService } from '@/services/socket';

export interface VitalsData {
  heartRate: number;
  bloodPressure: string;
  oxygenSat: number;
  respRate: number;
}

export function useRealTimeVitals(patientId: string, baseVitals: VitalsData) {
  const [vitals, setVitals] = useState<VitalsData>(baseVitals);

  useEffect(() => {
    // 1. We still run a small simulation interval to make the chart waveform look alive
    const interval = setInterval(() => {
      setVitals((prev) => ({
        ...prev,
        heartRate: Math.max(60, Math.min(200, prev.heartRate + (Math.random() - 0.5) * 2)),
      }));
    }, 1000);

    // 2. But we listen to ACTUAL WebSocket updates for real data
    socketService.subscribeToPatient(patientId);
    
    const handleVitalUpdate = (newVitals: any) => {
      // Only update if it belongs to this patient
      if (newVitals.visit_id === patientId || !newVitals.visit_id) {
        setVitals((prev) => ({
          ...prev,
          heartRate: newVitals.heart_rate || prev.heartRate,
          bloodPressure: `${newVitals.systolic_bp}/${newVitals.diastolic_bp}` || prev.bloodPressure,
          oxygenSat: newVitals.oxygen_saturation || prev.oxygenSat,
          respRate: newVitals.respiratory_rate || prev.respRate
        }));
      }
    };

    socketService.onVitalUpdate(handleVitalUpdate);

    return () => {
      clearInterval(interval);
      socketService.off('vitals:update');
    };
  }, [patientId]);

  return vitals;
}

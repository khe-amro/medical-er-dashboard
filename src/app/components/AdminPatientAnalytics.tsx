import { Users, TrendingUp, Clock, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { useState, useEffect } from 'react';
import api from '@/services/api';

export function AdminPatientAnalytics() {
  const [patientDemographics, setPatientDemographics] = useState<any[]>([]);
  const [admissionTrends, setAdmissionTrends] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalPatients: 0, admissions: 0, avgStay: 0, readmissionRate: 0 });

  const diagnosisDistribution = [
    { name: 'Cardiac', value: 28, color: 'var(--esi-1-critical)' },
    { name: 'Respiratory', value: 22, color: 'var(--esi-2-emergent)' },
    { name: 'Trauma', value: 18, color: 'var(--esi-3-urgent)' },
    { name: 'Neurological', value: 15, color: 'var(--esi-4-less-urgent)' },
    { name: 'Other', value: 17, color: 'var(--esi-5-non-urgent)' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [demoRes, volRes, overviewRes, waitRes] = await Promise.all([
          api.get('/analytics/demographics'),
          api.get('/analytics/patient-volume'),
          api.get('/analytics/overview'),
          api.get('/analytics/wait-times')
        ]);
        
        setPatientDemographics(demoRes.data);
        setAdmissionTrends(volRes.data);

        let avgWait = 0;
        if (waitRes.data && waitRes.data.length > 0) {
           avgWait = waitRes.data.reduce((acc: number, val: any) => acc + val.avg_wait, 0) / waitRes.data.length;
        }
        
        setStats({
          totalPatients: overviewRes.data.totalPatients24h || 0,
          admissions: volRes.data.reduce((acc: number, val: any) => acc + Number(val.admissions), 0),
          avgStay: Math.round((avgWait / 60) * 10) / 10,
          readmissionRate: 2.7 // Needs backend expansion
        });
      } catch (error) {
        console.error("Failed to load patient analytics", error);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-xl">Patient Analytics & Insights</h3>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Users className="w-6 h-6" style={{ color: 'var(--esi-5-non-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalPatients}</div>
          <div className="text-sm text-muted-foreground">Total Patients (Month)</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <TrendingUp className="w-6 h-6" style={{ color: 'var(--esi-4-less-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.admissions}</div>
          <div className="text-sm text-muted-foreground">Admissions (This Month)</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Clock className="w-6 h-6" style={{ color: 'var(--esi-3-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.avgStay}h</div>
          <div className="text-sm text-muted-foreground">Avg Length of Stay</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
              <Activity className="w-6 h-6" style={{ color: 'var(--esi-1-critical)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.readmissionRate}%</div>
          <div className="text-sm text-muted-foreground">Readmission Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium mb-4">Patient Demographics by Age</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientDemographics}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ageGroup" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
              <Bar dataKey="count" fill="var(--esi-5-non-urgent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium mb-4">Primary Diagnosis Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={diagnosisDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {diagnosisDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h4 className="font-medium mb-4">Admission & Discharge Trends</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={admissionTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
            <Legend />
            <Line type="monotone" dataKey="admissions" stroke="var(--esi-5-non-urgent)" strokeWidth={2} />
            <Line type="monotone" dataKey="discharges" stroke="var(--esi-4-less-urgent)" strokeWidth={2} />
            <Line type="monotone" dataKey="readmissions" stroke="var(--esi-1-critical)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Clock, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface QueuePatient {
  id: string;
  esiLevel: 1 | 2 | 3 | 4 | 5;
  name: string;
  age: number;
  gender: string;
  hrTrend: number[];
  spo2Trend: number[];
  aiTriage: string;
  topDifferential: string;
  waitTimeMinutes: number;
}

const esiColors = {
  1: 'var(--esi-1-critical)',
  2: 'var(--esi-2-emergent)',
  3: 'var(--esi-3-urgent)',
  4: 'var(--esi-4-less-urgent)',
  5: 'var(--esi-5-non-urgent)',
};

type SortField = 'name' | 'esiLevel' | 'waitTime';
type SortDirection = 'asc' | 'desc';

export function DoctorQueueTable({ patients, onPatientClick }: { patients: QueuePatient[]; onPatientClick?: (id: string) => void }) {
  const [sortField, setSortField] = useState<SortField>('esiLevel');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPatients = [...patients].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'esiLevel':
        comparison = a.esiLevel - b.esiLevel;
        break;
      case 'waitTime':
        comparison = a.waitTimeMinutes - b.waitTimeMinutes;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const formatTrendData = (data: number[]) => data.map((value, index) => ({ index, value }));

  const formatWaitTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-30" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="w-3"></th>
              <th className="text-left p-4 text-sm">
                <button onClick={() => handleSort('name')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                  Patient
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-left p-4 text-sm">Vital Trends</th>
              <th className="text-left p-4 text-sm">
                <button onClick={() => handleSort('esiLevel')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                  AI Triage Assessment
                  <SortIcon field="esiLevel" />
                </button>
              </th>
              <th className="text-left p-4 text-sm">
                <button onClick={() => handleSort('waitTime')} className="flex items-center gap-2 hover:text-foreground transition-colors">
                  Wait Time
                  <SortIcon field="waitTime" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedPatients.map((patient) => {
              const isLongWait = patient.waitTimeMinutes > 60;
              const isCritical = patient.esiLevel === 1;
              return (
                <tr
                  key={patient.id}
                  onClick={() => onPatientClick?.(patient.id)}
                  className={`hover:bg-muted/50 transition-colors cursor-pointer ${isCritical ? 'critical-row' : ''}`}
                  style={isCritical ? { animation: 'criticalRowPulse 2s ease-in-out infinite' } : {}}
                >
                  <td>
                    <div
                      className="w-1 h-full"
                      style={{ backgroundColor: esiColors[patient.esiLevel] }}
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {patient.age}Y • {patient.gender}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <span>HR</span>
                          <span className="font-medium text-foreground">{patient.hrTrend[patient.hrTrend.length - 1]}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={30}>
                          <LineChart data={formatTrendData(patient.hrTrend)}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="var(--esi-4-less-urgent)"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <span>SpO₂</span>
                          <span className="font-medium text-foreground">{patient.spo2Trend[patient.spo2Trend.length - 1]}%</span>
                        </div>
                        <ResponsiveContainer width="100%" height={30}>
                          <LineChart data={formatTrendData(patient.spo2Trend)}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="var(--esi-5-non-urgent)"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      <div
                        className="px-2 py-1 rounded text-xs text-white shrink-0"
                        style={{ backgroundColor: esiColors[patient.esiLevel] }}
                      >
                        {patient.aiTriage}
                      </div>
                      <div className="text-sm">{patient.topDifferential}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: isLongWait ? 'var(--esi-1-critical)' : 'currentColor' }} />
                      <span className={isLongWait ? 'font-medium' : ''} style={{ color: isLongWait ? 'var(--esi-1-critical)' : 'currentColor' }}>
                        {formatWaitTime(patient.waitTimeMinutes)}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes criticalRowPulse {
          0%, 100% {
            background-color: transparent;
            box-shadow: inset 0 0 0 0 rgba(220, 38, 38, 0);
          }
          50% {
            background-color: rgba(220, 38, 38, 0.05);
            box-shadow: inset 0 0 10px 2px rgba(220, 38, 38, 0.1);
          }
        }
      `}</style>
    </div>
  );
}

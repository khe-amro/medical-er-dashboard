import { Clock, User, ChevronRight } from 'lucide-react';

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  esiLevel: 1 | 2 | 3 | 4 | 5;
  arrivalTime: string;
  bedNumber: string;
  onClick?: (id: string) => void;
}

const esiColors = {
  1: 'var(--esi-1-critical)',
  2: 'var(--esi-2-emergent)',
  3: 'var(--esi-3-urgent)',
  4: 'var(--esi-4-less-urgent)',
  5: 'var(--esi-5-non-urgent)',
};

const esiLabels = {
  1: 'ESI-1 Critical',
  2: 'ESI-2 Emergent',
  3: 'ESI-3 Urgent',
  4: 'ESI-4 Less Urgent',
  5: 'ESI-5 Non-Urgent',
};

export function PatientCard({ id, name, age, gender, chiefComplaint, esiLevel, arrivalTime, bedNumber, onClick }: PatientCardProps) {
  return (
    <div
      onClick={() => onClick?.(id)}
      className="bg-card rounded-lg border-l-4 border-border p-4 hover:shadow-lg hover:scale-105 transition-all cursor-pointer group"
      style={{
        borderLeftColor: esiColors[esiLevel],
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-muted rounded-full">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">{age}Y • {gender} • Bed {bedNumber}</div>
          </div>
        </div>
        <div className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: esiColors[esiLevel] }}>
          {esiLabels[esiLevel]}
        </div>
      </div>

      <div className="text-sm mb-3">
        <div className="text-muted-foreground text-xs mb-1">Chief Complaint</div>
        <div>{chiefComplaint}</div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Arrived: {arrivalTime}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

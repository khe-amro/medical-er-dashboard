import { LucideIcon } from 'lucide-react';

interface PlaceholderViewProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PlaceholderView({ icon: Icon, title, description }: PlaceholderViewProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
        <button className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          Coming Soon
        </button>
      </div>
    </div>
  );
}

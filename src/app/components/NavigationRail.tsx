import { Activity, Users, ClipboardList, Settings, Bell, BarChart3, FileText, Shield } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

type NavView = 'dashboard' | 'queue' | 'intake' | 'diagnostic' | 'analytics' | 'reports' | 'alerts' | 'settings' | 'admin';

interface NavigationRailProps {
  user?: any;
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  alertCount?: number;
  isAdmin?: boolean;
}

export function NavigationRail({ user, activeView, onViewChange, alertCount = 0, isAdmin = true }: NavigationRailProps) {
  const { t } = useLanguage();

  const navItems = [
    { icon: Activity, label: t('overview_dashboard'), view: 'dashboard' as NavView },
    { icon: Users, label: t('doctor_queue'), view: 'queue' as NavView },
    { icon: ClipboardList, label: t('nurse_intake'), view: 'intake' as NavView },
    { icon: BarChart3, label: t('analytics'), view: 'analytics' as NavView },
    { icon: FileText, label: t('reports'), view: 'reports' as NavView },
    { icon: Bell, label: t('alerts'), view: 'alerts' as NavView, badge: alertCount },
    { icon: Settings, label: t('settings'), view: 'settings' as NavView },
    ...(isAdmin ? [{ icon: Shield, label: t('admin'), view: 'admin' as NavView }] : []),
  ];

  return (
    <div className="w-20 bg-card border-r border-border flex flex-col items-center py-6 gap-4">
      <div className="mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--esi-1-critical)' }} onClick={() => onViewChange('dashboard')}>
          <Activity className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onViewChange(item.view)}
            className={`relative w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
              activeView === item.view
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'text-muted-foreground hover:bg-muted hover:scale-105'
            }`}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
            {item.badge && item.badge > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse" style={{ backgroundColor: 'var(--esi-1-critical)' }}>
                {item.badge}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-2">
        <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer" title={user?.full_name || 'Staff'}>
          {user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'DR'}
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, X, Volume2, VolumeX, Clock, User } from 'lucide-react';
import api from '@/services/api';
import { socketService } from '@/services/socket';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  patient?: string;
  location?: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  priority: 'high' | 'medium' | 'low';
}

export function AlertManagement() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(true);

  useEffect(() => {
    // 1. Fetch initial alerts
    async function loadAlerts() {
      try {
        const response = await api.get('/alerts');
        const formattedAlerts = response.data.map((a: any) => ({
          id: a.id,
          type: a.alert_type === 'critical' ? 'critical' : a.alert_type === 'warning' ? 'warning' : 'info',
          title: a.title,
          message: a.message,
          patient: a.patient_first_name ? `${a.patient_first_name} ${a.patient_last_name}` : 'Unknown Patient',
          location: a.location || 'ER',
          timestamp: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          acknowledged: a.acknowledged,
          acknowledgedBy: a.acknowledged ? 'Staff' : undefined,
          priority: a.priority || 'medium'
        }));
        setAlerts(formattedAlerts);
      } catch (err) {
        console.error("Failed to load alerts:", err);
      }
    }
    loadAlerts();

    // 2. Listen for new real-time alerts
    const handleNewAlert = (data: any) => {
      const newAlert: Alert = {
        id: data.id,
        type: data.alert_type,
        title: data.title,
        message: data.message,
        patient: 'Incoming Alert',
        location: data.location || 'ER',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        acknowledged: false,
        priority: data.priority || 'high'
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      
      if (soundEnabled) {
        // play sound logic here if we had an audio file
      }
    };

    socketService.onNewAlert(handleNewAlert);

    return () => {
      socketService.off('alert:new');
    };
  }, [soundEnabled]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await api.patch(`/alerts/${alertId}/acknowledge`);
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? { ...alert, acknowledged: true, acknowledgedBy: 'You' }
            : alert
        )
      );
    } catch (err) {
      console.error("Failed to acknowledge", err);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (err) {
      console.error("Failed to dismiss", err);
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      case 'info':
        return Info;
      case 'success':
        return CheckCircle;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'var(--esi-1-critical)';
      case 'warning':
        return 'var(--esi-3-urgent)';
      case 'info':
        return 'var(--esi-5-non-urgent)';
      case 'success':
        return 'var(--esi-4-less-urgent)';
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesAcknowledged = showAcknowledged || !alert.acknowledged;
    return matchesType && matchesAcknowledged;
  });

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalCount = activeAlerts.filter((a) => a.type === 'critical').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Alert Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage critical alerts and notifications • {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Configure Rules
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border-l-4 p-4" style={{ borderLeftColor: 'var(--esi-1-critical)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Critical Alerts</div>
            <AlertTriangle className="w-5 h-5" style={{ color: 'var(--esi-1-critical)' }} />
          </div>
          <div className="text-3xl font-bold">{criticalCount}</div>
        </div>

        <div className="bg-card rounded-lg border-l-4 p-4" style={{ borderLeftColor: 'var(--esi-3-urgent)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Warnings</div>
            <AlertCircle className="w-5 h-5" style={{ color: 'var(--esi-3-urgent)' }} />
          </div>
          <div className="text-3xl font-bold">{activeAlerts.filter((a) => a.type === 'warning').length}</div>
        </div>

        <div className="bg-card rounded-lg border-l-4 p-4" style={{ borderLeftColor: 'var(--esi-5-non-urgent)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Info</div>
            <Info className="w-5 h-5" style={{ color: 'var(--esi-5-non-urgent)' }} />
          </div>
          <div className="text-3xl font-bold">{activeAlerts.filter((a) => a.type === 'info').length}</div>
        </div>

        <div className="bg-card rounded-lg border-l-4 p-4" style={{ borderLeftColor: 'var(--esi-4-less-urgent)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Avg Response Time</div>
            <Clock className="w-5 h-5" style={{ color: 'var(--esi-4-less-urgent)' }} />
          </div>
          <div className="text-3xl font-bold">3.2<span className="text-base text-muted-foreground ml-1">min</span></div>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('critical')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === 'critical' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === 'warning' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setFilterType('info')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              filterType === 'info' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            Info
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            id="showAcknowledged"
            checked={showAcknowledged}
            onChange={(e) => setShowAcknowledged(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="showAcknowledged" className="text-sm cursor-pointer">
            Show acknowledged alerts
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          const color = getAlertColor(alert.type);

          return (
            <div
              key={alert.id}
              className={`bg-card rounded-lg border-l-4 p-4 transition-all ${
                !alert.acknowledged ? 'shadow-md' : 'opacity-60'
              }`}
              style={{
                borderLeftColor: color,
                animation: !alert.acknowledged && alert.type === 'critical' ? 'criticalPulse 2s ease-in-out infinite' : 'none',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{alert.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          alert.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : alert.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{alert.timestamp}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:opacity-90 transition-opacity"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm mb-3">{alert.message}</p>

                  <div className="flex items-center gap-4 text-sm">
                    {alert.patient && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{alert.patient}</span>
                      </div>
                    )}
                    {alert.location && (
                      <div className="text-muted-foreground">📍 {alert.location}</div>
                    )}
                  </div>

                  {alert.acknowledged && alert.acknowledgedBy && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4" style={{ color: 'var(--esi-4-less-urgent)' }} />
                      <span>Acknowledged by {alert.acknowledgedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="p-12 text-center text-muted-foreground bg-card rounded-lg border border-border">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No alerts to display</p>
        </div>
      )}

      <style>{`
        @keyframes criticalPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(220, 38, 38, 0.2);
          }
        }
      `}</style>
    </div>
  );
}

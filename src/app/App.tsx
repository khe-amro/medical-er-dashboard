import { useState, useEffect } from 'react';
import { NavigationRail } from './components/NavigationRail';
import { PatientCard } from './components/PatientCard';
import { VitalSignsMonitor } from './components/VitalSignsMonitor';
import { XRayViewer } from './components/XRayViewer';
import { AIInsightsCard } from './components/AIInsightsCard';
import { DoctorQueueTable } from './components/DoctorQueueTable';
import { VoicePulseRecorder } from './components/VoicePulseRecorder';
import { XRayDropzone } from './components/XRayDropzone';
import { AIDiagnosticCard } from './components/AIDiagnosticCard';
import { VitalsInputForm } from './components/VitalsInputForm';
import { CriticalAlertBanner } from './components/CriticalAlertBanner';
import { LanguageToggle, Language } from './components/LanguageToggle';
import { PatientDetailsModal } from './components/PatientDetailsModal';
import { PlaceholderView } from './components/PlaceholderView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { IntakePortal } from './components/IntakePortal';
import { ReportsCenter } from './components/ReportsCenter';
import { AlertManagement } from './components/AlertManagement';
import { SystemSettings } from './components/SystemSettings';
import { AdminDashboard } from './components/AdminDashboard';
import { useLanguage } from './LanguageContext';
import { AlertCircle, Users, Clock } from 'lucide-react';

import { AuthScreen } from './components/AuthScreen';
import api from '@/services/api';
import { socketService } from '@/services/socket';

type NavView = 'dashboard' | 'queue' | 'intake' | 'diagnostic' | 'analytics' | 'reports' | 'alerts' | 'settings' | 'admin';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('er_auth_token'));
  
  // Real User State
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('er_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Global UI State
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'auto') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [hasCriticalPatients, setHasCriticalPatients] = useState(false);
  const [criticalPatientName, setCriticalPatientName] = useState("");
  const [criticalPatientLocation, setCriticalPatientLocation] = useState("");
  const [alertCount, setAlertCount] = useState(0);

  // Real dashboard stats
  const [stats, setStats] = useState({ activePatients: 0, criticalCases: 0, avgWait: 0 });

  const [queuePatients, setQueuePatients] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [patientDetailsData, setPatientDetailsData] = useState<any>({});

  const loadPatients = async () => {
    if (!isAuthenticated) return;
    try {
      // Fetch queue which has vitals trends included
      const response = await api.get('/patients/queue');
      const queueData = response.data.queue || [];
      
      setPatients(queueData);
      setQueuePatients(queueData);
      
      const detailsObj: any = {};
      queueData.forEach((p: any) => {
        detailsObj[p.id] = p;
      });
      setPatientDetailsData(detailsObj);

      try {
        const statsRes = await api.get('/analytics/overview');
        const waitRes = await api.get('/analytics/wait-times');
        
        let avgWaitTime = 0;
        if (waitRes.data && waitRes.data.length > 0) {
           avgWaitTime = Math.round(waitRes.data.reduce((acc: number, val: any) => acc + val.avg_wait, 0) / waitRes.data.length);
        }

        setStats({
          activePatients: statsRes.data.activePatients || 0,
          criticalCases: statsRes.data.criticalCases || 0,
          avgWait: avgWaitTime || 47 // fallback to 47 if 0
        });

        const alertsRes = await api.get('/alerts');
        const unacknowledged = alertsRes.data.filter((a: any) => !a.acknowledged);
        setAlertCount(unacknowledged.length);

        const critical = unacknowledged.find((a: any) => a.alert_type === 'critical');
        if (critical && critical.patient_id) {
          const critPatient = queueData.find((p: any) => p.id === critical.patient_id);
          if (critPatient) {
            setHasCriticalPatients(true);
            setCriticalPatientName(critPatient.name);
            setCriticalPatientLocation(critical.location || critPatient.bedNumber);
          }
        } else {
          setHasCriticalPatients(false);
        }
      } catch (e) {
        console.error("Failed to fetch auxiliary data", e);
      }

    } catch (error) {
      console.error("Failed to load patients", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPatients();
      socketService.connect();
      socketService.subscribeToQueue();
      socketService.subscribeToAlerts();

      socketService.onQueueUpdate(() => {
        loadPatients(); // reload when queue changes
      });

      socketService.onNewAlert(() => {
        loadPatients(); // update alerts
      });

      return () => {
        socketService.off('queue:update');
        socketService.off('alert:new');
      };
    }
  }, [isAuthenticated]);

  const handlePatientClick = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const selectedPatient = selectedPatientId ? patientDetailsData[selectedPatientId as keyof typeof patientDetailsData] || null : null;

  const renderContent = () => {
    switch (activeView) {
      case 'queue':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg mb-1">Doctor's Queue</h2>
              <div className="text-sm text-muted-foreground">Live patient tracking with AI triage intelligence</div>
            </div>
            <DoctorQueueTable patients={queuePatients} onPatientClick={handlePatientClick} />
          </div>
        );

      case 'intake':
        return <IntakePortal onIntakeComplete={loadPatients} />;

      case 'diagnostic':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg mb-1">AI Diagnostic Intelligence</h2>
              <div className="text-sm text-muted-foreground">Clinical decision support system</div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <AIDiagnosticCard />
              </div>
              <div className="space-y-6">
                <VitalSignsMonitor
                  patientId={selectedPatient?.id || "1"}
                  patientName={selectedPatient ? `${selectedPatient.name.charAt(0)}. ${selectedPatient.name.split(' ')[1]} (${selectedPatient.bedNumber})` : "No patient selected"}
                  heartRate={selectedPatient?.vitals?.hr || 0}
                  bloodPressure={selectedPatient?.vitals?.bp || "--/--"}
                  oxygenSat={selectedPatient?.vitals?.spo2 || 0}
                  respRate={selectedPatient?.vitals?.rr || 0}
                />
                <div className="bg-card rounded-lg border border-border p-4">
                  <h3 className="text-sm mb-3">Recent Labs</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Troponin I</span>
                      <span className="font-medium" style={{ color: 'var(--esi-2-emergent)' }}>0.8 ng/mL ↑</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BNP</span>
                      <span>420 pg/mL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">D-Dimer</span>
                      <span>0.3 µg/mL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WBC</span>
                      <span>11.2 K/µL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'reports':
        return <ReportsCenter />;

      case 'alerts':
        return <AlertManagement />;

      case 'settings':
        return (
          <SystemSettings 
            user={user} 
            theme={theme} 
            setTheme={setTheme} 
            language={language} 
            setLanguage={setLanguage}
            onSignOut={async () => {
              try {
                await api.post('/auth/logout');
              } catch (e) {
                console.error("Backend logout failed", e);
              }
              localStorage.removeItem('er_auth_token');
              localStorage.removeItem('er_user');
              window.location.reload();
            }}

            onProfileUpdate={async (profileData) => {
               // Optional: api call to update doctor profile
               console.log("Profile update triggered", profileData);
               try {
                 await api.put(`/patients/${user.id}`, profileData); // Ideally an endpoint for users
               } catch(e) {}
            }}
          />
        );
      case 'admin':
        return <AdminDashboard />;

      default:
        return (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg">Active Patients</h2>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="px-2 py-1 rounded text-xs text-white"
                        style={{
                          backgroundColor:
                            level === 1
                              ? 'var(--esi-1-critical)'
                              : level === 2
                              ? 'var(--esi-2-emergent)'
                              : level === 3
                              ? 'var(--esi-3-urgent)'
                              : level === 4
                              ? 'var(--esi-4-less-urgent)'
                              : 'var(--esi-5-non-urgent)',
                        }}
                      >
                        {patients.filter((p) => p.esiLevel === level).length}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {patients.map((patient) => (
                    <PatientCard key={patient.id} {...patient} onClick={handlePatientClick} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <VitalSignsMonitor
                  patientId="1"
                  patientName="J. Smith (A-1)"
                  heartRate={92}
                  bloodPressure="142/88"
                  oxygenSat={94}
                  respRate={22}
                />
                <VitalSignsMonitor
                  patientId="2"
                  patientName="M. Garcia (B-3)"
                  heartRate={105}
                  bloodPressure="128/82"
                  oxygenSat={98}
                  respRate={18}
                />
              </div>
            </div>

            <div className="col-span-4 space-y-6">
              <AIInsightsCard />
              <XRayViewer />
            </div>
          </div>
        );
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="size-full flex bg-background">
      <NavigationRail user={user} activeView={activeView} onViewChange={setActiveView} alertCount={alertCount} isAdmin={user?.role === 'admin'} />

      <div className="flex-1 flex flex-col">
        {hasCriticalPatients && (
          <CriticalAlertBanner patientName={criticalPatientName || "Unknown Patient"} location={criticalPatientLocation || "ER"} />
        )}

        <header className="h-20 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-lg">{t('emergency_department')}</h1>
            <div className="text-xs text-muted-foreground" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
              {t('hospital_name')} • {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {formatTime(currentTime)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle currentLanguage={language} onLanguageChange={setLanguage} />

            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <Users className="w-4 h-4" />
              <div className="text-sm">
                <span className="font-medium">{stats.activePatients}</span>
                <span className="text-muted-foreground">/24 {t('beds')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <Clock className="w-4 h-4" />
              <div className="text-sm">
                <span className="font-medium">{stats.avgWait} min</span>
                <span className="text-muted-foreground"> {t('avg_wait')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--esi-2-emergent)', color: 'white' }}>
              <AlertCircle className="w-4 h-4" />
              <div className="text-sm font-medium">{stats.criticalCases} {t('critical')}</div>
            </div>
          </div>
        </header>

        <div className="border-b border-border bg-card">
          <div className="px-6 flex gap-1" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-3 text-sm transition-colors border-b-2 ${
                activeView === 'dashboard'
                  ? 'border-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('overview_dashboard')}
            </button>
            <button
              onClick={() => setActiveView('queue')}
              className={`px-4 py-3 text-sm transition-colors border-b-2 ${
                activeView === 'queue'
                  ? 'border-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('doctor_queue')}
            </button>
            <button
              onClick={() => setActiveView('intake')}
              className={`px-4 py-3 text-sm transition-colors border-b-2 ${
                activeView === 'intake'
                  ? 'border-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('nurse_intake')}
            </button>
            <button
              onClick={() => setActiveView('diagnostic')}
              className={`px-4 py-3 text-sm transition-colors border-b-2 ${
                activeView === 'diagnostic'
                  ? 'border-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('ai_diagnostics')}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>

      <PatientDetailsModal patient={selectedPatient} onClose={() => setSelectedPatientId(null)} />
    </div>
  );
}
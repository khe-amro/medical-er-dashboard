import { useState, useEffect } from 'react';
import { Settings, User, Bell, Lock, Database, Zap, Globe, Palette, Shield, Cloud, CheckCircle } from 'lucide-react';
import api from '@/services/api';

interface SystemSettingsProps {
  user?: any;
  theme?: string;
  setTheme?: (theme: 'light' | 'dark' | 'auto') => void;
  language?: string;
  setLanguage?: (lang: 'en' | 'ar' | 'fr') => void;
  onSignOut?: () => void;
  onProfileUpdate?: (profileData: any) => void;
}

export function SystemSettings({ user, theme, setTheme, language, setLanguage, onSignOut, onProfileUpdate }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'integrations' | 'appearance'>('profile');
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamic Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    department: 'Emergency Medicine',
    role: user?.role === 'admin' ? 'Chief Resident' : 'Attending Physician',
    phone: '+1 (555) 123-4567'
  });

  const [notificationsForm, setNotificationsForm] = useState({
    critical_alerts: true,
    lab_results: true,
    patient_assignments: true,
    bed_availability: false,
    shift_reminders: true,
    system_maintenance: false,
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.get('/settings');
        const s = res.data;
        if (s) {
          setNotificationsForm({
            critical_alerts: s.critical_alerts,
            lab_results: s.lab_results,
            patient_assignments: s.patient_assignments,
            bed_availability: s.bed_availability,
            shift_reminders: s.shift_reminders,
            system_maintenance: s.system_maintenance,
            email_notifications: s.email_notifications,
            sms_notifications: s.sms_notifications,
            push_notifications: s.push_notifications
          });
          if (setTheme) setTheme(s.theme);
          if (setLanguage) setLanguage(s.language);
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setErrorMsg('');
      if (activeTab === 'profile') {
        const payload = {
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          phone: profileForm.phone
        };
        await api.put('/settings/profile', payload);
        if (onProfileUpdate) onProfileUpdate(payload);
      } else if (activeTab === 'notifications') {
        await api.put('/settings/notifications', notificationsForm);
      } else if (activeTab === 'security') {
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
           setErrorMsg('Please provide current and new password');
           return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
           setErrorMsg('Passwords do not match');
           return;
        }
        await api.put('/settings/password', {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        });
        setPasswordForm({currentPassword: '', newPassword: '', confirmPassword: ''});
      } else if (activeTab === 'appearance') {
        await api.put('/settings/preferences', { theme, language });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      console.error('Failed to save settings:', e);
      setErrorMsg(e.response?.data?.error || 'Failed to save settings');
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'User Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security & Privacy', icon: Shield },
    { id: 'integrations' as const, label: 'Integrations', icon: Zap },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">First Name</label>
            <input
              type="text"
              value={profileForm.firstName}
              onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Last Name</label>
            <input
              type="text"
              value={profileForm.lastName}
              onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Phone</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Department</label>
            <select 
              value={profileForm.department}
              onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option>Emergency Medicine</option>
              <option>Cardiology</option>
              <option>Trauma Surgery</option>
              <option>Internal Medicine</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2">Role</label>
            <select 
              value={profileForm.role}
              onChange={(e) => setProfileForm({...profileForm, role: e.target.value})}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option>Attending Physician</option>
              <option>Resident</option>
              <option>Nurse Practitioner</option>
              <option>Registered Nurse</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border mt-8">
        <button 
          onClick={onSignOut}
          className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          Sign Out of Account
        </button>
      </div>

      <div>
        <h3 className="text-lg mb-4">Credentials & Certifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="font-medium">Medical License</div>
              <div className="text-sm text-muted-foreground">MD-123456 • Expires: Dec 2027</div>
            </div>
            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="font-medium">DEA Certification</div>
              <div className="text-sm text-muted-foreground">DEA-789012 • Expires: Jun 2026</div>
            </div>
            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <div className="font-medium">BLS Certification</div>
              <div className="text-sm text-muted-foreground">Expires: Mar 2026</div>
            </div>
            <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">Expiring Soon</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg mb-4">Alert Preferences</h3>
        <div className="space-y-4">
          {[
            { id: 'critical_alerts', label: 'Critical Patient Alerts', description: 'ESI-1 patients and code alerts' },
            { id: 'lab_results', label: 'Lab Result Notifications', description: 'Critical values and completed results' },
            { id: 'patient_assignments', label: 'Patient Assignment Updates', description: 'New patient assignments and transfers' },
            { id: 'bed_availability', label: 'Bed Availability Alerts', description: 'ICU and floor bed availability' },
            { id: 'shift_reminders', label: 'Shift Reminders', description: 'Upcoming shift and handoff reminders' },
            { id: 'system_maintenance', label: 'System Maintenance Notices', description: 'Scheduled downtime and updates' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start justify-between p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <div className="font-medium mb-1">{item.label}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={(notificationsForm as any)[item.id]} 
                  onChange={(e) => setNotificationsForm({...notificationsForm, [item.id]: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg mb-4">Notification Channels</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'email_notifications', channel: 'Email' },
            { id: 'sms_notifications', channel: 'SMS' },
            { id: 'push_notifications', channel: 'Push (Mobile)' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{item.channel}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={(notificationsForm as any)[item.id]} 
                    onChange={(e) => setNotificationsForm({...notificationsForm, [item.id]: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg mb-4">Password & Authentication</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg mb-4">Two-Factor Authentication</h3>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium mb-1">2FA Status</div>
              <div className="text-sm text-muted-foreground">Add an extra layer of security to your account</div>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg mb-4">Session Management</h3>
        <div className="space-y-3">
          {[
            { device: 'Desktop - Chrome (Windows)', location: 'Hospital Network', lastActive: 'Active now', current: true },
            { device: 'Mobile - Safari (iOS)', location: 'Home Network', lastActive: '2 hours ago', current: false },
            { device: 'Tablet - Edge (iPad)', location: 'Hospital WiFi', lastActive: 'Yesterday', current: false },
          ].map((session, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  {session.device}
                  {session.current && <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">Current</span>}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {session.location} • {session.lastActive}
                </div>
              </div>
              {!session.current && (
                <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg mb-4">Connected Systems</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'Epic EMR', icon: Database, status: 'Connected', color: 'var(--esi-4-less-urgent)' },
            { name: 'PACS Imaging', icon: Database, status: 'Connected', color: 'var(--esi-4-less-urgent)' },
            { name: 'Lab System (LIS)', icon: Database, status: 'Connected', color: 'var(--esi-4-less-urgent)' },
            { name: 'Pharmacy System', icon: Database, status: 'Disconnected', color: 'var(--esi-1-critical)' },
            { name: 'Cloud Backup', icon: Cloud, status: 'Connected', color: 'var(--esi-4-less-urgent)' },
            { name: 'Analytics Platform', icon: Database, status: 'Connected', color: 'var(--esi-4-less-urgent)' },
          ].map((integration, idx) => (
            <div key={idx} className="p-4 bg-muted rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded">
                    <integration.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{integration.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: integration.color }} />
                      <span className="text-xs text-muted-foreground">{integration.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full px-3 py-1 text-sm border border-border rounded hover:bg-background transition-colors">
                Configure
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg mb-4">API Keys & Webhooks</h3>
        <div className="space-y-3">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Production API Key</div>
              <button className="text-sm text-primary hover:underline">Regenerate</button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-background rounded text-sm font-mono">
                sk_prod_••••••••••••••••••••1234
              </code>
              <button className="px-3 py-2 border border-border rounded hover:bg-background transition-colors text-sm">
                Copy
              </button>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Development API Key</div>
              <button className="text-sm text-primary hover:underline">Regenerate</button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-background rounded text-sm font-mono">
                sk_dev_••••••••••••••••••••5678
              </code>
              <button className="px-3 py-2 border border-border rounded hover:bg-background transition-colors text-sm">
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'light', name: 'Light' },
            { id: 'dark', name: 'Dark' },
            { id: 'auto', name: 'Auto' },
          ].map((t) => (
            <div
              key={t.id}
              onClick={() => setTheme?.(t.id as 'light' | 'dark' | 'auto')}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                theme === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-center font-medium">{t.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg mb-4">Display Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Font Size</label>
            <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Small</option>
              <option selected>Medium (Default)</option>
              <option>Large</option>
              <option>Extra Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Dashboard Density</label>
            <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Compact</option>
              <option selected>Comfortable</option>
              <option>Spacious</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="font-medium">High Contrast Mode</div>
              <div className="text-sm text-muted-foreground">Increase contrast for better visibility</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="font-medium">Reduce Motion</div>
              <div className="text-sm text-muted-foreground">Minimize animations and transitions</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg mb-4">Language & Region</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Language</label>
            <select 
              value={language}
              onChange={(e) => setLanguage?.(e.target.value as 'en' | 'ar' | 'fr')}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="en">English (US)</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2">Time Zone</label>
            <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Eastern Time (ET)</option>
              <option>Central Time (CT)</option>
              <option>Mountain Time (MT)</option>
              <option>Pacific Time (PT)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">System Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure your preferences and system integrations</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 shrink-0">
          <div className="bg-card rounded-lg border border-border p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-card rounded-lg border border-border p-6">
          {activeTab === 'profile' && renderProfileSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'integrations' && renderIntegrationsSettings()}
          {activeTab === 'appearance' && renderAppearanceSettings()}

          {saved && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span>Settings saved successfully!</span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

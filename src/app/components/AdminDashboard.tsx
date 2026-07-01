import { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, TrendingUp, Shield, Database, AlertTriangle, Star, Edit, Trash2, Eye } from 'lucide-react';
import api from '@/services/api';
import { AdminPatientAnalytics } from './AdminPatientAnalytics';
import { AdminAIAnalytics } from './AdminAIAnalytics';
import { AdminSystemMonitor } from './AdminSystemMonitor';

interface StaffMember {
  id: string;
  name: string;
  role: 'doctor' | 'nurse' | 'admin';
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'on-leave';
  rating: number;
  patientsHandled: number;
  shiftsCompleted: number;
  joinDate: string;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'patients' | 'analytics' | 'system'>('overview');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalPatients: 0, activeStaff: 0, criticalCases: 0, activePatients: 0 });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  // FETCH REAL DATA FROM API
  useEffect(() => {
    async function loadStaff() {
      try {
        const [staffRes, statsRes, alertsRes] = await Promise.all([
          api.get('/staff'),
          api.get('/analytics/overview'),
          api.get('/alerts')
        ]);
        
        // Map database fields to our frontend interfaces
        const formattedStaff = staffRes.data.map((user: any) => ({
          id: user.id,
          name: user.full_name,
          role: user.role,
          department: user.department || 'Unassigned',
          email: user.email,
          phone: user.phone || 'N/A',
          status: user.status,
          rating: user.rating || 0,
          patientsHandled: user.patients_handled || 0,
          shiftsCompleted: user.shifts_completed || 0,
          joinDate: new Date(user.created_at).toISOString().split('T')[0]
        }));
        setStaffMembers(formattedStaff);
        setStats(statsRes.data);
        setRecentAlerts(alertsRes.data.slice(0, 5)); // top 5
      } catch (error) {
        console.error("Failed to load admin data from database", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStaff();
  }, []);

  const handleDeleteStaff = async (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      try {
        await api.delete(`/staff/${id}`);
        setStaffMembers(prev => prev.filter(s => s.id !== id));
      } catch (e) {
        console.error('Failed to delete staff', e);
        alert('Failed to delete staff member. Check permissions.');
      }
    }
  };

  const handleEditStaff = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setShowAddStaffModal(true);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <h3 className="text-xl">System Overview</h3>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Users className="w-6 h-6" style={{ color: 'var(--esi-5-non-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalPatients}</div>
          <div className="text-sm text-muted-foreground">Total Patients (24h)</div>
          <div className="text-xs text-green-600 mt-2">+12% from yesterday</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Activity className="w-6 h-6" style={{ color: 'var(--esi-4-less-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.activeStaff}</div>
          <div className="text-sm text-muted-foreground">Active Staff</div>
          <div className="text-xs text-muted-foreground mt-2">{staffMembers.filter(s=>s.role==='doctor').length} Doctors, {staffMembers.filter(s=>s.role==='nurse').length} Nurses</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(234, 88, 12, 0.1)' }}>
              <AlertTriangle className="w-6 h-6" style={{ color: 'var(--esi-2-emergent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.criticalCases}</div>
          <div className="text-sm text-muted-foreground">Critical Cases</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <TrendingUp className="w-6 h-6" style={{ color: 'var(--esi-3-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.activePatients > 0 ? Math.round((stats.activePatients / 24) * 100) : 0}%</div>
          <div className="text-sm text-muted-foreground">Bed Capacity</div>
          <div className="text-xs text-green-600 mt-2">{stats.activePatients}/24 Beds</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium mb-4">Recent System Alerts</h4>
          <div className="space-y-3">
            {recentAlerts.length > 0 ? recentAlerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: alert.alert_type === 'critical' ? 'var(--esi-1-critical)' : 'var(--esi-3-urgent)' }} />
                <div className="flex-1">
                  <div className="text-sm">{alert.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            )) : <div className="text-sm text-muted-foreground">No recent alerts.</div>}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium mb-4">Top Performing Staff</h4>
          <div className="space-y-3">
            {staffMembers.slice(0, 3).sort((a, b) => b.rating - a.rating).map((staff, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-medium">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{staff.name}</div>
                    <div className="text-xs text-muted-foreground">{staff.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{staff.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStaffManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl">Staff Management</h3>
        <button
          onClick={() => {
            setSelectedStaff(null);
            setShowAddStaffModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-2xl font-bold">{staffMembers.filter(s => s.role === 'doctor').length}</div>
          <div className="text-sm text-muted-foreground">Doctors</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-2xl font-bold">{staffMembers.filter(s => s.role === 'nurse').length}</div>
          <div className="text-sm text-muted-foreground">Nurses</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-2xl font-bold">{staffMembers.filter(s => s.status === 'active').length}</div>
          <div className="text-sm text-muted-foreground">Active Staff</div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-sm">Name</th>
              <th className="text-left p-4 text-sm">Role</th>
              <th className="text-left p-4 text-sm">Department</th>
              <th className="text-left p-4 text-sm">Status</th>
              <th className="text-left p-4 text-sm">Rating</th>
              <th className="text-left p-4 text-sm">Patients</th>
              <th className="text-left p-4 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staffMembers.map((staff) => (
              <tr key={staff.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-medium">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-xs text-muted-foreground">{staff.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: staff.role === 'doctor' ? 'var(--esi-5-non-urgent)' : 'var(--esi-4-less-urgent)' }}>
                    {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                  </span>
                </td>
                <td className="p-4 text-sm">{staff.department}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    staff.status === 'active' ? 'bg-green-100 text-green-700' :
                    staff.status === 'on-leave' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {staff.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{staff.rating}</span>
                  </div>
                </td>
                <td className="p-4 text-sm">{staff.patientsHandled}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditStaff(staff)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alert(`Viewing details for ${staff.name}`)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
              <Shield className="w-6 h-6" style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <h2 className="text-2xl">Admin Dashboard</h2>
              <p className="text-sm text-muted-foreground">Complete system management and oversight</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">Admin User</div>
            <div className="text-xs text-muted-foreground">Last login: Today, 8:00 AM</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
            A
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-card rounded-t-lg">
        <div className="px-6 flex gap-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'staff', label: 'Staff Management' },
            { id: 'patients', label: 'Patient Analytics' },
            { id: 'analytics', label: 'AI Analytics' },
            { id: 'system', label: 'System Monitor' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-purple-600 font-medium text-purple-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'staff' && renderStaffManagement()}
        {activeTab === 'patients' && <AdminPatientAnalytics />}
        {activeTab === 'analytics' && <AdminAIAnalytics />}
        {activeTab === 'system' && <AdminSystemMonitor />}
      </div>

      {showAddStaffModal && (
        <AddStaffModal
          staff={selectedStaff}
          onClose={() => {
            setShowAddStaffModal(false);
            setSelectedStaff(null);
          }}
          onSave={async (staffData) => {
            try {
              if (selectedStaff) {
                // Update existing
                const response = await api.put(`/staff/${selectedStaff.id}`, {
                  full_name: staffData.name,
                  role: staffData.role,
                  department: staffData.department,
                  phone: staffData.phone,
                  status: staffData.status
                });
                const updated = response.data;
                setStaffMembers(prev => prev.map(s => s.id === updated.id ? { ...staffData, id: updated.id } : s));
              } else {
                // Create new
                const response = await api.post('/staff', {
                  email: staffData.email,
                  full_name: staffData.name,
                  role: staffData.role,
                  department: staffData.department,
                  phone: staffData.phone,
                  status: staffData.status
                });
                const created = response.data;
                setStaffMembers(prev => [{ ...staffData, id: created.id }, ...prev]);
              }
            } catch (err) {
              console.error('Failed to save staff', err);
              alert('Failed to save staff member. Ensure you are logged in as admin and email is unique.');
            }
            setShowAddStaffModal(false);
            setSelectedStaff(null);
          }}
        />
      )}
    </div>
  );
}

function AddStaffModal({ staff, onClose, onSave }: {
  staff: StaffMember | null;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
}) {
  const [formData, setFormData] = useState<Partial<StaffMember>>(staff || {
    name: '',
    role: 'doctor',
    department: '',
    email: '',
    phone: '',
    status: 'active',
    rating: 0,
    patientsHandled: 0,
    shiftsCompleted: 0,
    joinDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as StaffMember);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-2xl w-full max-w-2xl m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border">
          <h3 className="text-xl font-medium">{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Role *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Department *</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Department</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Trauma Surgery">Trauma Surgery</option>
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              {staff ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

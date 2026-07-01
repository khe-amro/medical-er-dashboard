import { Server, Database, Wifi, HardDrive, Cpu, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminSystemMonitor() {
  const systemMetrics = [
    { time: '10:00', cpu: 45, memory: 62, network: 38, database: 52 },
    { time: '10:15', cpu: 52, memory: 65, network: 42, database: 58 },
    { time: '10:30', cpu: 48, memory: 68, network: 45, database: 55 },
    { time: '10:45', cpu: 61, memory: 71, network: 51, database: 62 },
    { time: '11:00', cpu: 55, memory: 69, network: 48, database: 59 },
    { time: '11:15', cpu: 58, memory: 72, network: 53, database: 64 },
  ];

  const apiMetrics = [
    { endpoint: '/api/patients', requests: 1247, avgTime: 145, errors: 3, uptime: 99.9 },
    { endpoint: '/api/vitals', requests: 3421, avgTime: 89, errors: 1, uptime: 99.98 },
    { endpoint: '/api/triage', requests: 892, avgTime: 234, errors: 8, uptime: 99.1 },
    { endpoint: '/api/diagnostics', requests: 567, avgTime: 512, errors: 2, uptime: 99.6 },
  ];

  const systemHealth = [
    {
      service: 'Web Server',
      status: 'healthy',
      uptime: '99.98%',
      lastCheck: '1 min ago',
      icon: Server,
    },
    {
      service: 'Database Primary',
      status: 'healthy',
      uptime: '99.95%',
      lastCheck: '1 min ago',
      icon: Database,
    },
    {
      service: 'Database Replica',
      status: 'warning',
      uptime: '98.2%',
      lastCheck: '2 min ago',
      icon: Database,
    },
    {
      service: 'API Gateway',
      status: 'healthy',
      uptime: '99.99%',
      lastCheck: '30 sec ago',
      icon: Wifi,
    },
    {
      service: 'Storage Service',
      status: 'healthy',
      uptime: '100%',
      lastCheck: '1 min ago',
      icon: HardDrive,
    },
    {
      service: 'AI Processing',
      status: 'healthy',
      uptime: '99.7%',
      lastCheck: '45 sec ago',
      icon: Cpu,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl">System Health & Monitoring</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
            View Logs
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Run Diagnostics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Activity className="w-6 h-6" style={{ color: 'var(--esi-4-less-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">99.8%</div>
          <div className="text-sm text-muted-foreground">System Uptime</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Cpu className="w-6 h-6" style={{ color: 'var(--esi-5-non-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">58%</div>
          <div className="text-sm text-muted-foreground">CPU Usage</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <Database className="w-6 h-6" style={{ color: 'var(--esi-3-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">72%</div>
          <div className="text-sm text-muted-foreground">Memory Usage</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
              <AlertTriangle className="w-6 h-6" style={{ color: 'var(--esi-1-critical)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">2</div>
          <div className="text-sm text-muted-foreground">Active Alerts</div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h4 className="font-medium mb-4">Real-Time Resource Usage</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={systemMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="time" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
            <Area type="monotone" dataKey="cpu" stackId="1" stroke="var(--esi-5-non-urgent)" fill="var(--esi-5-non-urgent)" fillOpacity={0.6} name="CPU %" />
            <Area type="monotone" dataKey="memory" stackId="2" stroke="var(--esi-3-urgent)" fill="var(--esi-3-urgent)" fillOpacity={0.6} name="Memory %" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium mb-4">Service Health Status</h4>
          <div className="space-y-3">
            {systemHealth.map((service, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded">
                    <service.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{service.service}</div>
                    <div className="text-xs text-muted-foreground">Uptime: {service.uptime} • {service.lastCheck}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {service.status === 'healthy' ? (
                    <CheckCircle className="w-5 h-5" style={{ color: 'var(--esi-4-less-urgent)' }} />
                  ) : (
                    <AlertTriangle className="w-5 h-5" style={{ color: 'var(--esi-3-urgent)' }} />
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${
                    service.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium mb-4">API Performance Metrics</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-xs">Endpoint</th>
                  <th className="text-left p-3 text-xs">Requests</th>
                  <th className="text-left p-3 text-xs">Avg Time</th>
                  <th className="text-left p-3 text-xs">Errors</th>
                  <th className="text-left p-3 text-xs">Uptime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apiMetrics.map((api, idx) => (
                  <tr key={idx}>
                    <td className="p-3 text-xs font-mono">{api.endpoint}</td>
                    <td className="p-3 text-xs">{api.requests.toLocaleString()}</td>
                    <td className="p-3 text-xs">{api.avgTime}ms</td>
                    <td className="p-3 text-xs">
                      <span className={api.errors > 5 ? 'text-red-600' : 'text-muted-foreground'}>
                        {api.errors}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      <span className={api.uptime >= 99.5 ? 'text-green-600' : 'text-yellow-600'}>
                        {api.uptime}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h4 className="font-medium mb-4">Recent System Events</h4>
        <div className="space-y-2">
          {[
            { time: '11:15 AM', event: 'Database backup completed successfully', type: 'success' },
            { time: '10:58 AM', event: 'High memory usage detected on replica server', type: 'warning' },
            { time: '10:42 AM', event: 'SSL certificate renewed for *.hospital.com', type: 'info' },
            { time: '10:30 AM', event: 'Scheduled maintenance window started', type: 'info' },
            { time: '09:15 AM', event: 'API rate limit exceeded for client 192.168.1.42', type: 'warning' },
          ].map((log, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 text-sm hover:bg-muted rounded transition-colors">
              <div className={`w-2 h-2 rounded-full ${
                log.type === 'success' ? 'bg-green-500' :
                log.type === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`} />
              <div className="text-xs text-muted-foreground w-20">{log.time}</div>
              <div className="flex-1">{log.event}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

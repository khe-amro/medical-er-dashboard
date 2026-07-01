import { useState, useEffect } from 'react';
import { FileText, Download, Filter, Calendar, Search, Eye, Printer, Share2 } from 'lucide-react';
import api from '@/services/api';

interface Report {
  id: string;
  name: string;
  type: 'shift' | 'clinical' | 'compliance' | 'performance';
  date: string;
  generatedBy: string;
  status: 'complete' | 'generating' | 'scheduled';
  size: string;
}

export function ReportsCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>([]);

  const loadReports = async () => {
    try {
      const response = await api.get('/reports');
      const formatted = response.data.map((r: any) => ({
        id: r.id,
        name: r.report_name,
        type: r.report_type,
        date: new Date(r.generated_at).toLocaleString(),
        generatedBy: r.generated_by_name || 'System',
        status: r.status,
        size: r.file_size ? `${(r.file_size / 1024).toFixed(1)} MB` : '-'
      }));
      setReports(formatted);
    } catch (e) {
      console.error('Failed to load reports', e);
    }
  };

  useEffect(() => {
    loadReports();
    // Poll for updates if any report is generating
    const interval = setInterval(() => {
      setReports(currentReports => {
        if (currentReports.some(r => r.status === 'generating')) {
          loadReports();
        }
        return currentReports;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async (templateName: string) => {
    try {
      let typeStr = 'performance';
      if (templateName.includes('Shift')) typeStr = 'shift';
      if (templateName.includes('Quality')) typeStr = 'clinical';
      if (templateName.includes('Compliance')) typeStr = 'compliance';

      await api.post('/reports/generate', {
        report_type: typeStr,
        report_name: `${templateName} - ${new Date().toLocaleDateString()}`
      });
      loadReports();
    } catch (e) {
      console.error('Failed to generate report', e);
      alert('Failed to generate report');
    }
  };

  const handleViewReport = (reportId: string) => {
    alert(`Opening report viewer for report #${reportId}`);
    console.log('Viewing report:', reportId);
  };

  const handleDownloadReport = (reportId: string, reportName: string) => {
    alert(`Downloading: ${reportName}`);
    console.log('Downloading report:', reportId);
  };

  const handlePrintReport = (reportId: string) => {
    alert('Opening print dialog...');
    console.log('Printing report:', reportId);
  };

  const handleShareReport = (reportId: string) => {
    alert('Opening share dialog...');
    console.log('Sharing report:', reportId);
  };

  const reportTemplates = [
    { name: 'Shift Handoff Report', icon: FileText, description: 'Comprehensive shift summary for handoff' },
    { name: 'Patient Volume Analysis', icon: FileText, description: 'Detailed patient flow and census data' },
    { name: 'Quality Metrics Report', icon: FileText, description: 'Clinical quality indicators and benchmarks' },
    { name: 'Regulatory Compliance', icon: FileText, description: 'HIPAA, CMS, and state compliance documentation' },
  ];

  const typeColors = {
    shift: 'var(--esi-5-non-urgent)',
    clinical: 'var(--esi-4-less-urgent)',
    compliance: 'var(--esi-3-urgent)',
    performance: 'var(--esi-2-emergent)',
  };

  const typeLabels = {
    shift: 'Shift Summary',
    clinical: 'Clinical Report',
    compliance: 'Compliance',
    performance: 'Performance',
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">Reports Center</h2>
        <p className="text-sm text-muted-foreground mt-1">Generate and manage clinical and operational reports</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {reportTemplates.map((template, idx) => (
          <div key={idx} className="bg-card rounded-lg border border-border p-4 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <template.icon className="w-5 h-5 text-primary" />
              </div>
              <button
                onClick={() => handleGenerateReport(template.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:opacity-90"
              >
                Generate
              </button>
            </div>
            <div className="font-medium text-sm mb-1">{template.name}</div>
            <div className="text-xs text-muted-foreground">{template.description}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Types</option>
                <option value="shift">Shift Summary</option>
                <option value="clinical">Clinical</option>
                <option value="compliance">Compliance</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Date Range</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Report Name</th>
                <th className="text-left p-4 text-sm font-medium">Type</th>
                <th className="text-left p-4 text-sm font-medium">Generated Date</th>
                <th className="text-left p-4 text-sm font-medium">Generated By</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Size</th>
                <th className="text-left p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{report.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: typeColors[report.type] }}>
                      {typeLabels[report.type]}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{report.date}</td>
                  <td className="p-4 text-sm">{report.generatedBy}</td>
                  <td className="p-4">
                    {report.status === 'complete' ? (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Complete</span>
                    ) : report.status === 'generating' ? (
                      <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">Generating...</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">Scheduled</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{report.size}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewReport(report.id)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(report.id, report.name)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="Download"
                        disabled={report.status === 'generating'}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintReport(report.id)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="Print"
                        disabled={report.status === 'generating'}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShareReport(report.id)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="Share"
                        disabled={report.status === 'generating'}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No reports found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

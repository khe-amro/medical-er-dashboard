import { Brain, TrendingUp, AlertCircle, CheckCircle, Target, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export function AdminAIAnalytics() {
  const aiPredictions = [
    { time: '00:00', predicted: 12, actual: 10, accuracy: 83 },
    { time: '04:00', predicted: 8, actual: 9, accuracy: 89 },
    { time: '08:00', predicted: 18, actual: 17, accuracy: 94 },
    { time: '12:00', predicted: 24, actual: 23, accuracy: 96 },
    { time: '16:00', predicted: 28, actual: 30, accuracy: 93 },
    { time: '20:00', predicted: 15, actual: 14, accuracy: 93 },
  ];

  const modelPerformance = [
    { metric: 'Triage Accuracy', score: 94 },
    { metric: 'Sepsis Detection', score: 87 },
    { metric: 'Readmission Risk', score: 82 },
    { metric: 'Resource Prediction', score: 91 },
    { metric: 'Wait Time Forecast', score: 89 },
  ];

  const aiInsights = [
    {
      type: 'success',
      title: 'High Accuracy Maintained',
      description: 'AI triage model achieved 94% accuracy this week, exceeding 90% target.',
      impact: 'High',
    },
    {
      type: 'warning',
      title: 'Model Drift Detected',
      description: 'Sepsis detection model showing 3% accuracy decline. Retraining recommended.',
      impact: 'Medium',
    },
    {
      type: 'info',
      title: 'New Pattern Identified',
      description: 'AI detected correlation between wait times and patient satisfaction scores.',
      impact: 'Medium',
    },
    {
      type: 'success',
      title: 'Resource Optimization',
      description: 'AI recommendations reduced bed allocation delays by 18%.',
      impact: 'High',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl">AI Analytics & Machine Learning</h3>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          Retrain Models
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">7</div>
          <div className="text-sm text-muted-foreground">Active AI Models</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Target className="w-6 h-6" style={{ color: 'var(--esi-4-less-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">92%</div>
          <div className="text-sm text-muted-foreground">Overall Accuracy</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Zap className="w-6 h-6" style={{ color: 'var(--esi-5-non-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">12.4k</div>
          <div className="text-sm text-muted-foreground">Predictions Today</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <TrendingUp className="w-6 h-6" style={{ color: 'var(--esi-3-urgent)' }} />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">+15%</div>
          <div className="text-sm text-muted-foreground">Efficiency Gain</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium mb-4">Patient Volume Prediction vs Actual</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={aiPredictions}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="time" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
              <Line type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2} name="AI Predicted" />
              <Line type="monotone" dataKey="actual" stroke="var(--esi-4-less-urgent)" strokeWidth={2} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium mb-4">AI Model Performance Scores</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={modelPerformance}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" stroke="var(--muted-foreground)" />
              <PolarRadiusAxis stroke="var(--muted-foreground)" />
              <Radar name="Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h4 className="font-medium mb-4">AI Insights & Recommendations</h4>
        <div className="space-y-3">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="p-2 rounded-lg" style={{
                backgroundColor: insight.type === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                               insight.type === 'warning' ? 'rgba(234, 88, 12, 0.1)' :
                               'rgba(59, 130, 246, 0.1)'
              }}>
                {insight.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" style={{ color: 'var(--esi-4-less-urgent)' }} />
                ) : insight.type === 'warning' ? (
                  <AlertCircle className="w-5 h-5" style={{ color: 'var(--esi-2-emergent)' }} />
                ) : (
                  <Brain className="w-5 h-5" style={{ color: 'var(--esi-5-non-urgent)' }} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-medium">{insight.title}</div>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    insight.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {insight.impact} Impact
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{insight.description}</div>
              </div>
              <button className="px-3 py-1 text-sm border border-border rounded hover:bg-background transition-colors">
                Details
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h4 className="font-medium mb-4">Model Training History</h4>
        <div className="space-y-3">
          {[
            { model: 'Triage Classification', lastTrained: '2026-04-28', nextScheduled: '2026-05-28', status: 'Active' },
            { model: 'Sepsis Risk Prediction', lastTrained: '2026-04-15', nextScheduled: '2026-05-15', status: 'Needs Retraining' },
            { model: 'Resource Optimization', lastTrained: '2026-04-30', nextScheduled: '2026-05-30', status: 'Active' },
          ].map((model, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <div className="font-medium">{model.model}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Last trained: {model.lastTrained} • Next: {model.nextScheduled}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  model.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {model.status}
                </span>
                <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">
                  Retrain
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

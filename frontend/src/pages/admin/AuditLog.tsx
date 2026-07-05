import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  PlusCircle, 
  CheckCircle2, 
  FileText, 
  RefreshCw,
  Inbox,
  Filter,
  Sparkles,
  Download,
  Loader2
} from 'lucide-react';

interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

const ACTION_COLORS: Record<string, string> = {
  POLICY_CREATED:       'badge-info',
  POLICY_ACCEPTED:      'badge-success',
  TASK_CREATED:         'badge-info',
  TASK_STATUS_UPDATED:  'badge-warning',
};

const ACTION_ICONS: Record<string, React.ComponentType<any>> = {
  POLICY_CREATED:       FileText,
  POLICY_ACCEPTED:      CheckCircle2,
  TASK_CREATED:         PlusCircle,
  TASK_STATUS_UPDATED:  RefreshCw,
};

export default function AuditPage() {
  const [logs, setLogs]       = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');

  // AI report states
  const [report, setReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);

  useEffect(() => {
    api.get('/api/audit/logs')
      .then(r => setLogs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/api/audit/report');
      setReport(res.data.reportContent);
      setShowReportCard(true);
    } catch {
      alert('Failed to generate compliance report');
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance_report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const actionTypes = ['ALL', ...Array.from(new Set(logs.map(l => l.action)))];
  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={styles.heading}>Audit Log</h1>
          <p style={{ ...styles.sub, margin: 0 }}>Complete immutable record of all compliance actions</p>
        </div>
        <button
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '13px' }}
          onClick={generateReport}
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 size={16} className="spinner" />
              <span>Generating report...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate AI Report</span>
            </>
          )}
        </button>
      </div>

      {showReportCard && report && (
        <div className="card glass-panel" style={{ marginBottom: '24px', padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0, display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
              <Sparkles size={16} />
              <span>Compliance Report</span>
            </h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={downloadReport}
              >
                <Download size={14} />
                <span>Download as TXT</span>
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => setShowReportCard(false)}
              >
                Close
              </button>
            </div>
          </div>
          <div style={{ 
            fontFamily: 'Consolas, Monaco, monospace', 
            fontSize: '13px', 
            lineHeight: 1.6, 
            whiteSpace: 'pre-wrap', 
            background: 'var(--bg-secondary)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            color: 'var(--text-primary)'
          }}>
            {report}
          </div>
        </div>
      )}

      <div style={styles.toolbar}>
        <div style={styles.filterRow}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <label style={styles.filterLabel}>Filter by action:</label>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={styles.select}
          >
            {actionTypes.map(a => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <span style={styles.count}>
          {loading ? '' : `${filtered.length} entries`}
        </span>
      </div>

      <div className="card" style={{ padding: '24px 28px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <Inbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No audit entries yet.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
              Actions like creating policies or accepting them will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={styles.tableHeader}>
              <span style={{ flex: '0 0 180px' }}>Time</span>
              <span style={{ flex: '0 0 180px' }}>Action</span>
              <span style={{ flex: '0 0 120px' }}>Entity</span>
              <span style={{ flex: 1 }}>Details</span>
            </div>
            {filtered.map(log => {
              const IconComponent = ACTION_ICONS[log.action] || FileText;
              return (
                <div key={log.id} style={styles.logRow}>
                  <span style={{ ...styles.cell, flex: '0 0 180px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span style={{ flex: '0 0 180px', display: 'flex' }}>
                    <span className={`badge ${ACTION_COLORS[log.action] || 'badge-info'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <IconComponent size={12} />
                      <span>{log.action.replace(/_/g, ' ')}</span>
                    </span>
                  </span>
                  <span style={{ ...styles.cell, flex: '0 0 120px', color: 'var(--text-secondary)' }}>
                    {log.entityType}
                  </span>
                  <span style={{ ...styles.cell, flex: 1 }}>{log.details}</span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading:     { fontSize: '26px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.02em' },
  sub:         { color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' },
  toolbar:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  filterRow:   { display: 'flex', alignItems: 'center', gap: '10px' },
  filterLabel: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  select:      { width: 'auto', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' },
  count:       { color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 },
  tableHeader: { display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  logRow:      { display: 'flex', gap: '12px', padding: '16px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center', transition: 'background-color 0.2s' },
  cell:        { fontSize: '13px', color: 'var(--text-primary)' },
  emptyState:  { textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }
};

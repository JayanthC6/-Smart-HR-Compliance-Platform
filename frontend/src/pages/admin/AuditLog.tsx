import { useEffect, useState } from 'react';
import api from '../../api/axios';

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

const ACTION_ICONS: Record<string, string> = {
  POLICY_CREATED:       '📝',
  POLICY_ACCEPTED:      '✅',
  TASK_CREATED:         '📋',
  TASK_STATUS_UPDATED:  '🔄',
};

export default function AuditPage() {
  const [logs, setLogs]       = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('ALL');

  useEffect(() => {
    api.get('/api/audit/logs')
      .then(r => setLogs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const actionTypes = ['ALL', ...Array.from(new Set(logs.map(l => l.action)))];
  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action === filter);

  return (
    <div>
      <h1 style={styles.heading}>Audit Log</h1>
      <p style={styles.sub}>Complete immutable record of all compliance actions</p>

      <div style={styles.toolbar}>
        <div style={styles.filterRow}>
          <label style={styles.filterLabel}>Filter by action:</label>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={styles.select}
          >
            {actionTypes.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <span style={styles.count}>
          {loading ? '' : `${filtered.length} entries`}
        </span>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>📭</p>
            <p style={{ color: 'var(--text-muted)' }}>No audit entries yet.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
              Actions like creating policies or accepting them will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div style={styles.tableHeader}>
              <span style={{ flex: '0 0 160px' }}>Time</span>
              <span style={{ flex: '0 0 160px' }}>Action</span>
              <span style={{ flex: '0 0 120px' }}>Entity</span>
              <span style={{ flex: 1 }}>Details</span>
            </div>
            {filtered.map(log => (
              <div key={log.id} style={styles.logRow}>
                <span style={{ ...styles.cell, flex: '0 0 160px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span style={{ flex: '0 0 160px' }}>
                  <span className={`badge ${ACTION_COLORS[log.action] || 'badge-info'}`}>
                    {ACTION_ICONS[log.action] || '•'} {log.action.replace(/_/g, ' ')}
                  </span>
                </span>
                <span style={{ ...styles.cell, flex: '0 0 120px', color: 'var(--text-secondary)' }}>
                  {log.entityType}
                </span>
                <span style={{ ...styles.cell, flex: 1 }}>{log.details}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading:     { fontSize: '26px', fontWeight: 700, marginBottom: '4px' },
  sub:         { color: 'var(--text-secondary)', marginBottom: '24px' },
  toolbar:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  filterRow:   { display: 'flex', alignItems: 'center', gap: '10px' },
  filterLabel: { color: 'var(--text-secondary)', fontSize: '13px' },
  select:      { width: 'auto', padding: '6px 12px' },
  count:       { color: 'var(--text-muted)', fontSize: '13px' },
  tableHeader: { display: 'flex', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  logRow:      { display: 'flex', gap: '8px', padding: '14px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' },
  cell:        { fontSize: '13px', color: 'var(--text-primary)' },
};

import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/policies').then(r => { setPolicies(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={styles.heading}>Dashboard</h1>
      <p style={styles.sub}>Overview of your compliance workspace</p>
      <div style={styles.grid}>
        <div className="card">
          <p style={styles.statLabel}>Total Policies</p>
          <p style={styles.statValue}>{loading ? '...' : policies.length}</p>
        </div>
        <div className="card">
          <p style={styles.statLabel}>Platform</p>
          <p style={styles.statValue}>Active</p>
        </div>
        <div className="card">
          <p style={styles.statLabel}>AI Assistant</p>
          <p style={styles.statValue}>Online</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: '24px' }}>
        <h2 style={styles.sectionTitle}>Recent Policies</h2>
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : policies.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No policies yet. Go to Policies to create one.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Version</th>
                <th style={styles.th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {(policies as any[]).map((p: any) => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.title}</td>
                  <td style={styles.td}><span className="badge badge-info">v{p.version}</span></td>
                  <td style={styles.td}>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '24px', fontWeight: 700, marginBottom: '4px' },
  sub: { color: 'var(--text-secondary)', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  statLabel: { color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: 700, color: 'var(--accent)' },
  sectionTitle: { fontSize: '16px', fontWeight: 600, marginBottom: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)', fontWeight: 500 },
  td: { padding: '12px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '14px' },
};
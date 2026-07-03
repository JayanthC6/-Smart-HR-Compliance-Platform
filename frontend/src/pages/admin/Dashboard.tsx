import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [policies, setPolicies]   = useState<any[]>([]);
  const [tasks, setTasks]         = useState<any[]>([]);
  const [consents, setConsents]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/policies'),
      api.get('/api/onboarding/tasks/my'),
      api.get('/api/consents/my'),
    ])
      .then(([p, t, c]) => {
        setPolicies(p.data);
        setTasks(t.data);
        setConsents(c.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingTasks   = tasks.filter(t => t.status === 'PENDING').length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

  const statCards = [
    { label: 'Total Policies',   value: policies.length, icon: '📋', color: 'var(--accent)'   },
    { label: 'Policies Accepted',value: consents.length, icon: '✅', color: 'var(--success)'  },
    { label: 'Pending Tasks',    value: pendingTasks,    icon: '⏳', color: 'var(--warning)'  },
    { label: 'Tasks Completed',  value: completedTasks,  icon: '🏆', color: 'var(--success)'  },
  ];

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Dashboard</h1>
          <p style={styles.sub}>Welcome back, <strong>{user?.fullName}</strong> — here's your compliance overview</p>
        </div>
        <span style={styles.roleBadge}>{user?.role}</span>
      </div>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        {statCards.map(card => (
          <div key={card.label} className="card card-hover" style={styles.statCard}>
            <div style={styles.statIcon}>{card.icon}</div>
            <p style={styles.statValue(card.color)}>
              {loading ? <span className="spinner" /> : card.value}
            </p>
            <p style={styles.statLabel}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={styles.grid2}>
        {/* Recent policies */}
        <div className="card">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Policies</h2>
            <Link to="/admin/policies" style={styles.viewAll}>View all →</Link>
          </div>
          {loading ? (
            <p style={styles.muted}>Loading...</p>
          ) : policies.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '24px' }}>📄</p>
              <p style={styles.muted}>No policies yet.</p>
              <Link to="/admin/policies" style={styles.emptyAction}>Create your first policy →</Link>
            </div>
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
                {policies.slice(0, 5).map((p: any) => (
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

        {/* Quick actions panel */}
        <div className="card">
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsList}>
            {[
              { to: '/admin/policies',   icon: '📝', label: 'Create new policy',   sub: 'Add or update HR policies' },
              { to: '/admin/onboarding', icon: '👤', label: 'Assign onboarding',   sub: 'Set tasks for new hires'   },
              { to: '/admin/policies',   icon: '🤖', label: 'Embed for AI',        sub: 'Enable AI policy assistant' },
            ].map(a => (
              <Link key={a.label} to={a.to} style={styles.actionItem}>
                <span style={styles.actionIcon}>{a.icon}</span>
                <div>
                  <p style={styles.actionLabel}>{a.label}</p>
                  <p style={styles.actionSub}>{a.sub}</p>
                </div>
                <span style={styles.actionArrow}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  heading:      { fontSize: '26px', fontWeight: 700, marginBottom: '4px' },
  sub:          { color: 'var(--text-secondary)', fontSize: '14px' },
  roleBadge:    { background: 'var(--accent-light)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard:     { textAlign: 'center' as const, padding: '20px' },
  statIcon:     { fontSize: '22px', marginBottom: '10px' },
  statValue:    (c: string) => ({ fontSize: '32px', fontWeight: 700, color: c, marginBottom: '6px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  statLabel:    { color: 'var(--text-secondary)', fontSize: '13px' },
  grid2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  sectionHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '15px', fontWeight: 600 },
  viewAll:      { color: 'var(--accent)', textDecoration: 'none', fontSize: '13px' },
  muted:        { color: 'var(--text-muted)', fontSize: '14px' },
  emptyState:   { textAlign: 'center' as const, padding: '24px 0' },
  emptyAction:  { color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', display: 'block', marginTop: '8px' },
  table:        { width: '100%', borderCollapse: 'collapse' as const },
  th:           { textAlign: 'left' as const, color: 'var(--text-muted)', fontSize: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)', fontWeight: 500 },
  td:           { padding: '11px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px' },
  actionsList:  { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  actionItem:   { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', borderRadius: '8px', textDecoration: 'none', transition: 'background 0.15s', cursor: 'pointer' },
  actionIcon:   { fontSize: '20px', flexShrink: 0 },
  actionLabel:  { color: 'var(--text-primary)', fontWeight: 500, fontSize: '13px' },
  actionSub:    { color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' },
  actionArrow:  { marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '16px' },
};
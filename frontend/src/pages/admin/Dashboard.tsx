import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Trophy, 
  PlusCircle, 
  UserPlus, 
  Bot, 
  ChevronRight, 
  ArrowRight 
} from 'lucide-react';

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
    { label: 'Total Policies',   value: policies.length, icon: FileText, color: 'var(--accent)'   },
    { label: 'Policies Accepted',value: consents.length, icon: CheckCircle2, color: 'var(--success)'  },
    { label: 'Pending Tasks',    value: pendingTasks,    icon: Clock, color: 'var(--warning)'  },
    { label: 'Tasks Completed',  value: completedTasks,  icon: Trophy, color: 'var(--success)'  },
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
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card card-hover glass-panel" style={styles.statCard}>
              <div style={{ ...styles.statIconBox, backgroundColor: `${card.color}15`, color: card.color }}>
                <Icon size={20} />
              </div>
              <p style={styles.statValue(card.color)}>
                {loading ? <span className="spinner" /> : card.value}
              </p>
              <p style={styles.statLabel}>{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div style={styles.grid2}>
        {/* Recent policies */}
        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Policies</h2>
            <Link to="/admin/policies" style={styles.viewAll}>
              <span>View all</span>
              <ArrowRight size={13} style={{ marginLeft: 4 }} />
            </Link>
          </div>
          {loading ? (
            <p style={styles.muted}>Loading...</p>
          ) : policies.length === 0 ? (
            <div style={styles.emptyState}>
              <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <p style={styles.muted}>No policies yet.</p>
              <Link to="/admin/policies" style={styles.emptyAction}>Create your first policy →</Link>
            </div>
          ) : (
            <table className="data-table" style={{ flex: 1 }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Version</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {policies.slice(0, 5).map((p: any) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td><span className="badge badge-info">v{p.version}</span></td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick actions panel */}
        <div className="card glass-panel">
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsList}>
            {[
              { to: '/admin/policies',   icon: PlusCircle, label: 'Create new policy',   sub: 'Add or update HR policies', color: 'var(--accent)' },
              { to: '/admin/onboarding', icon: UserPlus, label: 'Assign onboarding',   sub: 'Set tasks for new hires', color: 'var(--warning)'   },
              { to: '/admin/policies',   icon: Bot, label: 'Embed for AI',        sub: 'Enable AI policy assistant', color: 'var(--success)' },
            ].map(a => {
              const Icon = a.icon;
              return (
                <Link key={a.label} to={a.to} style={styles.actionItem}>
                  <div style={{ ...styles.actionIconBox, backgroundColor: `${a.color}15`, color: a.color }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={styles.actionLabel}>{a.label}</p>
                    <p style={styles.actionSub}>{a.sub}</p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  heading:      { fontSize: '26px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.02em' },
  sub:          { color: 'var(--text-secondary)', fontSize: '14px' },
  roleBadge:    { background: 'var(--accent-light)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard:     { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' },
  statIconBox:   { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' },
  statValue:    (c: string) => ({ fontSize: '32px', fontWeight: 800, color: c, marginBottom: '6px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.02em', textShadow: `0 0 20px ${c}30` }),
  statLabel:    { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  grid2:        { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' },
  sectionHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { fontSize: '15px', fontWeight: 600, marginBottom: '16px' },
  viewAll:      { color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center' },
  muted:        { color: 'var(--text-muted)', fontSize: '13px' },
  emptyState:   { textAlign: 'center' as const, padding: '32px 0', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  emptyAction:  { color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', display: 'block', marginTop: '8px' },
  actionsList:  { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  actionItem:   { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' },
  actionIconBox: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionLabel:  { color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px' },
  actionSub:    { color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' },
};
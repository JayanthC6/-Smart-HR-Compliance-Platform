import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Bot, 
  CheckSquare 
} from 'lucide-react';

export default function EmployeeHome() {
  const { user } = useAuth();
  const [tasks, setTasks]       = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/onboarding/tasks/my'),
      api.get('/api/consents/my'),
    ])
      .then(([t, c]) => { setTasks(t.data); setConsents(c.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total     = tasks.length;
  const pending   = tasks.filter(t => t.status === 'PENDING').length;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      {/* Welcome banner */}
      <div style={styles.welcomeBanner}>
        <div>
          <h1 style={styles.heading}>
            Welcome back, {user?.fullName} <Sparkles size={20} style={{ color: 'var(--warning)', display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }} />
          </h1>
          <p style={styles.sub}>Here's your compliance snapshot for today</p>
        </div>
        <div style={styles.rolePill}>{user?.role}</div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Pending Tasks',      value: pending,         color: pending > 0 ? 'var(--warning)' : 'var(--success)', icon: Clock },
          { label: 'Tasks Completed',    value: completed,       color: 'var(--success)', icon: CheckCircle2 },
          { label: 'Policies Accepted',  value: consents.length, color: 'var(--accent)',  icon: FileText },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card card-hover" style={styles.statCard}>
              <div style={styles.statIconRow}>
                <div style={{ ...styles.statIconBox, backgroundColor: `${s.color}15`, color: s.color }}>
                  <Icon size={20} />
                </div>
              </div>
              <p style={{ ...styles.statValue, color: s.color }}>
                {loading ? <span className="spinner" /> : s.value}
              </p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Onboarding progress */}
      {!loading && total > 0 && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <div style={styles.progressHeader}>
            <div>
              <p style={styles.progressTitle}>Onboarding Progress</p>
              <p style={styles.progressSub}>{completed} of {total} tasks completed</p>
            </div>
            <span style={styles.pctBadge}>{pct}%</span>
          </div>
          <div className="progress-track" style={{ marginTop: '16px' }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          {pct === 100 ? (
            <p style={styles.completedMsg}>
              <CheckCircle2 size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
              All tasks completed! Great job.
            </p>
          ) : (
            <p style={styles.pendingMsg}>
              {pending} task{pending !== 1 ? 's' : ''} still pending
            </p>
          )}
        </div>
      )}

      {/* Quick links */}
      <p style={styles.sectionLabel}>QUICK ACCESS</p>
      <div style={styles.quickLinks}>
        {[
          {
            to: '/employee/policies',
            icon: FileText,
            label: 'Company Policies',
            sub: 'Read and accept HR policies',
            badge: consents.length > 0 ? `${consents.length} accepted` : null,
            badgeClass: 'badge-success',
            color: 'var(--success)'
          },
          {
            to: '/employee/tasks',
            icon: CheckSquare,
            label: 'My Tasks',
            sub: 'Track your onboarding checklist',
            badge: pending > 0 ? `${pending} pending` : total > 0 ? 'All done!' : null,
            badgeClass: pending > 0 ? 'badge-warning' : 'badge-success',
            color: 'var(--warning)'
          },
          {
            to: '/employee/ai',
            icon: Bot,
            label: 'Ask AI',
            sub: 'Get answers about company policies',
            badge: 'Online',
            badgeClass: 'badge-info',
            color: 'var(--accent)'
          },
        ].map(link => {
          const Icon = link.icon;
          return (
            <Link key={link.to} to={link.to} style={styles.quickLink} className="card card-hover">
              <div style={styles.quickLinkTop}>
                <div style={{ ...styles.quickLinkIconBox, backgroundColor: `${link.color}15`, color: link.color }}>
                  <Icon size={20} />
                </div>
                {link.badge && (
                  <span className={`badge ${link.badgeClass}`}>{link.badge}</span>
                )}
              </div>
              <p style={styles.quickLinkTitle}>{link.label}</p>
              <p style={styles.quickLinkSub}>{link.sub}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  welcomeBanner: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  heading:       { fontSize: '26px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.02em' },
  sub:           { color: 'var(--text-secondary)', fontSize: '14px' },
  rolePill:      { background: 'var(--accent-light)', color: 'var(--accent)', padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  statsGrid:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard:      { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' },
  statIconRow:   { marginBottom: '12px' },
  statIconBox:   { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue:     { fontSize: '32px', fontWeight: 700, marginBottom: '6px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.02em' },
  statLabel:     { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  progressHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  progressTitle: { fontWeight: 600, fontSize: '15px', marginBottom: '2px' },
  progressSub:   { color: 'var(--text-secondary)', fontSize: '13px' },
  pctBadge:      { background: 'var(--accent-light)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 },
  completedMsg:  { color: 'var(--success)', fontSize: '13px', marginTop: '12px', fontWeight: 500 },
  pendingMsg:    { color: 'var(--text-muted)', fontSize: '12px', marginTop: '10px' },
  sectionLabel:  { color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '12px' },
  quickLinks:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  quickLink:     { display: 'block', textDecoration: 'none', cursor: 'pointer', padding: '24px' },
  quickLinkTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  quickLinkIconBox: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  quickLinkTitle:{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' },
  quickLinkSub:  { color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.4 },
};
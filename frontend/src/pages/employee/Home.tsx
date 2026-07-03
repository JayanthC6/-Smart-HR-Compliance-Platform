import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function EmployeeHome() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/onboarding/tasks/my').then(r => setTasks(r.data));
    api.get('/api/consents/my').then(r => setConsents(r.data));
  }, []);

  const pending = tasks.filter(t => t.status === 'PENDING').length;

  return (
    <div>
      <h1 style={styles.heading}>Welcome, {user?.fullName} 👋</h1>
      <p style={styles.sub}>Here's your compliance overview</p>

      <div style={styles.grid}>
        <div className="card">
          <p style={styles.statLabel}>Pending Tasks</p>
          <p style={{ ...styles.statValue, color: pending > 0 ? 'var(--warning)' : 'var(--success)' }}>{pending}</p>
        </div>
        <div className="card">
          <p style={styles.statLabel}>Policies Accepted</p>
          <p style={{ ...styles.statValue, color: 'var(--success)' }}>{consents.length}</p>
        </div>
        <div className="card">
          <p style={styles.statLabel}>AI Assistant</p>
          <p style={{ ...styles.statValue, color: 'var(--accent)' }}>Ready</p>
        </div>
      </div>

      <div style={styles.quickLinks}>
        <Link to="/employee/policies" style={styles.quickLink} className="card">
          <span style={{ fontSize: '24px' }}>📋</span>
          <p style={styles.quickLinkTitle}>View Policies</p>
          <p style={styles.quickLinkSub}>Read and accept company policies</p>
        </Link>
        <Link to="/employee/tasks" style={styles.quickLink} className="card">
          <span style={{ fontSize: '24px' }}>✅</span>
          <p style={styles.quickLinkTitle}>My Tasks</p>
          <p style={styles.quickLinkSub}>Track your onboarding checklist</p>
        </Link>
        <Link to="/employee/ai" style={styles.quickLink} className="card">
          <span style={{ fontSize: '24px' }}>🤖</span>
          <p style={styles.quickLinkTitle}>Ask AI</p>
          <p style={styles.quickLinkSub}>Get answers about company policies</p>
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '24px', fontWeight: 700, marginBottom: '4px' },
  sub: { color: 'var(--text-secondary)', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statLabel: { color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: 700 },
  quickLinks: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  quickLink: { display: 'block', textDecoration: 'none', cursor: 'pointer', transition: 'border-color 0.2s' },
  quickLinkTitle: { fontWeight: 600, marginTop: '12px', marginBottom: '4px', color: 'var(--text-primary)' },
  quickLinkSub: { color: 'var(--text-secondary)', fontSize: '13px' },
};
import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function OnboardingPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [form, setForm] = useState({ userId: '', title: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/onboarding/tasks/my').then(r => setTasks(r.data));
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/onboarding/tasks', form);
      setTasks(prev => [...prev, res.data]);
      setForm({ userId: '', title: '', dueDate: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally { setLoading(false); }
  };

  const statusColor: Record<string, string> = {
    PENDING: 'badge-warning', IN_PROGRESS: 'badge-info', COMPLETED: 'badge-success'
  };

  return (
    <div>
      <h1 style={styles.heading}>Onboarding</h1>
      <p style={styles.sub}>Assign onboarding tasks to new employees</p>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Assign New Task</h2>
        <form onSubmit={createTask} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Employee User ID</label>
            <input type="text" placeholder="UUID of the employee" value={form.userId}
              onChange={e => setForm({ ...form, userId: e.target.value })} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Task Title</label>
            <input type="text" placeholder="e.g. Complete ID verification" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Due Date</label>
            <input type="date" value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Task'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={styles.sectionTitle}>My Tasks</h2>
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No tasks yet.</p>
        ) : tasks.map(t => (
          <div key={t.id} style={styles.taskRow}>
            <div>
              <p style={styles.taskTitle}>{t.title}</p>
              {t.dueDate && <p style={styles.taskDue}>Due: {t.dueDate}</p>}
            </div>
            <span className={`badge ${statusColor[t.status] || 'badge-info'}`}>{t.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '24px', fontWeight: 700, marginBottom: '4px' },
  sub: { color: 'var(--text-secondary)', marginBottom: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: 600, marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' },
  taskTitle: { fontWeight: 500, marginBottom: '4px' },
  taskDue: { color: 'var(--text-muted)', fontSize: '12px' },
};
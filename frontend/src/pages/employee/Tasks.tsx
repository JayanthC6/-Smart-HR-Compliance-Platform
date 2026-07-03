import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/onboarding/tasks/my').then(r => setTasks(r.data));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await api.patch(`/api/onboarding/tasks/${id}/status?status=${status}`);
      setTasks(prev => prev.map(t => t.id === id ? res.data : t));
    } catch { alert('Failed to update'); }
    finally { setUpdating(null); }
  };

  const nextStatus: Record<string, string> = { PENDING: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED' };
  const statusColor: Record<string, string> = { PENDING: 'badge-warning', IN_PROGRESS: 'badge-info', COMPLETED: 'badge-success' };

  return (
    <div>
      <h1 style={styles.heading}>My Tasks</h1>
      <p style={styles.sub}>Track your onboarding progress</p>

      <div className="card">
        {tasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No tasks assigned yet.</p>
        ) : tasks.map(t => (
          <div key={t.id} style={styles.taskRow}>
            <div>
              <p style={styles.taskTitle}>{t.title}</p>
              {t.dueDate && <p style={styles.taskDue}>Due: {t.dueDate}</p>}
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className={`badge ${statusColor[t.status]}`}>{t.status}</span>
              {nextStatus[t.status] && (
                <button className="btn-secondary" style={{ fontSize: '12px', padding: '5px 10px' }}
                  onClick={() => updateStatus(t.id, nextStatus[t.status])}
                  disabled={updating === t.id}>
                  {updating === t.id ? '...' : `Mark ${nextStatus[t.status].replace('_', ' ')}`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '24px', fontWeight: 700, marginBottom: '4px' },
  sub: { color: 'var(--text-secondary)', marginBottom: '24px' },
  taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' },
  taskTitle: { fontWeight: 500, marginBottom: '4px' },
  taskDue: { color: 'var(--text-muted)', fontSize: '12px' },
};
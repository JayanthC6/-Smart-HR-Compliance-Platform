import { useEffect, useState } from 'react';
import api from '../../api/axios';

type Toast = { msg: string; type: 'success' | 'error' } | null;

const STATUS_COLOR: Record<string, string> = {
  PENDING:     'badge-warning',
  IN_PROGRESS: 'badge-info',
  COMPLETED:   'badge-success',
};

export default function OnboardingPage() {
  const [tasks, setTasks]     = useState<any[]>([]);
  const [docs, setDocs]       = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm]       = useState({ userId: '', title: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast]     = useState<Toast>(null);
  const [uploading, setUploading] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.get('/api/onboarding/tasks/my').then(r => setTasks(r.data)).catch(() => {});
    api.get('/api/onboarding/documents/my').then(r => setDocs(r.data)).catch(() => {});
    api.get('/api/users').then(r => {
      const emps = r.data.filter((u: any) => u.role === 'EMPLOYEE');
      setEmployees(emps);
      if (emps.length > 0) setForm(f => ({ ...f, userId: emps[0].id }));
    }).catch(() => {});
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      const res = await api.post('/api/onboarding/tasks', form);
      setTasks(prev => [...prev, res.data]);
      setForm({ userId: '', title: '', dueDate: '' });
      showToast('Task assigned successfully!', 'success');
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.post('/api/onboarding/documents', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDocs(prev => [...prev, res.data]);
      showToast(`"${file.name}" uploaded!`, 'success');
    } catch {
      showToast('Upload failed — please try again', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const pct = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '⚠️'} {toast.msg}
        </div>
      )}

      <h1 style={styles.heading}>Onboarding</h1>
      <p style={styles.sub}>Assign tasks and manage documents for new employees</p>

      <div style={styles.grid}>
        {/* Left column — create task */}
        <div>
          <div className="card" style={{ marginBottom: '16px' }}>
            <h2 style={styles.sectionTitle}>Assign New Task</h2>
            <form onSubmit={createTask} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Select Employee</label>
                <select
                  style={styles.select}
                  value={form.userId}
                  onChange={e => setForm({ ...form, userId: e.target.value })}
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.email})</option>
                  ))}
                  {employees.length === 0 && <option value="">No employees found</option>}
                </select>
                <p style={styles.hint}>Tasks will appear on the employee's dashboard</p>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Complete ID verification"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Due Date <span style={styles.optional}>(optional)</span></label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              {formError && <p className="error-msg">{formError}</p>}
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ alignSelf: 'flex-start', minWidth: '140px' }}
              >
                {loading
                  ? <><span className="spinner" style={{ marginRight: 8 }} />Assigning...</>
                  : '+ Assign Task'}
              </button>
            </form>
          </div>

          {/* Document upload */}
          <div className="card">
            <h2 style={styles.sectionTitle}>Upload Document</h2>
            <p style={styles.hint2}>Upload onboarding documents (PDF, images, etc.)</p>
            <label style={styles.uploadArea}>
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading
                ? <><span className="spinner" style={{ marginRight: 8 }} />Uploading...</>
                : '📁 Click to choose a file'}
            </label>

            {docs.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p style={styles.docsLabel}>Uploaded Documents ({docs.length})</p>
                {docs.map((d: any) => (
                  <div key={d.id} style={styles.docRow}>
                    <span style={{ fontSize: '16px' }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <p style={styles.docName}>{d.originalName || d.fileName || 'Document'}</p>
                      {d.createdAt && (
                        <p style={styles.docDate}>{new Date(d.createdAt).toLocaleDateString()}</p>
                      )}
                    </div>
                    <span className="badge badge-success">Uploaded</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — tasks list */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={styles.sectionTitle}>My Tasks ({tasks.length})</h2>
            {tasks.length > 0 && (
              <span style={styles.pctBadge}>{pct}% done</span>
            )}
          </div>

          {tasks.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <p style={styles.progressLabel}>
                {completedCount} of {tasks.length} tasks completed
              </p>
            </div>
          )}

          {tasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No tasks assigned yet.</p>
          ) : tasks.map(t => (
            <div key={t.id} style={styles.taskRow}>
              <div style={{ flex: 1 }}>
                <p style={styles.taskTitle}>{t.title}</p>
                {t.dueDate && (
                  <p style={styles.taskDue}>📅 Due: {t.dueDate}</p>
                )}
              </div>
              <span className={`badge ${STATUS_COLOR[t.status] || 'badge-info'}`}>
                {t.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading:      { fontSize: '26px', fontWeight: 700, marginBottom: '4px' },
  sub:          { color: 'var(--text-secondary)', marginBottom: '24px' },
  sectionTitle: { fontSize: '15px', fontWeight: 600, marginBottom: '16px' },
  grid:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  form:         { display: 'flex', flexDirection: 'column', gap: '16px' },
  field:        { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:        { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  select:       { padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' },
  optional:     { color: 'var(--text-muted)', fontWeight: 400 },
  hint:         { color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' },
  hint2:        { color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px' },
  uploadArea: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px dashed var(--border)', borderRadius: '8px',
    padding: '20px', cursor: 'pointer', color: 'var(--text-secondary)',
    fontSize: '14px', transition: 'border-color 0.2s',
  },
  docsLabel:    { fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' },
  docRow:       { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' },
  docName:      { fontSize: '13px', fontWeight: 500 },
  docDate:      { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' },
  pctBadge:     { background: 'var(--accent-light)', color: 'var(--accent)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
  progressLabel:{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' },
  taskRow:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' },
  taskTitle:    { fontWeight: 500, marginBottom: '4px', fontSize: '14px' },
  taskDue:      { color: 'var(--text-muted)', fontSize: '12px' },
};
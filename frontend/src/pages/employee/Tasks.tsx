import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';

type Toast = { msg: string; type: 'success' | 'error' } | null;

const STATUS_COLOR: Record<string, string> = {
  PENDING:     'badge-warning',
  IN_PROGRESS: 'badge-info',
  COMPLETED:   'badge-success',
};

const NEXT_STATUS: Record<string, string> = {
  PENDING:     'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
};

export default function EmployeeTasks() {
  const [tasks, setTasks]       = useState<any[]>([]);
  const [docs, setDocs]         = useState<any[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState<Toast>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    Promise.all([
      api.get('/api/onboarding/tasks/my'),
      api.get('/api/onboarding/documents/my'),
    ])
      .then(([t, d]) => { setTasks(t.data); setDocs(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await api.patch(`/api/onboarding/tasks/${id}/status?status=${status}`);
      setTasks(prev => prev.map(t => t.id === id ? res.data : t));
      showToast(`Task marked as ${status.replace('_', ' ')}`, 'success');
    } catch {
      showToast('Failed to update task status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      showToast(`"${file.name}" uploaded successfully`, 'success');
    } catch {
      showToast('Upload failed — please try again', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '⚠️'} {toast.msg}
        </div>
      )}

      <h1 style={styles.heading}>My Tasks</h1>
      <p style={styles.sub}>Track your onboarding progress</p>

      <div style={styles.layout}>
        {/* Tasks column */}
        <div>
          {/* Progress summary */}
          {!loading && total > 0 && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={styles.progressHeader}>
                <div>
                  <p style={styles.progressTitle}>Onboarding Progress</p>
                  <p style={styles.progressSub}>{completed} of {total} completed</p>
                </div>
                <span style={styles.pctBadge}>{pct}%</span>
              </div>
              <div className="progress-track" style={{ marginTop: '12px' }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {/* Tasks list */}
          <div className="card">
            <h2 style={styles.sectionTitle}>
              Tasks
              {!loading && <span style={styles.count}> ({total})</span>}
            </h2>

            {loading ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <span className="spinner" />
              </div>
            ) : total === 0 ? (
              <div style={styles.emptyState}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>📭</p>
                <p style={{ color: 'var(--text-muted)' }}>No tasks assigned yet.</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                  Your manager will assign onboarding tasks here.
                </p>
              </div>
            ) : (
              tasks.map(t => (
                <div key={t.id} style={styles.taskRow}>
                  {/* Status indicator */}
                  <div style={{
                    ...styles.statusDot,
                    background: t.status === 'COMPLETED'
                      ? 'var(--success)'
                      : t.status === 'IN_PROGRESS'
                      ? 'var(--accent)'
                      : 'var(--text-muted)',
                  }} />

                  <div style={{ flex: 1 }}>
                    <p style={{
                      ...styles.taskTitle,
                      textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none',
                      opacity: t.status === 'COMPLETED' ? 0.6 : 1,
                    }}>
                      {t.title}
                    </p>
                    {t.dueDate && (
                      <p style={styles.taskDue}>📅 Due: {t.dueDate}</p>
                    )}
                  </div>

                  <div style={styles.taskActions}>
                    <span className={`badge ${STATUS_COLOR[t.status] || 'badge-info'}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                    {NEXT_STATUS[t.status] && (
                      <button
                        className="btn-secondary"
                        style={{ fontSize: '12px', padding: '5px 10px', whiteSpace: 'nowrap' }}
                        onClick={() => updateStatus(t.id, NEXT_STATUS[t.status])}
                        disabled={updating === t.id}
                      >
                        {updating === t.id
                          ? <span className="spinner" />
                          : `→ ${NEXT_STATUS[t.status].replace('_', ' ')}`}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Documents column */}
        <div>
          <div className="card">
            <h2 style={styles.sectionTitle}>Documents</h2>
            <p style={styles.docHint}>Upload required documents for your onboarding</p>

            <label style={styles.uploadZone}>
              <input
                ref={fileRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleUpload}
                disabled={uploading}
              />
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>📁</span>
              {uploading
                ? <><span className="spinner" style={{ marginRight: 6 }} />Uploading...</>
                : <><strong>Click to upload</strong> a file</>}
            </label>

            {docs.length === 0 ? (
              <p style={styles.noDocsMsg}>No documents uploaded yet.</p>
            ) : (
              <div style={{ marginTop: '16px' }}>
                <p style={styles.docsCount}>{docs.length} document{docs.length !== 1 ? 's' : ''} uploaded</p>
                {docs.map((d: any) => (
                  <div key={d.id} style={styles.docRow}>
                    <span style={{ fontSize: '18px' }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <p style={styles.docName}>{d.originalName || d.fileName || 'Document'}</p>
                      {d.createdAt && (
                        <p style={styles.docDate}>
                          {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-success">✓</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading:       { fontSize: '26px', fontWeight: 700, marginBottom: '4px' },
  sub:           { color: 'var(--text-secondary)', marginBottom: '24px' },
  layout:        { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' },
  sectionTitle:  { fontSize: '15px', fontWeight: 600, marginBottom: '16px' },
  count:         { color: 'var(--text-muted)', fontWeight: 400 },
  progressHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  progressTitle: { fontWeight: 600, fontSize: '14px', marginBottom: '2px' },
  progressSub:   { color: 'var(--text-secondary)', fontSize: '12px' },
  pctBadge:      { background: 'var(--accent-light)', color: 'var(--accent)', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 },
  emptyState:    { textAlign: 'center', padding: '32px 0' },
  taskRow:       { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--border)' },
  statusDot:     { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  taskTitle:     { fontWeight: 500, fontSize: '14px', marginBottom: '2px' },
  taskDue:       { color: 'var(--text-muted)', fontSize: '12px' },
  taskActions:   { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  docHint:       { color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' },
  uploadZone: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    border: '2px dashed var(--border)', borderRadius: '10px', padding: '24px 16px',
    cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px',
    textAlign: 'center', transition: 'border-color 0.2s',
  },
  noDocsMsg:     { color: 'var(--text-muted)', fontSize: '13px', marginTop: '16px' },
  docsCount:     { fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  docRow:        { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' },
  docName:       { fontSize: '13px', fontWeight: 500 },
  docDate:       { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' },
};
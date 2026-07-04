import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import { 
  PlusCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';

type Toast = { msg: string; type: 'success' | 'error' } | null;

export default function PoliciesPage() {
  const [policies, setPolicies]   = useState<any[]>([]);
  const [form, setForm]           = useState({ title: '', content: '' });
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [embedding, setEmbedding] = useState<string | null>(null);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast]         = useState<Toast>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPolicies = useCallback(() => {
    setFetching(true);
    api.get('/api/policies')
      .then(r => setPolicies(r.data))
      .catch(() => showToast('Failed to load policies', 'error'))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const createPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      await api.post('/api/policies', form);
      setForm({ title: '', content: '' });
      fetchPolicies();
      showToast('Policy created successfully!', 'success');
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create policy');
    } finally {
      setLoading(false);
    }
  };

  const embedPolicy = async (id: string, title: string) => {
    setEmbedding(id);
    try {
      await api.post(`/api/ai/embed/${id}`);
      showToast(`"${title}" embedded for AI search!`, 'success');
    } catch {
      showToast('Embedding failed — please try again', 'error');
    } finally {
      setEmbedding(null);
    }
  };

  const toggleExpand = (id: string) =>
    setExpanded(prev => (prev === id ? null : id));

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} 
          <span>{toast.msg}</span>
        </div>
      )}

      <h1 style={styles.heading}>Policies</h1>
      <p style={styles.sub}>Create and manage HR policies for your company</p>

      {/* Create form */}
      <div className="card glass-panel" style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Create New Policy</h2>
        <form onSubmit={createPolicy} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Policy Title</label>
            <input
              type="text"
              placeholder="e.g. Remote Work Policy"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Policy Content</label>
            <textarea
              rows={5}
              placeholder="Describe the policy in full detail..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              required
              style={{ resize: 'vertical' }}
            />
          </div>
          {formError && <p className="error-msg">{formError}</p>}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ alignSelf: 'flex-start', minWidth: '160px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spinner" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <PlusCircle size={16} />
                <span>Create Policy</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Policies list */}
      <div className="card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={styles.sectionTitle}>
            All Policies {!fetching && <span style={styles.count}>({policies.length})</span>}
          </h2>
          {fetching && <span className="spinner" />}
        </div>

        {!fetching && policies.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '16px 0' }}>No policies yet — create one above.</p>
        ) : (
          policies.map(p => (
            <div key={p.id} style={styles.policyRow}>
              <div style={{ flex: 1 }}>
                {/* Header row */}
                <div style={styles.policyHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <p style={styles.policyTitle}>{p.title}</p>
                    <span className="badge badge-info">v{p.version}</span>
                    {p.createdAt && (
                      <span style={styles.policyDate}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div style={styles.policyActions}>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => embedPolicy(p.id, p.title)}
                      disabled={embedding === p.id}
                    >
                      {embedding === p.id ? (
                        <>
                          <Loader2 size={12} className="spinner" />
                          <span>Embedding...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} style={{ color: 'var(--warning)' }} />
                          <span>Embed for AI</span>
                        </>
                      )}
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => toggleExpand(p.id)}
                    >
                      {expanded === p.id ? (
                        <>
                          <EyeOff size={12} />
                          <span>Collapse</span>
                        </>
                      ) : (
                        <>
                          <Eye size={12} />
                          <span>View Content</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable content */}
                {expanded === p.id ? (
                  <div style={styles.policyContent}>
                    {p.content}
                  </div>
                ) : (
                  <p style={styles.policySnippet}>
                    {p.content?.substring(0, 120)}{p.content?.length > 120 ? '…' : ''}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading:       { fontSize: '26px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.02em' },
  sub:           { color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' },
  sectionTitle:  { fontSize: '15px', fontWeight: 600 },
  count:         { color: 'var(--text-muted)', fontWeight: 400 },
  form:          { display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' },
  field:         { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:         { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  policyRow:     { display: 'flex', padding: '18px 0', borderBottom: '1px solid var(--border)' },
  policyHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' },
  policyTitle:   { fontWeight: 600, fontSize: '14px' },
  policyDate:    { color: 'var(--text-muted)', fontSize: '12px' },
  policyActions: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  policySnippet: { color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 },
  policyContent: {
    color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.7,
    background: 'var(--bg-secondary)', borderRadius: '12px',
    padding: '16px', marginTop: '4px', whiteSpace: 'pre-wrap', border: '1px solid var(--border)'
  },
};
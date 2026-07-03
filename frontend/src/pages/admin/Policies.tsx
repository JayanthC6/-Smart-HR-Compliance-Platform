import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [embedding, setEmbedding] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchPolicies = () => api.get('/api/policies').then(r => setPolicies(r.data));

  useEffect(() => { fetchPolicies(); }, []);

  const createPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/policies', form);
      setForm({ title: '', content: '' });
      fetchPolicies();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create policy');
    } finally { setLoading(false); }
  };

  const embedPolicy = async (id: string) => {
    setEmbedding(id);
    try {
      await api.post(`/api/ai/embed/${id}`);
      alert('Policy embedded for AI search!');
    } catch { alert('Embedding failed'); }
    finally { setEmbedding(null); }
  };

  return (
    <div>
      <h1 style={styles.heading}>Policies</h1>
      <p style={styles.sub}>Create and manage HR policies for your company</p>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Create New Policy</h2>
        <form onSubmit={createPolicy} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Policy Title</label>
            <input type="text" placeholder="e.g. Remote Work Policy" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Policy Content</label>
            <textarea rows={4} placeholder="Describe the policy in detail..." value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })} required
              style={{ resize: 'vertical' }} />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Policy'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={styles.sectionTitle}>All Policies</h2>
        {policies.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No policies yet.</p>
        ) : policies.map(p => (
          <div key={p.id} style={styles.policyRow}>
            <div>
              <p style={styles.policyTitle}>{p.title}</p>
              <p style={styles.policyContent}>{p.content.substring(0, 100)}...</p>
            </div>
            <div style={styles.policyActions}>
              <span className="badge badge-info">v{p.version}</span>
              <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => embedPolicy(p.id)} disabled={embedding === p.id}>
                {embedding === p.id ? 'Embedding...' : '🤖 Embed for AI'}
              </button>
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
  sectionTitle: { fontSize: '16px', fontWeight: 600, marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  policyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' },
  policyTitle: { fontWeight: 600, marginBottom: '4px' },
  policyContent: { color: 'var(--text-secondary)', fontSize: '13px' },
  policyActions: { display: 'flex', gap: '10px', alignItems: 'center' },
};
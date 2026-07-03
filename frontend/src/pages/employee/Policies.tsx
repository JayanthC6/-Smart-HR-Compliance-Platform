import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function EmployeePolicies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [consents, setConsents] = useState<string[]>([]);
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/policies').then(r => setPolicies(r.data));
    api.get('/api/consents/my').then(r => setConsents(r.data.map((c: any) => c.policyId)));
  }, []);

  const accept = async (id: string) => {
    setAccepting(id);
    try {
      await api.post(`/api/consents/${id}/accept`);
      setConsents(prev => [...prev, id]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept');
    } finally { setAccepting(null); }
  };

  return (
    <div>
      <h1 style={styles.heading}>Company Policies</h1>
      <p style={styles.sub}>Read and accept all required policies</p>

      {policies.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)' }}>No policies published yet.</p>
        </div>
      ) : policies.map(p => (
        <div key={p.id} className="card" style={{ marginBottom: '16px' }}>
          <div style={styles.policyHeader}>
            <div>
              <h2 style={styles.policyTitle}>{p.title}</h2>
              <span className="badge badge-info" style={{ marginTop: '6px' }}>v{p.version}</span>
            </div>
            {consents.includes(p.id) ? (
              <span className="badge badge-success">✓ Accepted</span>
            ) : (
              <button className="btn-primary" style={{ fontSize: '13px' }}
                onClick={() => accept(p.id)} disabled={accepting === p.id}>
                {accepting === p.id ? 'Accepting...' : 'Accept Policy'}
              </button>
            )}
          </div>
          <p style={styles.policyContent}>{p.content}</p>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '24px', fontWeight: 700, marginBottom: '4px' },
  sub: { color: 'var(--text-secondary)', marginBottom: '24px' },
  policyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  policyTitle: { fontSize: '17px', fontWeight: 600 },
  policyContent: { color: 'var(--text-secondary)', lineHeight: 1.6 },
};
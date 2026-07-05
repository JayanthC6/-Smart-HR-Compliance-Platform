import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FileText, CheckCircle2, Loader2 } from 'lucide-react';

export default function EmployeePolicies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [consents, setConsents] = useState<string[]>([]);
  const [accepting, setAccepting] = useState<string | null>(null);

  // Summary states
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summarizing, setSummarizing] = useState<Record<string, boolean>>({});
  const [expandedSummaries, setExpandedSummaries] = useState<Record<string, boolean>>({});

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

  const summarizePolicy = async (id: string) => {
    if (expandedSummaries[id]) {
      setExpandedSummaries(prev => ({ ...prev, [id]: false }));
      return;
    }
    if (summaries[id]) {
      setExpandedSummaries(prev => ({ ...prev, [id]: true }));
      return;
    }
    setSummarizing(prev => ({ ...prev, [id]: true }));
    try {
      const res = await api.post(`/api/policies/${id}/summarize`);
      setSummaries(prev => ({ ...prev, [id]: res.data.summary }));
      setExpandedSummaries(prev => ({ ...prev, [id]: true }));
    } catch {
      alert('Failed to generate policy summary');
    } finally {
      setSummarizing(prev => ({ ...prev, [id]: false }));
    }
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
        <div key={p.id} className="card card-hover" style={{ marginBottom: '20px', padding: '28px' }}>
          <div style={styles.policyHeader}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={styles.iconBox}>
                <FileText size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 style={styles.policyTitle}>{p.title}</h2>
                <span className="badge badge-info" style={{ marginTop: '6px' }}>v{p.version}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '13px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => summarizePolicy(p.id)} 
                disabled={summarizing[p.id]}
              >
                {summarizing[p.id] ? (
                  <>
                    <Loader2 size={13} className="spinner" />
                    <span>Summarizing...</span>
                  </>
                ) : (
                  <>
                    <FileText size={13} style={{ color: 'var(--accent)' }} />
                    <span>{expandedSummaries[p.id] ? 'Hide Summary' : 'Summarize'}</span>
                  </>
                )}
              </button>
              {consents.includes(p.id) ? (
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}>
                  <CheckCircle2 size={13} /> Accepted
                </span>
              ) : (
                <button className="btn-primary" style={{ fontSize: '13px', padding: '10px 20px' }}
                  onClick={() => accept(p.id)} disabled={accepting === p.id}>
                  {accepting === p.id ? 'Accepting...' : 'Accept Policy'}
                </button>
              )}
            </div>
          </div>
          <p style={styles.policyContent}>{p.content}</p>

          {/* Summary Section */}
          {expandedSummaries[p.id] && summaries[p.id] && (
            <div style={styles.summaryBox}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '8px' }}>Policy Summary</h4>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                {summaries[p.id]}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '26px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.02em' },
  sub: { color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' },
  policyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  policyTitle: { fontSize: '16px', fontWeight: 600, letterSpacing: '-0.01em' },
  policyContent: { color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px', background: 'rgba(255, 255, 255, 0.01)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' },
  iconBox: { width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  summaryBox: {
    marginTop: '16px',
    padding: '12px 16px',
    background: 'rgba(99, 102, 241, 0.04)',
    borderLeft: '4px solid var(--accent)',
    borderRadius: '0 12px 12px 0',
    borderTop: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column'
  }
};
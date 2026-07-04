import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Percent, 
  ClipboardList, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  PartyPopper 
} from 'lucide-react';

interface PolicySummary {
  policyId: string;
  policyTitle: string;
  version: number;
  totalEmployees: number;
  accepted: number;
  pending: number;
  compliancePct: number;
  acceptedBy: string[];
  pendingBy: string[];
}

interface Summary {
  totalPolicies: number;
  totalEmployees: number;
  overallCompliancePct: number;
  policies: PolicySummary[];
}

export default function CompliancePage() {
  const [summary, setSummary]     = useState<Summary | null>(null);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [nonCompliant, setNonCompliant] = useState<any[]>([]);
  const [tab, setTab]             = useState<'summary' | 'nonCompliant'>('summary');

  useEffect(() => {
    Promise.all([
      api.get('/api/compliance/summary'),
      api.get('/api/compliance/non-compliant'),
    ])
      .then(([s, nc]) => { setSummary(s.data); setNonCompliant(nc.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  const pctColor = (pct: number) =>
    pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div>
      <h1 style={styles.heading}>Compliance Monitor</h1>
      <p style={styles.sub}>Track policy acceptance across your organisation</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px' }}><span className="spinner" /></div>
      ) : !summary ? (
        <div className="card"><p style={{ color: 'var(--text-muted)' }}>No data available.</p></div>
      ) : (
        <>
          {/* Overall stats */}
          <div style={styles.statsGrid}>
            <div className="card" style={styles.statCard}>
              <div style={{ ...styles.statIconBox, backgroundColor: `${pctColor(summary.overallCompliancePct)}15`, color: pctColor(summary.overallCompliancePct) }}>
                <Percent size={20} />
              </div>
              <p style={styles.statVal(String(summary.overallCompliancePct) + '%',
                pctColor(summary.overallCompliancePct))}>
                {summary.overallCompliancePct}%
              </p>
              <p style={styles.statLabel}>Overall Compliance</p>
              <div className="progress-track" style={{ marginTop: '16px' }}>
                <div className="progress-fill"
                  style={{ width: `${summary.overallCompliancePct}%`,
                    background: pctColor(summary.overallCompliancePct) }} />
              </div>
            </div>

            <div className="card" style={styles.statCard}>
              <div style={{ ...styles.statIconBox, backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                <ClipboardList size={20} />
              </div>
              <p style={styles.statVal(String(summary.totalPolicies), 'var(--accent)')}>
                {summary.totalPolicies}
              </p>
              <p style={styles.statLabel}>Total Policies</p>
            </div>

            <div className="card" style={styles.statCard}>
              <div style={{ ...styles.statIconBox, backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                <Users size={20} />
              </div>
              <p style={styles.statVal(String(summary.totalEmployees), 'var(--accent)')}>
                {summary.totalEmployees}
              </p>
              <p style={styles.statLabel}>Employees</p>
            </div>

            <div className="card" style={styles.statCard}>
              <div style={{ ...styles.statIconBox, backgroundColor: nonCompliant.length > 0 ? 'var(--danger-light)' : 'var(--success-light)', color: nonCompliant.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
                <AlertTriangle size={20} />
              </div>
              <p style={styles.statVal(String(nonCompliant.length),
                nonCompliant.length > 0 ? 'var(--danger)' : 'var(--success)')}>
                {nonCompliant.length}
              </p>
              <p style={styles.statLabel}>Non-Compliant</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabRow}>
            {(['summary', 'nonCompliant'] as const).map(t => (
              <button 
                key={t} 
                onClick={() => setTab(t)}
                className={`tab-button ${tab === t ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {t === 'summary' ? (
                  <>
                    <ClipboardList size={14} />
                    <span>Policy Breakdown</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} />
                    <span>Non-Compliant ({nonCompliant.length})</span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Policy breakdown */}
          {tab === 'summary' && (
            <div className="card">
              {summary.policies.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No policies found.</p>
              ) : summary.policies.map(p => (
                <div key={p.policyId} style={styles.policyRow}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.policyHeader}>
                      <div style={{ flex: 1 }}>
                        <div style={styles.policyTitle}>
                          <span>{p.policyTitle}</span>
                          <span className="badge badge-info" style={{ marginLeft: 8 }}>v{p.version}</span>
                        </div>
                        <div className="progress-track" style={{ marginTop: '8px', width: '240px' }}>
                          <div className="progress-fill"
                            style={{ width: `${p.compliancePct}%`,
                              background: pctColor(p.compliancePct) }} />
                        </div>
                      </div>
                      <div style={styles.policyMeta}>
                        <span style={{ color: pctColor(p.compliancePct), fontWeight: 700, fontSize: '18px' }}>
                          {p.compliancePct}%
                        </span>
                        <p style={styles.policyCount}>
                          {p.accepted}/{p.totalEmployees} accepted
                        </p>
                        <button className="btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                          onClick={() => toggle(p.policyId)}>
                          <span>Details</span>
                          {expanded === p.policyId ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </div>
                    </div>

                    {expanded === p.policyId && (
                      <div style={styles.details}>
                        <div style={styles.detailCol}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                            <p style={styles.detailLabel}>Accepted ({p.accepted})</p>
                          </div>
                          {p.acceptedBy.length === 0
                            ? <p style={styles.none}>None yet</p>
                            : p.acceptedBy.map(n => <p key={n} style={styles.name}>{n}</p>)}
                        </div>
                        <div style={styles.detailCol}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <Clock size={14} style={{ color: 'var(--danger)' }} />
                            <p style={{ ...styles.detailLabel, color: 'var(--danger)' }}>
                              Pending ({p.pending})
                            </p>
                          </div>
                          {p.pendingBy.length === 0
                            ? <p style={styles.none}>All accepted!</p>
                            : p.pendingBy.map(n => <p key={n} style={styles.name}>{n}</p>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Non-compliant employees */}
          {tab === 'nonCompliant' && (
            <div className="card">
              {nonCompliant.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <PartyPopper size={48} style={{ color: 'var(--success)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--success)', fontWeight: 600 }}>
                    All employees are fully compliant!
                  </p>
                </div>
              ) : nonCompliant.map((e: any) => (
                <div key={e.userId} style={styles.employeeRow}>
                  <div style={styles.avatar}>{e.fullName.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <p style={styles.empName}>{e.fullName}</p>
                    <p style={styles.empEmail}>{e.email}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={11} />
                      <span>{e.pendingCount} pending</span>
                    </span>
                    <div style={{ marginTop: '6px' }}>
                      {e.unacceptedPolicies.map((t: string) => (
                        <p key={t} style={styles.pendingPolicy}>• {t}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, any> = {
  heading:     { fontSize: '26px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.02em' },
  sub:         { color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' },
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard:    { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' },
  statIconBox: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' },
  statVal:     (_v: string, c: string) => ({ fontSize: '32px', fontWeight: 700, color: c, marginBottom: '6px', letterSpacing: '-0.02em' }),
  statLabel:   { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  tabRow:      { display: 'flex', gap: '8px', marginBottom: '24px' },
  policyRow:   { padding: '18px 0', borderBottom: '1px solid var(--border)', display: 'flex' },
  policyHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  policyTitle: { fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center' },
  policyMeta:  { textAlign: 'right' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '4px' },
  policyCount: { color: 'var(--text-muted)', fontSize: '12px' },
  details:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '18px', border: '1px solid var(--border)' },
  detailCol:   {},
  detailLabel: { fontSize: '12px', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  none:        { color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' },
  name:        { fontSize: '13px', color: 'var(--text-secondary)', padding: '4px 0' },
  employeeRow: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 0', borderBottom: '1px solid var(--border)' },
  avatar:      { width: '36px', height: '36px', borderRadius: '50%', background: '#ef444420', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 },
  empName:     { fontWeight: 600, fontSize: '14px', marginBottom: '2px' },
  empEmail:    { color: 'var(--text-muted)', fontSize: '12px' },
  pendingPolicy:{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' },
};

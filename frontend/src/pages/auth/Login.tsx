import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ companyName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data);
      navigate(res.data.role === 'EMPLOYEE' ? '/employee' : '/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⚖️</span>
          <h1 style={styles.logoText}>HR Comply</h1>
        </div>
        <p style={styles.subtitle}>Sign in to your workspace</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Company Name</label>
            <input
              type="text"
              placeholder="e.g. TestCorp"
              value={form.companyName}
              onChange={e => setForm({ ...form, companyName: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={styles.footer}>
          New company?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  logoIcon: { fontSize: '28px' },
  logoText: { fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 },
  footer: { textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '13px' },
};
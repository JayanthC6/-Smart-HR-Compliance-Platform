import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ companyName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'employee'>('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', form);
      const user = res.data;

      if (loginType === 'employee' && user.role !== 'EMPLOYEE') {
        setError('This account is registered as Admin/HR. Please use the Admin/HR login.');
        return;
      }

      if (loginType === 'admin' && user.role === 'EMPLOYEE') {
        setError('This account is registered as an Employee. Please use the Employee login.');
        return;
      }

      login(user);
      navigate(user.role === 'EMPLOYEE' ? '/employee' : '/admin');
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
          <img src="/logo.png" alt="HR Comply Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }} />
          <h1 style={styles.logoText}>HR Comply</h1>
        </div>
        <p style={styles.subtitle}>
          {loginType === 'admin' ? 'Admin & HR Portal Login' : 'Employee Portal Login'}
        </p>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '4px', marginBottom: '24px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: loginType === 'admin' ? 'var(--accent)' : 'transparent',
              color: loginType === 'admin' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              setLoginType('admin');
              setError('');
            }}
          >
            Admin / HR
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: loginType === 'employee' ? 'var(--accent)' : 'transparent',
              color: loginType === 'employee' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              setLoginType('employee');
              setError('');
            }}
          >
            Employee
          </button>
        </div>

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
                style={{ paddingRight: '44px', width: '100%', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Or Quick Demo Login
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1, fontSize: '11px', padding: '8px 4px' }}
              onClick={() => {
                setLoginType('admin');
                setForm({
                  companyName: 'DemoCorp',
                  email: 'admin@democorp.com',
                  password: 'password123'
                });
              }}
            >
              Demo Admin/HR
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1, fontSize: '11px', padding: '8px 4px' }}
              onClick={() => {
                setLoginType('employee');
                setForm({
                  companyName: 'DemoCorp',
                  email: 'employee@democorp.com',
                  password: 'password123'
                });
              }}
            >
              Demo Employee
            </button>
          </div>
        </div>

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
    backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.08), transparent 25%)',
  },
  container: {
    width: '100%',
    maxWidth: '420px',
    padding: '48px',
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderRadius: '24px',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' },
  logoText: { 
    fontSize: '28px', 
    fontWeight: 800, 
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.03em'
  },
  subtitle: { textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '36px', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' },
  footer: { textAlign: 'center', marginTop: '28px', color: 'var(--text-secondary)', fontSize: '14px' },
};
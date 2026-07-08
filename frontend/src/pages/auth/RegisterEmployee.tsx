import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterEmployee() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token') || '';

  const [form, setForm] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inviteToken) {
      setError('Invite token is missing from the URL. Please request a new invite link.');
    }
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken) {
      setError('Invite token is required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/register-employee', {
        inviteToken,
        fullName: form.fullName,
        password: form.password
      });
      login(res.data);
      navigate(res.data.role === 'EMPLOYEE' ? '/employee' : '/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. The token may be expired or already used.');
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
        <p style={styles.subtitle}>Complete employee registration</p>

        {error && !inviteToken ? (
          <div style={{ textAlign: 'center' }}>
            <p className="error-msg" style={{ justifyContent: 'center', marginBottom: '20px' }}>{error}</p>
            <Link to="/login" className="btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  disabled={loading}
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
            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register Workspace</span>
              )}
            </button>
          </form>
        )}
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
};

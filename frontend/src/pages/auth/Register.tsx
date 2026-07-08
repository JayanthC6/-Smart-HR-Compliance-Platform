import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '', adminFullName: '', email: '', password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/register', form);
      login(res.data);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
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
        <p style={styles.subtitle}>Register your company</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Company Name</label>
            <input type="text" placeholder="Acme Corp" value={form.companyName}
              onChange={e => setForm({ ...form, companyName: e.target.value })} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Your Full Name</label>
            <input type="text" placeholder="Jayanth C" value={form.adminFullName}
              onChange={e => setForm({ ...form, adminFullName: e.target.value })} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" placeholder="admin@company.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div style={styles.field}>
            <div className="form-group" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={styles.label}>Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 characters"
                required
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '32px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
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
            {loading ? 'Creating workspace...' : 'Create workspace'}
          </button>
        </form>

        <p style={styles.footer}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { 
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.08), transparent 25%)'
  },
  container: { 
    width: '100%', maxWidth: '440px', padding: '48px', 
    background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
    borderRadius: '24px', border: '1px solid var(--glass-border)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' },
  logoText: { fontSize: '28px', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' },
  subtitle: { textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '36px', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' },
  footer: { textAlign: 'center', marginTop: '28px', color: 'var(--text-secondary)', fontSize: '14px' },
};
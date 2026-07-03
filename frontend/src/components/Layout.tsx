import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props { children: ReactNode; }

export default function Layout({ children }: Props) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

  const navLinks = isAdmin ? [
    { to: '/admin', label: '📊 Dashboard' },
    { to: '/admin/policies', label: '📋 Policies' },
    { to: '/admin/onboarding', label: '✅ Onboarding' },
  ] : [
    { to: '/employee', label: '🏠 Home' },
    { to: '/employee/policies', label: '📋 Policies' },
    { to: '/employee/tasks', label: '✅ My Tasks' },
    { to: '/employee/ai', label: '🤖 Ask AI' },
  ];

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={{ fontSize: '22px' }}>⚖️</span>
          <span style={styles.brandText}>HR Comply</span>
        </div>
        <nav style={styles.nav}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.navLink,
                ...(location.pathname === link.to ? styles.navLinkActive : {}),
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div style={styles.userSection}>
          <p style={styles.userName}>{user?.fullName}</p>
          <p style={styles.userRole}>{user?.role}</p>
          <button className="btn-secondary" style={{ width: '100%', marginTop: '10px' }} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: '220px', minHeight: '100vh', background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)', display: 'flex',
    flexDirection: 'column', padding: '24px 16px', position: 'fixed', top: 0, left: 0,
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 8px' },
  brandText: { fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navLink: {
    padding: '10px 12px', borderRadius: '8px', textDecoration: 'none',
    color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, transition: 'all 0.15s',
  },
  navLinkActive: { background: 'var(--accent-light)', color: 'var(--accent)' },
  userSection: { borderTop: '1px solid var(--border)', paddingTop: '16px' },
  userName: { fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' },
  userRole: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' },
  main: { marginLeft: '220px', flex: 1, padding: '32px', background: 'var(--bg-primary)' },
};
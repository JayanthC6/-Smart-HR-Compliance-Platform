import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props { children: ReactNode; }

export default function Layout({ children }: Props) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

  const navLinks = isAdmin ? [
    { to: '/admin',            label: '📊 Dashboard' },
    { to: '/admin/policies',   label: '📋 Policies'  },
    { to: '/admin/onboarding', label: '✅ Onboarding' },
    { to: '/admin/compliance', label: '🛡️ Compliance' },
    { to: '/admin/audit',      label: '📜 Audit Log' },
  ] : [
    { to: '/employee',           label: '🏠 Home'     },
    { to: '/employee/policies',  label: '📋 Policies' },
    { to: '/employee/tasks',     label: '✅ My Tasks'  },
    { to: '/employee/ai',        label: '🤖 Ask AI'   },
  ];

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        {/* Brand */}
        <div style={styles.brand}>
          <span style={{ fontSize: '22px' }}>⚖️</span>
          <div>
            <p style={styles.brandText}>HR Comply</p>
            {user?.companyId && (
              <p style={styles.companyTag}>
                {isAdmin ? '🏢 Admin' : '👤 Employee'}
              </p>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  ...styles.navLink,
                  ...(active ? styles.navLinkActive : {}),
                }}
              >
                {active && <span style={styles.activeDot} />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {user?.fullName?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={styles.userName}>{user?.fullName}</p>
            <p style={styles.userRole}>{user?.role}</p>
          </div>
          <button
            onClick={logout}
            style={styles.signOutBtn}
            title="Sign out"
          >
            ↪
          </button>
        </div>
      </aside>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell:   { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: '230px', minHeight: '100vh',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    padding: '24px 12px',
    position: 'fixed', top: 0, left: 0,
    zIndex: 100,
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '32px', padding: '0 8px',
  },
  brandText:  { fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' },
  companyTag: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' },
  nav:        { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  navLink: {
    padding: '10px 12px', borderRadius: '8px', textDecoration: 'none',
    color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500,
    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px',
    position: 'relative',
  },
  navLinkActive: {
    background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600,
  },
  activeDot: {
    width: '4px', height: '4px', borderRadius: '50%',
    background: 'var(--accent)', display: 'inline-block', flexShrink: 0,
  },
  userSection: {
    borderTop: '1px solid var(--border)', paddingTop: '16px',
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  userAvatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'var(--accent-light)', color: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '14px', flexShrink: 0,
  },
  userName:   { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole:   { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' },
  signOutBtn: {
    background: 'transparent', color: 'var(--text-muted)', fontSize: '16px',
    padding: '4px 6px', borderRadius: '6px', flexShrink: 0,
    border: '1px solid transparent',
  },
  main: { marginLeft: '230px', flex: 1, padding: '36px', background: 'var(--bg-primary)', minHeight: '100vh' },
};
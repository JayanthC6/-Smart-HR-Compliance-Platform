import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  FileText, 
  CheckSquare, 
  Shield, 
  History, 
  Home, 
  Bot, 
  LogOut
} from 'lucide-react';

interface Props { children: ReactNode; }

export default function Layout({ children }: Props) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

  const navLinks = isAdmin ? [
    { to: '/admin',            label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/policies',   label: 'Policies',  icon: FileText  },
    { to: '/admin/onboarding', label: 'Onboarding', icon: CheckSquare },
    { to: '/admin/compliance', label: 'Compliance', icon: Shield },
    { to: '/admin/audit',      label: 'Audit Log', icon: History },
  ] : [
    { to: '/employee',           label: 'Home',     icon: Home },
    { to: '/employee/policies',  label: 'Policies', icon: FileText },
    { to: '/employee/tasks',     label: 'My Tasks',  icon: CheckSquare },
    { to: '/employee/ai',        label: 'Ask AI',   icon: Bot },
  ];

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        {/* Brand */}
        <div style={styles.brand}>
          <img src="/logo.png" alt="HR Comply Logo" style={{ width: '28px', height: '28px', objectFit: 'contain', flexShrink: 0, borderRadius: '4px' }} />
          <div>
            <p style={styles.brandText}>HR Comply</p>
            {user?.companyId && (
              <p style={styles.companyTag}>
                {isAdmin ? 'Admin Portal' : 'Employee Portal'}
              </p>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={styles.nav}>
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`sidebar-link ${active ? 'active' : ''}`}
              >
                {active && <span className="sidebar-link-dot" />}
                <Icon size={18} style={{ opacity: active ? 1 : 0.7 }} />
                <span>{link.label}</span>
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
            className="signout-btn"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell:   { display: 'flex', minHeight: '100vh', position: 'relative' },
  sidebar: {
    width: '260px', minHeight: '100vh',
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderRight: '1px solid var(--glass-border)',
    display: 'flex', flexDirection: 'column',
    padding: '32px 20px',
    position: 'fixed', top: 0, left: 0,
    zIndex: 100,
    boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '40px', padding: '0 8px',
  },
  brandText:  { 
    fontSize: '20px', 
    fontWeight: 800, 
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.03em'
  },
  companyTag: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  nav:        { display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 },
  userSection: {
    borderTop: '1px solid var(--glass-border)', paddingTop: '20px',
    display: 'flex', alignItems: 'center', gap: '12px',
    background: 'rgba(0,0,0,0.2)',
    padding: '16px',
    borderRadius: '16px',
    marginTop: 'auto'
  },
  userAvatar: {
    width: '40px', height: '40px', borderRadius: '12px',
    background: 'var(--accent-gradient)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '16px', flexShrink: 0,
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
  },
  userName:   { fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole:   { fontSize: '11px', color: 'var(--accent)', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.03em' },
  main: { marginLeft: '260px', flex: 1, padding: '48px', background: 'transparent', minHeight: '100vh' },
};
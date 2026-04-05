import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: '🏠 Dashboard' },
  { path: '/loans',     label: '📋 Préstamos' },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>💻</span>
          <span style={styles.brandText}>Préstamos</span>
        </div>
        <nav style={styles.nav}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navLink,
                ...(location.pathname.startsWith(item.path) ? styles.navLinkActive : {}),
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: { width: 220, background: '#1e293b', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem', gap: '0.5rem', flexShrink: 0 },
  brand: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', marginBottom: '1rem' },
  brandIcon: { fontSize: '1.4rem' },
  brandText: { color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem' },
  nav: { display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 },
  navLink: { color: '#94a3b8', textDecoration: 'none', padding: '10px 12px', borderRadius: 8, fontSize: '0.9rem', transition: 'all 0.15s' },
  navLinkActive: { background: '#3b82f6', color: '#fff' },
  logoutBtn: { background: 'none', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, padding: '9px 12px', cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left' },
  main: { flex: 1, padding: '2rem', overflowY: 'auto' },
};

export default Layout;

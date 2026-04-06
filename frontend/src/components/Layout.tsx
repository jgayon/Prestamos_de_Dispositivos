import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">📋</div>
            <div>
              <h3>LoanTech</h3>
              <p>Sistema de Préstamos</p>
            </div>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">{user?.name?.[0] || 'U'}</div>
          <div className="profile-info">
            <h4>{user?.name || 'Usuario'}</h4>
            <p>Admin</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <h5 className="nav-title">MENÚ PRINCIPAL</h5>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <span>📊</span> Dashboard
          </Link>
          <Link to="/loans" className={`nav-link ${isActive('/loans') ? 'active' : ''}`}>
            <span>📝</span> Préstamos <span className="badge-count">3</span>
          </Link>
          <Link to="/devices" className={`nav-link ${isActive('/devices') ? 'active' : ''}`}>
            <span>💻</span> Dispositivos
          </Link>
          <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
            <span>👥</span> Usuarios
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-footer" onClick={() => alert('Cambiar usuario')}>
            🔄 Cambiar a Usuario
          </button>
          <button className="btn-footer btn-logout" onClick={() => { logout(); navigate('/'); }}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1>Sistema de Gestión de Préstamos</h1>
            <p>lunes, 6 de abril de 2026</p>
          </div>
          <div className="topbar-right">
            <button className="icon-btn">🔔</button>
            <div className="user-menu">
              <div className="user-avatar">{user?.name?.[0] || 'U'}</div>
              <div className="user-info">
                <p>{user?.name || 'Usuario'}</p>
                <span>Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

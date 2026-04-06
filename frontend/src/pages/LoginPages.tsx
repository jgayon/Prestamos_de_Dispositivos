import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import '../styles/login.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err?.message || err?.response?.data?.message || 'Credenciales incorrectas.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="logo-box">📋</div>
          </div>
          <h1>Gestión inteligente de<br /><span>préstamos tecnológicos</span></h1>
          <p>Administra dispositivos, solicitudes y devoluciones desde un solo panel. Flujo completo para administradores y usuarios finales.</p>
          
          <div className="brand-features">
            <div className="feature">
              <div className="feature-icon">📦</div>
              <div>
                <h4>Control total de inventario</h4>
                <p>Laptops, cargadores, kits y más</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">📊</div>
              <div>
                <h4>Flujo de estados automatizado</h4>
                <p>Solicitud → Aprobación → Entrega → Devolución</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">👥</div>
              <div>
                <h4>Roles diferenciados</h4>
                <p>Admin y Usuario Final con permisos distintos</p>
              </div>
            </div>
          </div>
          
          <p className="brand-footer">© 2026 LoanTech · Todos los derechos reservados</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="login-form-container">
        <div className="login-form-box">
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para acceder al sistema</p>

          {error && <div className="error-box">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  placeholder="carlos.mendoza@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión →'}
            </button>
          </form>

          <div className="demo-accounts">
            <p>Cuentas de demostración:</p>
            <button type="button" className="demo-btn" onClick={() => { setEmail('carlos.mendoza@empresa.com'); setPassword('admin'); }}>
              Administrador<br /><span>carlos.mendoza@empresa.com</span>
            </button>
            <button type="button" className="demo-btn" onClick={() => { setEmail('ana.ramirez@empresa.com'); setPassword('user'); }}>
              Usuario Final<br /><span>ana.ramirez@empresa.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

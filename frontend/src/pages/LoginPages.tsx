import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data?.token || res.data?.access_token;
      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Credenciales incorrectas.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo / Header */}
        <div style={styles.header}>
          <div style={styles.iconWrap}>💻</div>
          <h1 style={styles.title}>Préstamos de Dispositivos</h1>
          <p style={styles.subtitle}>Inicia sesión para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              style={styles.input}
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión →'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  iconWrap: { fontSize: '2.5rem', marginBottom: '0.75rem' },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: '0 0 6px' },
  subtitle: { fontSize: '0.875rem', color: '#6b7280', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { padding: '11px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', color: '#111827', outline: 'none' },
  btn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '13px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' },
  errorBox: { background: '#fee2e2', color: '#991b1b', borderRadius: 8, padding: '12px 14px', fontSize: '0.875rem' },
};

export default LoginPage;

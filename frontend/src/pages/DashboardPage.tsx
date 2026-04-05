import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoans } from '../api/loans.api';
import { getDevices } from '../api/devices.api';
import { getUsers } from '../api/users.api';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

interface Stats {
  total: number;
  requested: number;
  approved: number;
  delivered: number;
  returned: number;
  expired: number;
}

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, requested: 0, approved: 0, delivered: 0, returned: 0, expired: 0 });
  const [deviceCount, setDeviceCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getLoans(),
      getDevices(),
      getUsers(),
    ]).then(([loansRes, devicesRes, usersRes]) => {
      const loans: any[] = loansRes.data || [];
      const devices: any[] = devicesRes.data || [];
      const users: any[] = usersRes.data || [];

      const s: Stats = { total: loans.length, requested: 0, approved: 0, delivered: 0, returned: 0, expired: 0 };
      loans.forEach(l => {
        const state = (l.state || l.status || '').toUpperCase();
        if (state === 'REQUESTED') s.requested++;
        else if (state === 'APPROVED') s.approved++;
        else if (state === 'DELIVERED') s.delivered++;
        else if (state === 'RETURNED') s.returned++;
        else if (state === 'EXPIRED') s.expired++;
      });

      setStats(s);
      setDeviceCount(devices.length);
      setUserCount(users.length);
      setRecentLoans(loans.slice(-5).reverse());
    }).catch(err => {
      console.error(err);
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total préstamos', value: stats.total,     icon: '📋', color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Solicitados',     value: stats.requested, icon: '🕐', color: '#b45309', bg: '#fef3c7' },
    { label: 'Aprobados',       value: stats.approved,  icon: '✅', color: '#065f46', bg: '#d1fae5' },
    { label: 'Entregados',      value: stats.delivered, icon: '📦', color: '#1e40af', bg: '#dbeafe' },
    { label: 'Devueltos',       value: stats.returned,  icon: '↩',  color: '#6b7280', bg: '#f3f4f6' },
    { label: 'Vencidos',        value: stats.expired,   icon: '⚠️', color: '#991b1b', bg: '#fee2e2' },
  ];

  const statusLabel: Record<string, string> = {
    REQUESTED: 'Solicitado', APPROVED: 'Aprobado',
    DELIVERED: 'Entregado',  RETURNED: 'Devuelto', EXPIRED: 'Vencido',
  };
  const statusColor: Record<string, { color: string; bg: string }> = {
    REQUESTED: { color: '#b45309', bg: '#fef3c7' },
    APPROVED:  { color: '#065f46', bg: '#d1fae5' },
    DELIVERED: { color: '#1e40af', bg: '#dbeafe' },
    RETURNED:  { color: '#6b7280', bg: '#f3f4f6' },
    EXPIRED:   { color: '#991b1b', bg: '#fee2e2' },
  };

  return (
    <Layout>
      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Dashboard</h2>
            <p style={styles.subtitle}>Resumen general del sistema</p>
          </div>
          <Link to="/loans/new" style={styles.btnNew}>+ Nuevo préstamo</Link>
        </div>

        {loading ? (
          <div style={styles.centered}>
            <div style={styles.spinner} />
            <p style={{ color: '#6b7280' }}>Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Summary row */}
            <div style={styles.summaryRow}>
              <div style={styles.summaryCard}>
                <span style={styles.summaryIcon}>💻</span>
                <div>
                  <p style={styles.summaryValue}>{deviceCount}</p>
                  <p style={styles.summaryLabel}>Dispositivos</p>
                </div>
              </div>
              <div style={styles.summaryCard}>
                <span style={styles.summaryIcon}>👥</span>
                <div>
                  <p style={styles.summaryValue}>{userCount}</p>
                  <p style={styles.summaryLabel}>Usuarios</p>
                </div>
              </div>
              <div style={styles.summaryCard}>
                <span style={styles.summaryIcon}>📋</span>
                <div>
                  <p style={styles.summaryValue}>{stats.total}</p>
                  <p style={styles.summaryLabel}>Préstamos totales</p>
                </div>
              </div>
            </div>

            {/* Stat grid */}
            <h3 style={styles.sectionTitle}>Estado de préstamos</h3>
            <div style={styles.grid}>
              {statCards.map(card => (
                <div key={card.label} style={{ ...styles.statCard, background: card.bg }}>
                  <span style={styles.statIcon}>{card.icon}</span>
                  <p style={{ ...styles.statValue, color: card.color }}>{card.value}</p>
                  <p style={{ ...styles.statLabel, color: card.color }}>{card.label}</p>
                </div>
              ))}
            </div>

            {/* Recent loans */}
            <h3 style={styles.sectionTitle}>Préstamos recientes</h3>
            <div style={styles.card}>
              {recentLoans.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>No hay préstamos registrados.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>#ID</th>
                      <th style={styles.th}>Usuario</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Inicio</th>
                      <th style={styles.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoans.map(loan => {
                      const s = statusColor[loan.state || loan.status] || { color: '#374151', bg: '#f9fafb' };
                      return (
                        <tr key={loan.id} style={styles.tr}>
                          <td style={{ ...styles.td, color: '#9ca3af', fontSize: '0.8rem' }}>#{loan.id}</td>
                          <td style={styles.td}>{loan.userId || loan.user?.name || '—'}</td>
                          <td style={styles.td}>
                            <span style={{ ...styles.badge, ...s }}>
                              {statusLabel[loan.state || loan.status] || loan.state || '—'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, color: '#6b7280', fontSize: '0.85rem' }}>
                            {loan.startDate ? new Date(loan.startDate).toLocaleDateString('es-CO') : '—'}
                          </td>
                          <td style={styles.td}>
                            <Link to={`/loans/${loan.id}`} style={styles.link}>Ver →</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 900, margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 },
  subtitle: { fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0' },
  btnNew: { background: '#3b82f6', color: '#fff', borderRadius: 8, padding: '10px 18px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 },
  summaryRow: { display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' },
  summaryCard: { display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem', flex: 1, minWidth: 140, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  summaryIcon: { fontSize: '1.75rem' },
  summaryValue: { fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 },
  summaryLabel: { fontSize: '0.8rem', color: '#6b7280', margin: '2px 0 0' },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, color: '#374151', margin: '0 0 1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' },
  statCard: { borderRadius: 12, padding: '1.25rem 1rem', textAlign: 'center' },
  statIcon: { fontSize: '1.5rem' },
  statValue: { fontSize: '1.75rem', fontWeight: 700, margin: '4px 0 2px' },
  statLabel: { fontSize: '0.75rem', fontWeight: 600, margin: 0 },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '13px 16px', fontSize: '0.875rem', color: '#111827' },
  badge: { padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 },
  link: { color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '0.75rem' },
  spinner: { width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
};

export default DashboardPage;

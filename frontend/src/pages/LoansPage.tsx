import { useEffect, useState } from "react";
import { getLoans } from "../api/loans.api";
import Layout from "../components/Layout";
import LoanTable from "../components/LoanTable";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../styles/forms.css';

const LoansList = () => {
  const { user, isAdmin } = useAuth();
  const [loans, setLoans] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // build query string
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const response = await getLoans(params.toString());
      let data = response.data || [];
      if (!isAdmin && user?.id) {
        data = data.filter((l: any) => l.userId === user.id);
      }
      setLoans(data);
    } catch (error) {
      console.error('Error loading loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin, user?.id]);

  return (
    <Layout>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Préstamos</h2>
        <Link to="/loans/new" className="btn btn-primary">
          ➕ Nuevo Préstamo
        </Link>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>Estado</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Todos</option>
            <option value="REQUESTED">Solicitado</option>
            <option value="APPROVED">Aprobado</option>
            <option value="DELIVERED">Entregado</option>
            <option value="RETURNED">Devuelto</option>
            <option value="EXPIRED">Vencido</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Desde</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>

        <div className="filter-group">
          <label>Hasta</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>

        <div className="filter-actions">
          <button
            className="btn btn-primary"
            onClick={load}
            disabled={loading}
          >
            {loading ? '⏳ Buscando...' : '🔍 Filtrar'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setStatusFilter('');
              setStartDate('');
              setEndDate('');
              load();
            }}
            disabled={loading}
          >
            🔄 Limpiar
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>⏳ Cargando préstamos...</p>
        </div>
      ) : (
        <LoanTable loans={loans} onStatusChange={load} />
      )}

    </Layout>
  );
};

export default LoansList;
import { useEffect, useState } from "react";
import { getLoans } from "../api/loans.api";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

const LoansList = () => {

  const [loans, setLoans] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = () => {
    // build query string
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    getLoans(params.toString()).then(res => setLoans(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Layout>

      <h2>Préstamos</h2>

      <Link to="/loans/new">Nuevo préstamo</Link>

      <div style={{ marginTop: '1rem' }}>
        <label>Estado:</label>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); load(); }}>
          <option value="">Todos</option>
          <option value="REQUESTED">Solicitado</option>
          <option value="APPROVED">Aprobado</option>
          <option value="DELIVERED">Entregado</option>
          <option value="RETURNED">Devuelto</option>
          <option value="EXPIRED">Vencido</option>
        </select>
        <label style={{ marginLeft: '1rem' }}>Desde:</label>
        <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); load(); }} />
        <label style={{ marginLeft: '1rem' }}>Hasta:</label>
        <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); load(); }} />
      </div>

      <ul>
        {loans.map((loan) => (
          <li key={loan.id}>
            <Link to={`/loans/${loan.id}`}>
              Usuario: {loan.userId} | Estado: {loan.state}
            </Link>
          </li>
        ))}
      </ul>

    </Layout>
  );
};

export default LoansList;
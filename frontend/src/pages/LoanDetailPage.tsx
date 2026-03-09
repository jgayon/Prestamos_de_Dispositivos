import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLoan } from "../api/loans.api";
import Layout from "../components/Layout";
import LoanStatusActions from "../components/LoanStatusActions";

const LoanDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loan, setLoan] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		setLoading(true);
		getLoan(id)
			.then((res) => setLoan(res.data))
			.catch(() => setLoan(null))
			.finally(() => setLoading(false));
	}, [id]);

	if (loading) return (
		<Layout>
			<p>Cargando...</p>
		</Layout>
	);

	if (!loan) return (
		<Layout>
			<p>Préstamo no encontrado.</p>
			<button onClick={() => navigate('/loans')}>Volver</button>
		</Layout>
	);

	return (
		<Layout>
			<h2>Detalle Préstamo</h2>
			<p><strong>ID:</strong> {loan.id}</p>
			<p><strong>Usuario:</strong> {loan.userId || loan.user?.name}</p>
		<p><strong>Dispositivo:</strong> {loan.deviceId || loan.device?.name}</p>
		<p><strong>Tipo:</strong> {loan.type}</p>
		<p><strong>Estado:</strong> {loan.status || loan.state}</p>
		<p><strong>Inicio:</strong> {loan.startDate ? new Date(loan.startDate).toLocaleDateString() : '-'}</p>
		<p><strong>Fin:</strong> {loan.endDate ? new Date(loan.endDate).toLocaleDateString() : '-'}</p>
				// refresh
				if (!loan.id) return;
				getLoan(loan.id).then(res => setLoan(res.data));
			}} />

			<div style={{ marginTop: 20 }}>
				<button onClick={() => navigate('/loans')}>Volver a lista</button>
			</div>
		</Layout>
	);
};

export default LoanDetailPage;


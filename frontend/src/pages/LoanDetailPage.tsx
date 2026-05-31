import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLoan } from "../api/loans.api";
import Layout from "../components/Layout";
import LoanStatusActions from "../components/LoanStatusActions";
import '../styles/forms.css';

const LoanDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loan, setLoan] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);

	const loadLoan = async () => {
		if (!id) return;
		setLoading(true);
		try {
			const response = await getLoan(id);
			setLoan(response.data);
		} catch (error) {
			console.error('Error loading loan:', error);
			setLoan(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadLoan();
	}, [id]);

	const formatDate = (dateString: string) => {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			'REQUESTED': 'Solicitado',
			'APPROVED': 'Aprobado',
			'DELIVERED': 'Entregado',
			'RETURNED': 'Devuelto',
			'EXPIRED': 'Vencido',
		};
		return labels[status] || status;
	};

	if (loading) return (
		<Layout>
			<div style={{ textAlign: 'center', padding: '40px' }}>
				<p>⏳ Cargando detalles del préstamo...</p>
			</div>
		</Layout>
	);

	if (!loan) return (
		<Layout>
			<div className="form-container" style={{ textAlign: 'center' }}>
				<p style={{ color: '#ef4444' }}>❌ Préstamo no encontrado.</p>
				<button className="btn btn-secondary" onClick={() => navigate('/loans')}>
					← Volver a préstamos
				</button>
			</div>
		</Layout>
	);

	const status = loan.status || loan.state;

	return (
		<Layout>
			<div style={{ maxWidth: '600px', margin: '0 auto' }}>
				<div className="form-container">
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
						<h2 style={{ margin: 0 }}>Detalle del Préstamo</h2>
						<span className={`status-badge ${status?.toLowerCase() || 'requested'}`}>
							{getStatusLabel(status)}
						</span>
					</div>

					<div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
						<div style={{ marginBottom: '16px' }}>
							<p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>ID del Préstamo</p>
							<p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>{loan.id}</p>
						</div>
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
						<div>
							<p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>Usuario</p>
							<p style={{ margin: 0 }}>
								<strong>{loan.user?.name || loan.userId}</strong>
								{loan.user?.email && (
									<div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
										{loan.user.email}
									</div>
								)}
							</p>
						</div>

						<div>
							<p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>Dispositivo</p>
							<p style={{ margin: 0 }}>
								<strong>{loan.device?.name || loan.deviceId}</strong>
							</p>
						</div>

						<div>
							<p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>Tipo</p>
							<p style={{ margin: 0 }}>
								{loan.type === 'LAPTOP' && '💻 Laptop'}
								{loan.type === 'CHARGER' && '🔌 Cargador'}
								{loan.type === 'KIT' && '📦 Kit'}
								{!['LAPTOP', 'CHARGER', 'KIT'].includes(loan.type) && loan.type}
							</p>
						</div>

						<div>
							<p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>Estado</p>
							<p style={{ margin: 0 }}>{getStatusLabel(status)}</p>
						</div>
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
						<div>
							<p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>Fecha de Inicio</p>
							<p style={{ margin: 0 }}>📅 {formatDate(loan.startDate)}</p>
						</div>

						<div>
							<p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>Fecha de Fin</p>
							<p style={{ margin: 0 }}>📅 {formatDate(loan.endDate)}</p>
						</div>
					</div>

					<div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>
						<p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#1a2847' }}>Acciones Disponibles</p>
						<LoanStatusActions
							loanId={loan.id}
							currentState={status}
							onChanged={loadLoan}
						/>
					</div>

					<div className="form-actions">
						<button className="btn btn-secondary" onClick={() => navigate('/loans')}>
							← Volver a Préstamos
						</button>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default LoanDetailPage;


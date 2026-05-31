import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/forms.css';

interface Loan {
	id: string;
	userId: string;
	user?: { id: string; name: string; email: string };
	deviceId: string;
	device?: { id: string; name: string; status: string };
	type: string;
	status?: string;
	state?: string;
	startDate: string;
	endDate: string;
}

interface Props {
	loans: Loan[];
	onStatusChange?: (loanId: string) => void;
	loading?: boolean;
}

const LoanTable: React.FC<Props> = ({ loans, onStatusChange, loading }) => {
	const getStatusBadgeClass = (status: string) => {
		const state = status?.toLowerCase() || '';
		if (state === 'requested') return 'requested';
		if (state === 'approved') return 'approved';
		if (state === 'delivered') return 'delivered';
		if (state === 'returned') return 'returned';
		if (state === 'expired') return 'expired';
		return 'requested';
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
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

	if (loans.length === 0) {
		return (
			<div className="empty-state">
				<p>No hay préstamos disponibles</p>
			</div>
		);
	}

	return (
		<div className="table-container">
			<table className="table">
				<thead>
					<tr>
						<th>Usuario</th>
						<th>Dispositivo</th>
						<th>Tipo</th>
						<th>Fecha Inicio</th>
						<th>Fecha Fin</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{loans.map((loan) => {
						const status = loan.status || loan.state;
						const userName = loan.user?.name || loan.userId;
						const deviceName = loan.device?.name || loan.deviceId;

						return (
							<tr key={loan.id}>
								<td>
									<strong>{userName}</strong>
									{loan.user?.email && (
										<div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
											{loan.user.email}
										</div>
									)}
								</td>
								<td>{deviceName}</td>
								<td>
									{loan.type === 'LAPTOP' && '💻 Laptop'}
									{loan.type === 'CHARGER' && '🔌 Cargador'}
									{loan.type === 'KIT' && '📦 Kit'}
									{!['LAPTOP', 'CHARGER', 'KIT'].includes(loan.type) && loan.type}
								</td>
								<td>{formatDate(loan.startDate)}</td>
								<td>{formatDate(loan.endDate)}</td>
								<td>
									<span className={`status-badge ${getStatusBadgeClass(status)}`}>
										{getStatusLabel(status)}
									</span>
								</td>
								<td>
									<div className="table-actions">
										<Link
											to={`/loans/${loan.id}`}
											className="table-action-btn view"
										>
											👁️ Ver
										</Link>
									</div>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default LoanTable;

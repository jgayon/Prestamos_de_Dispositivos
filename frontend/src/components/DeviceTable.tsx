import React, { useState } from 'react';
import '../styles/forms.css';

interface Device {
	id: string;
	name: string;
	status: string;
	createdAt?: string;
}

interface Props {
	devices: Device[];
	onEdit?: (device: Device) => void;
	onDelete?: (deviceId: string) => void;
	onChangeStatus?: (deviceId: string, newStatus: string) => void;
	loading?: boolean;
}

const DeviceTable: React.FC<Props> = ({ devices, onEdit, onDelete, onChangeStatus, loading }) => {

	const getStatusBadgeClass = (status: string) => {
		const s = status?.toUpperCase() || '';
		if (s === 'AVAILABLE') return 'available';
		if (s === 'LOANED') return 'in-use';
		return 'available';
	};

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			AVAILABLE: 'Disponible',
			LOANED: 'Prestado',
		};
		return labels[status] || status;
	};

	const getNextStatus = (currentStatus: string,): { status: string; label: string } | null => {

		const transitions: Record<
			string,
			{ status: string; label: string }
		> = {
			AVAILABLE: {
				status: 'LOANED',
				label: 'Marcar Prestado',
			},

			LOANED: {
				status: 'AVAILABLE',
				label: 'Marcar Disponible',
			},
		};

		return transitions[currentStatus] || null;
	};

	const handleChangeStatus = (deviceId: string, newStatus: string) => {
		if (onChangeStatus) {
			onChangeStatus(deviceId, newStatus);
		}
	};

	if (devices.length === 0) {
		return (
			<div className="empty-state">
				<p>📦 No hay dispositivos registrados</p>
			</div>
		);
	}

	return (
		<div className="table-container">
			<table className="table">
				<thead>
					<tr>
						<th>Nombre</th>
						<th>Estado</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{devices.map((device) => {
						const nextStatus = getNextStatus(device.status);
						return (
							<tr key={device.id}>
								<td>
									<strong>{device.name}</strong>
								</td>
								<td>
									<span className={`status-badge ${getStatusBadgeClass(device.status)}`}>
										{getStatusLabel(device.status)}
									</span>
								</td>
								<td>
									<div className="table-actions">
										{nextStatus && (
											<button
												className="table-action-btn status"
												onClick={() => handleChangeStatus(device.id, nextStatus.status)}
												disabled={loading}
												title={`Cambiar a ${nextStatus.label}`}
											>
												🔄 {nextStatus.label}
											</button>
										)}
										{onEdit && (
											<button
												className="table-action-btn edit"
												onClick={() => onEdit(device)}
												disabled={loading}
											>
												✏️ Editar
											</button>
										)}
										{onDelete && (
											<button
												className="table-action-btn delete"
												onClick={() => {
													if (window.confirm(`¿Eliminar dispositivo "${device.name}"?`)) {
														onDelete(device.id);
													}
												}}
												disabled={loading}
											>
												🗑️ Eliminar
											</button>
										)}
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

export default DeviceTable;

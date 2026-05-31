import React, { useEffect, useState } from 'react';
import { getUsers } from '../api/users.api';
import { getAvailableDevices } from '../api/devices.api';
import { createLoan } from '../api/loans.api';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import '../styles/forms.css';

const LoanForm: React.FC = () => {
	const [users, setUsers] = useState<any[]>([]);
	const [devices, setDevices] = useState<any[]>([]);
	const [userId, setUserId] = useState('');
	const [deviceId, setDeviceId] = useState('');
	const [type, setType] = useState('LAPTOP');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});
	const navigate = useNavigate();

	useEffect(() => {
		const loadData = async () => {
			try {
				const usersRes = await getUsers().catch(() => ({ data: [] }));
				const devicesRes = await getAvailableDevices().catch(() => ({ data: [] }));
				setUsers(usersRes.data || []);
				setDevices(devicesRes.data || []);
			} catch (err) {
				console.error('Error loading data:', err);
				setError('Error al cargar los datos');
			}
		};
		loadData();
	}, []);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!userId.trim()) {
			newErrors.userId = 'El usuario es requerido';
		}
		if (!deviceId.trim()) {
			newErrors.deviceId = 'El dispositivo/kit es requerido';
		}
		if (!startDate.trim()) {
			newErrors.startDate = 'La fecha de inicio es requerida';
		}
		if (!endDate.trim()) {
			newErrors.endDate = 'La fecha de fin es requerida';
		}

		const start = new Date(startDate);
		const end = new Date(endDate);
		if (start >= end) {
			newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (start < today) {
			newErrors.startDate = 'La fecha de inicio no puede ser en el pasado';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		try {
			await createLoan({ userId, deviceId, type, startDate, endDate });
			setSuccess('¡Préstamo creado exitosamente!');
			setTimeout(() => navigate('/loans'), 1500);
		} catch (err: any) {
			const errorMsg = err.response?.data?.message || err.message || 'Error creando préstamo';
			console.error(err);
			setError(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="form-container">
			<h2>Crear Nuevo Préstamo</h2>

			{error && <ErrorMessage message={error} />}
			{success && <div className="form-success">✓ {success}</div>}

			<form onSubmit={submit}>
				<div className="form-group">
					<label htmlFor="userId">Usuario *</label>
					<select
						id="userId"
						value={userId}
						onChange={e => setUserId(e.target.value)}
						disabled={loading}
						style={{ borderColor: errors.userId ? '#dc2626' : undefined }}
					>
						<option value="">Seleccione un usuario</option>
						{users.map(u => (
							<option key={u.id} value={u.id}>
								{u.name} ({u.email})
							</option>
						))}
					</select>
					{errors.userId && <div className="form-error">{errors.userId}</div>}
				</div>

				<div className="form-group">
					<label htmlFor="deviceId">Dispositivo/Kit *</label>
					<select
						id="deviceId"
						value={deviceId}
						onChange={e => setDeviceId(e.target.value)}
						disabled={loading}
						style={{ borderColor: errors.deviceId ? '#dc2626' : undefined }}
					>
						<option value="">Seleccione un dispositivo</option>
						{devices.map(d => (
							<option key={d.id} value={d.id}>
								{d.name}
							</option>
						))}
					</select>
					{errors.deviceId && <div className="form-error">{errors.deviceId}</div>}
				</div>

				<div className="form-group">
					<label htmlFor="type">Tipo de Dispositivo</label>
					<select
						id="type"
						value={type}
						onChange={e => setType(e.target.value)}
						disabled={loading}
					>
						<option value="LAPTOP">Laptop</option>
						<option value="CHARGER">Cargador</option>
						<option value="KIT">Kit</option>
					</select>
				</div>

				<div className="form-group">
					<label htmlFor="startDate">Fecha de Inicio *</label>
					<input
						id="startDate"
						type="date"
						value={startDate}
						onChange={e => setStartDate(e.target.value)}
						disabled={loading}
						style={{ borderColor: errors.startDate ? '#dc2626' : undefined }}
					/>
					{errors.startDate && <div className="form-error">{errors.startDate}</div>}
				</div>

				<div className="form-group">
					<label htmlFor="endDate">Fecha de Fin *</label>
					<input
						id="endDate"
						type="date"
						value={endDate}
						onChange={e => setEndDate(e.target.value)}
						disabled={loading}
						style={{ borderColor: errors.endDate ? '#dc2626' : undefined }}
					/>
					{errors.endDate && <div className="form-error">{errors.endDate}</div>}
				</div>

				<div className="form-actions">
					<button
						type="submit"
						className="btn btn-primary"
						disabled={loading}
					>
						{loading ? (
							<>
								<LoadingSpinner /> Creando...
							</>
						) : (
							'✓ Crear Préstamo'
						)}
					</button>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => navigate('/loans')}
						disabled={loading}
					>
						← Cancelar
					</button>
				</div>
			</form>
		</div>
	);
};

export default LoanForm;

import React, { useEffect, useState } from 'react';
import { getUsers } from '../api/users.api';
import { getAvailableDevices } from '../api/devices.api';
import { createLoan } from '../api/loans.api';
import { useNavigate } from 'react-router-dom';

const LoanForm: React.FC = () => {
	const [users, setUsers] = useState<any[]>([]);
	const [devices, setDevices] = useState<any[]>([]);
	const [userId, setUserId] = useState('');
	const [deviceId, setDeviceId] = useState('');
	const [type, setType] = useState('LAPTOP');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		getUsers().then(res => setUsers(res.data)).catch(() => setUsers([]));
		// only query available devices when choosing for a loan
		getAvailableDevices().then(res => setDevices(res.data)).catch(() => setDevices([]));
	}, []);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await createLoan({ userId, deviceId, type, startDate, endDate });
			navigate('/loans');
		} catch (err) {
			console.error(err);
			alert('Error creando préstamo');
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={submit}>
			<div>
				<label>Usuario</label>
				<select value={userId} onChange={e => setUserId(e.target.value)} required>
					<option value="">Seleccione</option>
					{users.map(u => (
						<option key={u.id} value={u.id}>{u.name} ({u.email})</option>
					))}
				</select>
			</div>

			<div>
				<label>Dispositivo/Kit</label>
				<select value={deviceId} onChange={e => setDeviceId(e.target.value)} required>
					<option value="">Seleccione</option>
					{devices.map(d => (
						<option key={d.id} value={d.id}>{d.name} - {d.status}</option>
					))}
				</select>
			</div>

			<div>
				<label>Tipo</label>
				<select value={type} onChange={e => setType(e.target.value)}>
					<option value="LAPTOP">Laptop</option>
					<option value="CHARGER">Charger</option>
					<option value="KIT">Kit</option>
				</select>
			</div>

			<div>
				<label>Fecha inicio</label>
				<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
			</div>

			<div>
				<label>Fecha fin</label>
				<input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
			</div>

			<button type="submit" disabled={loading}>
				{loading ? 'Creando...' : 'Crear Préstamo'}
			</button>
		</form>
	);
};

export default LoanForm;

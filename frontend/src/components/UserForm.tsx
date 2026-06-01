import React, { useState } from 'react';
import { createUser } from '../api/users.api';
import type { UserRole } from '../types/User';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import '../styles/forms.css';

interface Props {
	onSuccess?: () => void;
	onCancel?: () => void;
}

const UserForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [role, setRole] = useState<UserRole>('USER');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!name.trim()) {
			newErrors.name = 'El nombre es requerido';
		}
		if (!email.trim()) {
			newErrors.email = 'El email es requerido';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = 'El email no es válido';
		}
		if (!password.trim()) {
			newErrors.password = 'La contraseña es requerida';
		} else if (password.length < 6) {
			newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		try {
			await createUser({
				name: name.trim(),
				email: email.trim(),
				password: password.trim(),
				role,
			});
			setSuccess('✓ Usuario creado exitosamente');
			setName('');
			setEmail('');
			setPassword('');
			setRole('USER');
			setTimeout(() => {
				setSuccess('');
				if (onSuccess) onSuccess();
			}, 1500);
		} catch (err: any) {
			const errorMsg = err.response?.data?.message || err.message || 'Error creando usuario';
			setError(errorMsg);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="form-container">
			<h3>Crear Nuevo Usuario</h3>

			{error && <ErrorMessage message={error} />}
			{success && <div className="form-success">{success}</div>}

			<div className="form-group">
				<label htmlFor="name">Nombre Completo *</label>
				<input
					id="name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Ej: Juan García"
					disabled={loading}
					style={{ borderColor: errors.name ? '#dc2626' : undefined }}
				/>
				{errors.name && <div className="form-error">{errors.name}</div>}
			</div>

			<div className="form-group">
				<label htmlFor="email">Email *</label>
				<input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="Ej: juan@example.com"
					disabled={loading}
					style={{ borderColor: errors.email ? '#dc2626' : undefined }}
				/>
				{errors.email && <div className="form-error">{errors.email}</div>}
			</div>

			<div className="form-group">
				<label htmlFor="password">Contraseña *</label>
				<input
					id="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Mínimo 6 caracteres"
					disabled={loading}
					style={{ borderColor: errors.password ? '#dc2626' : undefined }}
				/>
				{errors.password && <div className="form-error">{errors.password}</div>}
				<p className="form-hint">Esta contraseña se usará para iniciar sesión en la plataforma.</p>
			</div>

			<div className="form-group">
				<label htmlFor="role">Tipo de usuario *</label>
				<select
					id="role"
					value={role}
					onChange={(e) => setRole(e.target.value as UserRole)}
					disabled={loading}
				>
					<option value="USER">Usuario (solicita préstamos)</option>
					<option value="ADMIN">Administrador</option>
				</select>
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
						'✓ Crear Usuario'
					)}
				</button>
				{onCancel && (
					<button
						type="button"
						className="btn btn-secondary"
						onClick={onCancel}
						disabled={loading}
					>
						✕ Cancelar
					</button>
				)}
			</div>
		</form>
	);
};

export default UserForm;

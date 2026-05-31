import React, { useState } from 'react';
import '../styles/forms.css';

interface User {
	id: string;
	name: string;
	email: string;
	createdAt?: string;
}

interface Props {
	users: User[];
	onEdit?: (user: User) => void;
	onDelete?: (userId: string) => void;
	loading?: boolean;
}

const UserTable: React.FC<Props> = ({ users, onEdit, onDelete, loading }) => {
	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(part => part[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	if (users.length === 0) {
		return (
			<div className="empty-state">
				<p>👥 No hay usuarios registrados</p>
			</div>
		);
	}

	return (
		<div className="table-container">
			<table className="table">
				<thead>
					<tr>
						<th>Usuario</th>
						<th>Email</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{users.map((user) => (
						<tr key={user.id}>
							<td>
								<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
									<div
										style={{
											width: '36px',
											height: '36px',
											borderRadius: '50%',
											backgroundColor: '#FF8C42',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											color: 'white',
											fontWeight: '600',
											fontSize: '0.875rem',
											flexShrink: 0
										}}
									>
										{getInitials(user.name)}
									</div>
									<strong>{user.name}</strong>
								</div>
							</td>
							<td>
								<a href={`mailto:${user.email}`} style={{ color: '#FF8C42', textDecoration: 'none' }}>
									{user.email}
								</a>
							</td>
							<td>
								<div className="table-actions">
									{onEdit && (
										<button
											className="table-action-btn edit"
											onClick={() => onEdit(user)}
											disabled={loading}
										>
											✏️ Editar
										</button>
									)}
									{onDelete && (
										<button
											className="table-action-btn delete"
											onClick={() => {
												if (window.confirm(`¿Eliminar usuario "${user.name}"?`)) {
													onDelete(user.id);
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
					))}
				</tbody>
			</table>
		</div>
	);
};

export default UserTable;

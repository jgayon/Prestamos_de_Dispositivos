import React, { useState } from 'react';
import { changeLoanState } from '../api/loans.api';

type Props = {
	loanId: string;
	currentState: string;
	onChanged?: () => void;
};

const LoanStatusActions: React.FC<Props> = ({ loanId, currentState, onChanged }) => {
	const [loading, setLoading] = useState(false);

	const handleAction = async (action: 'approve' | 'deliver' | 'return' | 'expire') => {
		try {
			setLoading(true);
			await changeLoanState(loanId, action);
			if (onChanged) onChanged();
		} catch (err) {
			console.error(err);
			alert('Error al cambiar el estado');
		} finally {
			setLoading(false);
		}
	};

	// Allowed actions per state
	const actions = {
		REQUESTED: ['approve', 'expire'],
		APPROVED: ['deliver', 'expire'],
		DELIVERED: ['return', 'expire'],
		RETURNED: [],
		EXPIRED: [],
	} as Record<string, string[]>;

	const allowed = actions[currentState] || [];

	if (allowed.length === 0) return <div>No hay acciones disponibles</div>;

	return (
		<div>
			{allowed.includes('approve') && (
				<button disabled={loading} onClick={() => handleAction('approve')}>Aprobar</button>
			)}
			{allowed.includes('deliver') && (
				<button disabled={loading} onClick={() => handleAction('deliver')}>Entregar</button>
			)}
			{allowed.includes('return') && (
				<button disabled={loading} onClick={() => handleAction('return')}>Devolver</button>
			)}
			{allowed.includes('expire') && (
				<button disabled={loading} onClick={() => handleAction('expire')}>Marcar vencido</button>
			)}
		</div>
	);
};

export default LoanStatusActions;

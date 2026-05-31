import React, { useState } from 'react';
import { changeLoanState } from '../api/loans.api';
import '../styles/forms.css';

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

	if (allowed.length === 0) {
		return (
			<div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', textAlign: 'center', color: '#9ca3af' }}>
				No hay acciones disponibles
			</div>
		);
	}

	return (
		<div className="table-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
			{allowed.includes('approve') && (
				<button
					className="table-action-btn status"
					disabled={loading}
					onClick={() => handleAction('approve')}
				>
					✓ Aprobar
				</button>
			)}
			{allowed.includes('deliver') && (
				<button
					className="table-action-btn status"
					disabled={loading}
					onClick={() => handleAction('deliver')}
				>
					📦 Entregar
				</button>
			)}
			{allowed.includes('return') && (
				<button
					className="table-action-btn status"
					disabled={loading}
					onClick={() => handleAction('return')}
				>
					↩️ Devolver
				</button>
			)}
			{allowed.includes('expire') && (
				<button
					className="table-action-btn delete"
					disabled={loading}
					onClick={() => handleAction('expire')}
				>
					⏱️ Vencer
				</button>
			)}
		</div>
	);
};

export default LoanStatusActions;

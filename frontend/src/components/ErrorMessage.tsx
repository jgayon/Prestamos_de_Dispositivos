import React from 'react';

interface Props {
  message: string;
}

const ErrorMessage: React.FC<Props> = ({ message }) => {
  return (
    <div style={{
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '16px',
      border: '1px solid #fecaca',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span>❌</span>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;

import React from 'react';

interface StatsCardProps {
  icon: string;
  number: number | string;
  label: string;
  description?: string;
  color?: 'blue' | 'green' | 'red' | 'orange';
  alert?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  number,
  label,
  description,
  color = 'blue',
  alert = false,
}) => {
  const colorClasses: Record<string, { border: string; bg: string; number: string }> = {
    blue: { border: '#3b82f6', bg: '#eff6ff', number: '#1e40af' },
    green: { border: '#10b981', bg: '#ecfdf5', number: '#065f46' },
    red: { border: '#ef4444', bg: '#fef2f2', number: '#991b1b' },
    orange: { border: '#f59e0b', bg: '#fffbeb', number: '#92400e' },
  };

  const c = colorClasses[color];

  return (
    <div
      style={{
        background: white,
        borderRadius: '8px',
        border: `3px solid ${c.border}`,
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0 0 4px 0' }}>
            {label}
          </p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: c.number }}>
            {number}
          </h3>
          {description && (
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0 0 0' }}>
              {description}
            </p>
          )}
        </div>
        <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      </div>
      {alert && (
        <div
          style={{
            display: 'inline-block',
            background: '#ef4444',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 600,
            marginTop: '12px',
          }}
        >
          ALERTA
        </div>
      )}
    </div>
  );
};

export default StatsCard;

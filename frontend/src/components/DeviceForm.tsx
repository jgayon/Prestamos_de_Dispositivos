import React, { useState } from 'react';
import { useDevices } from '../hooks/useDevices';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

const DeviceForm: React.FC = () => {
  const { create, loading, error } = useDevices();
  const [name, setName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!name.trim()) {
      return;
    }

    try {
      await create({ name: name.trim() });
      setName('');
      setSuccessMessage('Dispositivo creado exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error creating device:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h3>Crear Nuevo Dispositivo</h3>

      {error && <ErrorMessage message={error} />}
      {successMessage && <div style={{ color: 'green', marginBottom: '10px' }}>{successMessage}</div>}

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="deviceName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Nombre del Dispositivo
        </label>
        <input
          id="deviceName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Laptop Dell XPS 13"
          required
          disabled={loading}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !name.trim()}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
        }}
      >
        {loading ? <LoadingSpinner /> : 'Crear Dispositivo'}
      </button>
    </form>
  );
};

export default DeviceForm;

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import DeviceTable from '../components/DeviceTable';
import DeviceForm from '../components/DeviceForm';
import { getDevices, updateDevice, deleteDevice } from '../api/devices.api';
import '../styles/forms.css';

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadDevices = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDevices();
      setDevices(response.data || []);
    } catch (err: any) {
      setError('Error al cargar dispositivos');
      console.error(err);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleChangeStatus = async (deviceId: string, newStatus: string) => {
    setLoading(true);
    try {
      await updateDevice(deviceId, { status: newStatus });
      await loadDevices();
    } catch (err: any) {
      setError('Error al actualizar dispositivo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deviceId: string) => {
    setLoading(true);
    try {
      await deleteDevice(deviceId);
      await loadDevices();
    } catch (err: any) {
      setError('Error al eliminar dispositivo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceCreated = () => {
    setShowForm(false);
    loadDevices();
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Dispositivos</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cerrar' : '➕ Nuevo Dispositivo'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '16px',
          border: '1px solid #fecaca'
        }}>
          ❌ {error}
        </div>
      )}

      {showForm && (
        <div style={{ marginBottom: '24px' }}>
          <DeviceForm />
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>⏳ Cargando dispositivos...</p>
        </div>
      ) : (
        <DeviceTable
          devices={devices}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDelete}
          loading={loading}
        />
      )}
    </Layout>
  );
};

export default DevicesPage;

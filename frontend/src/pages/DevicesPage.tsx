import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getDevices } from '../api/devices.api';

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDevices()
      .then((res) => {
        setDevices(res.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1>Dispositivos</h1>

      {loading ? (
        <p>Cargando dispositivos...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((device) => (
              <tr key={device.id}>
                <td>{device.id}</td>
                <td>{device.name}</td>
                <td>{device.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default DevicesPage;

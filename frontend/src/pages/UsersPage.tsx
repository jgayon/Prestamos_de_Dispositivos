import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getUsers } from '../api/users.api';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then((res) => {
        setUsers(res.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1>Usuarios</h1>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default UsersPage;
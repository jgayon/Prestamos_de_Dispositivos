import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm';
import { useUsers } from '../hooks/useUsers';
import '../styles/forms.css';

const UsersPage: React.FC = () => {
  const { users, loading, error, fetchUsers, remove } = useUsers();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    try {
      await remove(userId);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleUserCreated = () => {
    setShowForm(false);
    fetchUsers();
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Usuarios</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? '✕ Cerrar' : '➕ Nuevo Usuario'}
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
          <UserForm onSuccess={handleUserCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>⏳ Cargando usuarios...</p>
        </div>
      ) : (
        <UserTable
          users={users}
          onDelete={handleDelete}
          loading={loading}
        />
      )}
    </Layout>
  );
};

export default UsersPage;
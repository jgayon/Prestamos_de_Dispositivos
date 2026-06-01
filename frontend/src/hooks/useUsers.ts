import { useState, useCallback } from 'react';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../api/users.api';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'ADMIN' | 'USER';
  createdAt?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error fetching users';
      setError(errorMsg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async (id: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUser(id);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching user');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    role?: 'ADMIN' | 'USER';
  }): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await createUser(data);
      await fetchUsers();
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error creating user';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const update = useCallback(async (id: string, data: { name?: string; email?: string }): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateUser(id, data);
      await fetchUsers();
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error updating user';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const remove = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteUser(id);
      await fetchUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error deleting user';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUser,
    create,
    update,
    remove,
  };
};

export default useUsers;

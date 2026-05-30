import { useState, useCallback } from 'react';
import {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  getAvailableDevices,
} from '../api/devices.api';
import { Device, CreateDeviceDTO, UpdateDeviceDTO } from '../types/Device';

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDevices();
      setDevices(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching devices');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAvailableDevices();
      setDevices(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching available devices');
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDevice = useCallback(async (id: string): Promise<Device | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDevice(id);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching device');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateDeviceDTO): Promise<Device | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await createDevice(data);
      await fetchDevices();
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error creating device';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  const update = useCallback(async (id: string, data: UpdateDeviceDTO): Promise<Device | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateDevice(id, data);
      await fetchDevices();
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error updating device';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  const remove = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await deleteDevice(id);
      await fetchDevices();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error deleting device';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  return {
    devices,
    loading,
    error,
    fetchDevices,
    fetchAvailable,
    fetchDevice,
    create,
    update,
    remove,
  };
};

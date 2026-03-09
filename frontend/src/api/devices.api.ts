import api from "./api";

export const getDevices = () => api.get("/devices");

export const getDevice = (id: string) => api.get(`/devices/${id}`);

export const createDevice = (data: any) => api.post("/devices", data);

export const updateDevice = (id: string, data: any) => api.put(`/devices/${id}`, data);

export const deleteDevice = (id: string) => api.delete(`/devices/${id}`);

export const getAvailableDevices = () => api.get("/devices/disponibles");
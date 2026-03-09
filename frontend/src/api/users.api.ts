import api from "./api";

export const getUsers = () => api.get("/users");

export const getUser = (id: string) => api.get(`/users/${id}`);

export const createUser = (data: any) => api.post("/users", data);

export const updateUser = (id: string, data: any) => api.put(`/users/${id}`, data);

export const deleteUser = (id: string) => api.delete(`/users/${id}`);
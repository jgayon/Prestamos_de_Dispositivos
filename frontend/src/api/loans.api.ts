import api from "./api";

export const getLoans = (query?: string) => {
  const path = query ? `/loans?${query}` : "/loans";
  return api.get(path);
};

export const getLoan = (id: string) => api.get(`/loans/${id}`);

export const createLoan = (data: any) => api.post("/loans", data);

export const updateLoan = (id: string, data: any) =>
  api.put(`/loans/${id}`, data);

// The backend exposes specific PATCH endpoints for state transitions:
// /loans/:id/approve, /loans/:id/deliver, /loans/:id/return, /loans/:id/expire
export const changeLoanState = (id: string, action: 'approve' | 'deliver' | 'return' | 'expire') => {
  const allowed = ['approve', 'deliver', 'return', 'expire'];
  if (allowed.indexOf(action) === -1) {
    throw new Error('Invalid loan action');
  }

  return api.patch(`/loans/${id}/${action}`);
};
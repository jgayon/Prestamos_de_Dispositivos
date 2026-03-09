import axios from "axios";

// Use Vite env var (import.meta.env) and provide a default
const baseURL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
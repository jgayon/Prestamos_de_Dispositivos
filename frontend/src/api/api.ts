import axios, { AxiosError, AxiosResponse } from "axios";

// Use Vite env var (import.meta.env) and provide a default
const baseURL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos de timeout
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Error en interceptor de request:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas y errores
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as any;

    // Si es timeout, reintentar hasta 2 veces
    if (error.code === "ECONNABORTED" && !config._retries) {
      config._retries = 1;
      console.warn(`⏱️ Timeout en ${config.method?.toUpperCase()} ${config.url}. Reintentando...`);
      return api(config);
    }

    if (error.response?.status === 401) {
      // No autorizado - limpiar token y redirigir a login
      localStorage.removeItem("token");
      window.location.href = "/login";
      console.error("❌ Sesión expirada. Redirigiendo a login.");
    }

    // Log detallado de errores
    const errorMessage =
      error.response?.data?.message ||
      error.response?.statusText ||
      error.message ||
      "Error desconocido";

    const errorCode =
      error.response?.status ||
      error.code ||
      "SIN_CÓDIGO";

    console.error(`❌ Error API [${errorCode}]: ${errorMessage}`);
    console.error(`   Método: ${config?.method?.toUpperCase()}`);
    console.error(`   URL: ${config?.url}`);

    // Propagar error original
    return Promise.reject(error);
  }
);

export default api;
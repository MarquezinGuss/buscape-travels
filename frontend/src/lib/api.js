// src/lib/api.js
// Instância do Axios configurada + todas as funções de chamada à API

import axios from "axios";

// Cria a instância do Axios apontando para o backend
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Interceptor: injeta o token JWT em toda requisição ───
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@buscape:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor: redireciona para login se 401 ───────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("@buscape:token");
      localStorage.removeItem("@buscape:user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// ═══════════════════════════════════════════════════════════
// VIAGENS
// ═══════════════════════════════════════════════════════════
export const tripAPI = {
  create: (data) => api.post("/trips", data),
  list: () => api.get("/trips"),
  getById: (id) => api.get(`/trips/${id}`),
  addMember: (tripId, email) => api.post(`/trips/${tripId}/members`, { email }),
  delete: (id) => api.delete(`/trips/${id}`),
};

// ═══════════════════════════════════════════════════════════
// GASTOS
// ═══════════════════════════════════════════════════════════
export const expenseAPI = {
  create: (data) => api.post("/expenses", data),
  listByTrip: (tripId) => api.get(`/expenses/${tripId}`),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// ═══════════════════════════════════════════════════════════
// PAGAMENTOS
// ═══════════════════════════════════════════════════════════
export const paymentAPI = {
  markAsPaid: (id) => api.patch(`/payments/${id}/pay`),
  markAsUnpaid: (id) => api.patch(`/payments/${id}/unpay`),
  getMyPayments: (tripId) => api.get(`/payments/user/${tripId}`),
};

export default api;

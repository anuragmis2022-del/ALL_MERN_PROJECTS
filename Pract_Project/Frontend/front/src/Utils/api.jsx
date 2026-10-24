import axios from "axios";

// Change only these URLs when deploying to another service.
export const BACKEND_URLS = {
  local: "http://localhost:8080",
  deployed: "https://teamflow-backend-q60o.onrender.com",
};

// Vite uses the local API during local development and Render API in production.
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? BACKEND_URLS.local : BACKEND_URLS.deployed)
).replace(/\/$/, "").replace(/\/api$/, "");

const api = axios.create({ baseURL: BACKEND_URL, withCredentials: true });
export default api;

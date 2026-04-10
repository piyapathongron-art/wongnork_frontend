import axios from "axios";

const PORT = 3000;

export const mainApi = axios.create({
  baseURL: `http://localhost:${PORT}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

mainApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export async function apiLogin(body) {
  return await mainApi.post("/auth/login", body);
}

export async function apiRegister(body) {
  return await mainApi.post("/auth/register", body);
}

export async function apiCloudinary() {
  return await mainApi.get("/get-signature");
}

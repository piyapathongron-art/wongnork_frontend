import axios from "axios";
import useUserStore from "../stores/userStore";

const PORT = 8899;

export const mainApi = axios.create({
  baseURL: `http://localhost:${PORT}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

mainApi.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
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

export async function apiCloudinary(folder = "wongnork") {
  return await mainApi.get(`/cloudinary/get-signature?folder=${folder}`);
}

export async function apiGetme() {
  return await mainApi.get("/auth/me")
}

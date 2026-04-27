import axios from "axios";
import useUserStore from "../stores/userStore";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const mainApi = axios.create({
  baseURL: `${BACKEND_URL}`,
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

export async function apiGoogle(body) {
  return await mainApi.post("/auth/google", body);
}

export async function apiRegister(body) {
  return await mainApi.post("/auth/register", body);
}

export async function apiCloudinary(folder = "wongnork") {
  return await mainApi.get(`/cloudinary/get-signature?folder=${folder}`);
}

export async function apiGetme() {
  return await mainApi.get("/auth/me");
}

export async function apiUpdateProfile(body) {
  return await mainApi.put("/auth/profile", body); // ใช้ PATCH หรือ PUT ตามที่หลังบ้านกำหนด
}

export async function apiGetPublicProfile(id) {
  return await mainApi.get("/auth/profile/" + id);
}

// ฟังก์ชันสำหรับ Toggle Save Restaurant
export async function apiToggleSaveRestaurant(restaurantId) {
  return await mainApi.post(`/restaurants/${restaurantId}/save`);
}

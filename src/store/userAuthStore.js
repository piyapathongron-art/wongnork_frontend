import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  // Action สำหรับเก็บข้อมูลเมื่อ Login สำเร็จ
  login: (userData, token) =>
    set({
      user: userData,
      token: token,
      isAuthenticated: true,
    }),

  // Action สำหรับ Logout
  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    }),
}));

export default useAuthStore;

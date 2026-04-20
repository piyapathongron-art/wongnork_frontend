import { createJSONStorage, persist } from "zustand/middleware";
import { apiGoogle, apiLogin, apiRegister } from "../api/mainApi";
import { create } from "zustand";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLogin: false,
      login: async (body) => {
        const resp = await apiLogin(body);
        console.log(resp);
        set({ user: resp.data.user, token: resp.data.token, isLogin: true });
        return resp;
      },
      googleLogin: async (body) => {
        const {user,token} = body
        set({ user:user, token:token, isLogin: true });
        
      },
      register: async (body) => {
        const resp = await apiRegister(body);
        return resp;
      },
      logout: async () => {
        set({ user: null, token: null, isLogin: false });
      },
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useUserStore;

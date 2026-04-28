import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../validations/schema";
import useUserStore from "../stores/userStore";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import axios from "axios";

export const useAuthLogic = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const login = useUserStore((state) => state.login);
  const googleLogin = useUserStore((state) => state.googleLogin);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submitLogin = async (data) => {
    try {
      await login(data);
      toast.success("Login สำเร็จ");
      navigate("/");
    } catch (err) {
      console.log("API Error Response:", err.response);
      const status = err.response?.status;
      const errMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login ล้มเหลว";
      if (status === 403 || errMessage.toLowerCase().includes("verify")) {
        setShowVerifyModal(true);
      } else {
        toast.error(errMessage);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      // 1. 🟢 ต้องยิง API ไปหา Backend ก่อนเพื่อเอาข้อมูล User และ Token ของระบบเรา
      const response = await axios.post(
        `${BACKEND_URL}/auth/google`,
        { token: idToken },
      );

      // 2. 🟢 เมื่อได้ response มาแล้ว ค่อยดึงค่าออกมาพักไว้ในตัวแปร
      // จุดนี้ห้ามสลับขึ้นไปไว้ก่อนบรรทัด axios.post เด็ดขาด
      const { token, user } = response.data;

      // 3. 🟢 นำตัวแปร token และ user ที่ได้จากข้อ 2 ส่งเข้า Store
      // Error เกิดเพราะบรรทัดนี้อาจจะอยู่สูงกว่าบรรทัดที่ 2 ในโค้ดของคุณ
      await googleLogin({ user, token });

      toast.success("เข้าสู่ระบบด้วย Google สำเร็จ!");
      navigate("/");
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("เข้าสู่ระบบด้วย Google ล้มเหลว กรุณาลองใหม่");
    }
  };

  return {
    form,
    showPassword,
    setShowPassword,
    showVerifyModal,
    setShowVerifyModal,
    submitLogin,
    handleGoogleSuccess,
    navigate,
  };
};

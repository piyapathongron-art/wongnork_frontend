import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import useUserStore from "../stores/userStore";
import { registerSchema } from "../validations/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

export const useRegisterLogic = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const registerUser = useUserStore((state) => state.register);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "", // 🌟 แก้ให้ตรงกับช่องกรอก
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success("ลงทะเบียนสำเร็จ โปรดตรวจสอบ Email เพื่อยืนยันตัวตน");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.error || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  return {
    form,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    onSubmit,
    navigate,
  };
};

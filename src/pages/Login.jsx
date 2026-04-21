import React, { use, useState,useEffect } from "react";
import { useForm } from "react-hook-form";
import useUserStore from "../stores/userStore";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate,useLocation } from "react-router";
import { loginSchema } from "../validations/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const login = useUserStore((state) => state.login);
  const googleLogin = useUserStore((state) => state.googleLogin)

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });



  const submitLogin = async (data) => {
    try {
      new Promise((resolve) => setTimeout(resolve, 5000));
      const resp = await login(data);
      toast.success("Login สำเร็จ");
      navigate("/")
    } catch (err) {
      console.dir(err.response?.data);
      const errMessage = err.response?.data.error;
      toast.error(errMessage);
    }
  };

 const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;

      // 1. 🟢 ต้องยิง API ไปหา Backend ก่อนเพื่อเอาข้อมูล User และ Token ของระบบเรา
      const response = await axios.post("http://localhost:8899/api/auth/google", {
        token: idToken,
      });

      // 2. 🟢 เมื่อได้ response มาแล้ว ค่อยดึงค่าออกมาพักไว้ในตัวแปร
      // จุดนี้ห้ามสลับขึ้นไปไว้ก่อนบรรทัด axios.post เด็ดขาด
      const { token, user } = response.data;

      // 3. 🟢 นำตัวแปร token และ user ที่ได้จากข้อ 2 ส่งเข้า Store
      // Error เกิดเพราะบรรทัดนี้อาจจะอยู่สูงกว่าบรรทัดที่ 2 ในโค้ดของคุณ
      await googleLogin({ user: user, token: token });

      toast.success("เข้าสู่ระบบด้วย Google สำเร็จ!");
      navigate("/");
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error("เข้าสู่ระบบด้วย Google ล้มเหลว กรุณาลองใหม่");
    }
  };

  return (
    <>
      {/* Logo Section */}
      <div className="text-center mb-4 animate-fade-up">
        <h1 className="text-4xl font-bold tracking-tighter leading-none">
          <span className="text-[#2D3E25] block">WONG</span>
          <span className="text-[#A65D2E] block">NORK</span>
        </h1>
        <p className="text-[#2D3E25] font-medium mt-2">Eat | Share | Connect</p>
        <div className="w-48 h-[1px] bg-gray-300 mt-6 mx-auto"></div>
        <div className="text-[25px] text-[#2D3E25] font-bold mt-3">Sign in</div>
      </div>

      {/* Form Card เนื้อหาหลัก */}
      <div className="bg-[#FFF8F4] w-full rounded-[2.5rem] py-8 px-8 shadow-xl animate-fade-up">
        <form onSubmit={handleSubmit(submitLogin)} className="space-y-6">
          <fieldset disabled={isSubmitting}>
            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 mt-1 ml-1">
                Email Address
              </label>
              <input
                {...register("email", {
                  required: "กรุณากรอกอีเมล",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "รูปแบบอีเมลไม่ถูกต้อง",
                  },
                })}
                type="email"
                placeholder="Email"
                className={`w-full bg-[#EAD9CF] bg-opacity-60 border-none rounded-xl py-4 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#A65D2E] outline-none transition-all ${
                  errors.email ? "ring-2 ring-red-400" : ""
                }`}
              />
              {errors.email && (
                <p className="text-[10px] text-red-500 mt-1 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between mb-1 mt-2 px-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[10px] font-bold text-[#A65D2E] uppercase tracking-widest hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "กรุณากรอกรหัสผ่าน",
                    minLength: {
                      value: 6,
                      message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••••"
                  className={`w-full bg-[#EAD9CF] bg-opacity-60 border-none rounded-xl py-4 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#A65D2E] outline-none transition-all ${
                    errors.password ? "ring-2 ring-red-400" : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#A65D2E] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 mt-1 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#A65D2E] hover:bg-[#8e4f27] text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-900/20 transform active:scale-[0.98] transition-all mt-5 cursor-pointer"
            >
              Sign In
            </button>
          </fieldset>
        </form>

        <div className="relative flex items-center py-8">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Or Connect
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

       
<div className="flex justify-center w-full">
  <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => toast.error("ยกเลิกการเชื่อมต่อ Google")}
    useOneTap
    theme="outline"
    size="large"
    width="100%" 
    shape="rectangular"
  />
</div>
        <span className="flex text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1 mt-10 justify-center">
          Don't have an account?{" "}
          <button
            type="button"
            className="uppercase text-[#A65D2E] pl-1 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </span>
      </div>
    </>
  );
};

export default Login;

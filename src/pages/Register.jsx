import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import useUserStore from "../stores/userStore";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const registerUser = useUserStore((state) => state.register);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  // ถ้าจะแก้ zod ให้อิงจากหลังบ้าน อย่าลืมแก้ value กับ message ข้างล่างจ้า
  const onSubmit = async (data) => {
    try {
      console.log("Submit Data:", data);
      const body = {
        email: data.email,
        password: data.password,
        user: data.user,
      };

      const resp = await registerUser(body);

      if (resp.data.status === "success") {
        alert("สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!");
        navigate("/");
      } else {
        // กรณี backend ส่ง error กลับมาแต่ status code ยังเป็น 2xx
        setError("email", { type: "manual", message: resp.data.message });
      }
    } catch (err) {
      // กรณี API Error (4xx, 5xx)
      const errorMsg =
        err.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      setError("email", { type: "manual", message: errorMsg });
    }
  };

  return (
    <>
      {/* Logo Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tighter leading-none">
          <span className="text-[#2D3E25] block">WONG</span>
          <span className="text-[#A65D2E] block">NORK</span>
        </h1>
        <p className="text-[#2D3E25] font-medium mt-2">Eat | Share | Connect</p>
        <div className="w-48 h-[1px] bg-gray-300 mt-6 mx-auto"></div>
      </div>

      {/* Form Card */}
      <div className="bg-[#FFF8F4] w-full rounded-[2.5rem] p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name Input */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
              Full Name
            </label>
            <input
              {...register("fullName", { required: "กรุณากรอกชื่อ-นามสกุล" })}
              type="text"
              placeholder="WONGNORK"
              className={`w-full bg-[#EAD9CF] bg-opacity-60 border-none rounded-xl py-4 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#A65D2E] outline-none transition-all ${
                errors.fullName ? "ring-2 ring-red-400" : ""
              }`}
            />
            {errors.fullName && (
              <p className="text-[10px] text-red-500 mt-1 ml-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email Address Input */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
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
              placeholder="name@wongnork.com"
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
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password", {
                  required: "กรุณากำหนดรหัสผ่าน",
                  minLength: {
                    value: 8,
                    message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
                  },
                })}
                type={showPassword ? "text" : "password"}
                placeholder="............"
                className={`w-full bg-[#EAD9CF] bg-opacity-60 border-none rounded-xl py-4 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#A65D2E] outline-none transition-all ${
                  errors.password ? "ring-2 ring-red-400" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#A65D2E] cursor-pointer"
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

          {/* Confirm Password Input พร้อมปุ่มเปิด-ปิดตา */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword", {
                  required: "กรุณายืนยันรหัสผ่าน",
                  validate: (value) =>
                    value === password || "รหัสผ่านไม่ตรงกัน",
                })}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="............"
                className={`w-full bg-[#EAD9CF] bg-opacity-60 border-none rounded-xl py-4 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#A65D2E] outline-none transition-all ${
                  errors.confirmPassword ? "ring-2 ring-red-400" : ""
                }`}
              />
              {/* ปุ่มเปิด-ปิดตาสำหรับ Confirm Password */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#A65D2E] cursor-pointer"
              >
                {showConfirmPassword ? (
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
            {errors.confirmPassword && (
              <p className="text-[10px] text-red-500 mt-1 ml-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#A65D2E] hover:bg-[#8e4f27] text-white font-semibold py-4 rounded-xl shadow-lg shadow-orange-900/20 transform active:scale-[0.98] transition-all mt-4 cursor-pointer"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-8">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Or Register
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google Button */}
        <button className="w-full bg-[#FEF1E9] border border-orange-100 flex items-center justify-center gap-3 py-3 rounded-xl hover:bg-white transition-colors cursor-pointer">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="text-gray-600 font-medium text-sm">Google</span>
        </button>

        {/* Bottom Link */}
        <span className="flex text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-10 justify-center">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="uppercase text-[#A65D2E] pl-1 cursor-pointer hover:underline"
          >
            Sign In
          </button>
        </span>
      </div>
    </>
  );
};

export default Register;

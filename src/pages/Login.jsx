import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useAuthLogic } from "../hooks/useAuthLogic";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import VerifyEmailModal from "../components/auth/VerifyEmailModal";

const Login = () => {
  const {
    form,
    showPassword,
    setShowPassword,
    showVerifyModal,
    setShowVerifyModal,
    submitLogin,
    handleGoogleSuccess,
    navigate,
  } = useAuthLogic();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const inputClass =
    "w-full bg-base-300/60 border-none rounded-xl py-3.5 px-4 pl-11 text-base-content placeholder-base-content/50 focus:ring-2 focus:ring-primary outline-none transition-all text-sm";

  return (
    <>
      <div className="text-center mb-2 sm:mb-4 animate-fade-up">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter leading-none">
          <span className="text-base-content block">WONG</span>
          <span className="text-accent block">NORK</span>
        </h1>
        <p className="text-base-content font-medium mt-1 sm:mt-2 text-sm sm:text-base">
          Eat | Share | Connect
        </p>
        <div className="w-32 sm:w-48 h-[1px] bg-base-content/20 mt-4 sm:mt-6 mx-auto"></div>
        <div className="text-[20px] sm:text-[25px] text-base-content font-bold mt-2 sm:mt-3">
          Sign in
        </div>
      </div>

      <div className="bg-base-100 w-full rounded-[2.5rem] py-6 px-6 sm:py-8 sm:px-8 shadow-xl animate-fade-up flex flex-col">
        <form
          onSubmit={handleSubmit(submitLogin)}
          className="space-y-4 sm:space-y-6"
        >
          <fieldset disabled={isSubmitting} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <label className="block text-[9px] font-black text-base-content/50 uppercase tracking-[0.2em] mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60"
                  size={16}
                />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Email"
                  className={`${inputClass} ${errors.email ? "ring-2 ring-red-400" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-[9px] text-red-500 mt-1 ml-1 font-bold italic">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5 px-1">
                <label className="text-[9px] font-black text-base-content/50 uppercase tracking-[0.2em]">
                  Password
                </label>
                {/* <button
                  type="button"
                  className="text-[9px] font-black text-accent uppercase hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button> */}
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60"
                  size={16}
                />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••••"
                  className={`${inputClass} ${errors.password ? "ring-2 ring-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[9px] text-red-500 mt-1 ml-1 font-bold italic">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:brightness-90 text-white font-semibold py-3 rounded-xl shadow-lg transform active:scale-[0.98] transition-all mt-2 cursor-pointer"
            >
              Sign In
            </button>
          </fieldset>
        </form>

        {/* 🌟 ปรับลด py-8 เหลือ py-5 สำหรับเส้นคั่น */}
        <div className="relative flex items-center py-5 sm:py-8">
          <div className="flex-grow border-t border-base-content/20"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-base-content/50 uppercase tracking-[0.2em]">
            Or Connect
          </span>
          <div className="flex-grow border-t border-base-content/20"></div>
        </div>

        {/* 🌟 คอนเทนเนอร์หลัก */}
        <div className="relative w-full h-[50px] flex justify-center items-center rounded-2xl group overflow-hidden">
          {/* 🎨 1. ปุ่ม Custom ของเรา (ปรับ Text และ Icon ให้ดูซอฟต์และอ่านง่ายขึ้น) */}
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-base-100 border border-base-content/20 rounded-2xl group-active:scale-[0.98] transition-all pointer-events-none shadow-sm">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-4 h-4"
              alt="google logo"
            />
            {/* 🌟 ปรับตรงนี้: ใช้ text-xs, font-bold สีซอฟต์ลง และไม่ใช้ uppercase แล้ว */}
            <span className="text-xs font-bold text-base-content/70">
              Sign in with Google
            </span>
          </div>

          {/* 👻 2. ปุ่ม Google ของแท้ (ล่องหน) */}
          <div className="absolute inset-0 z-10 opacity-[0.01] cursor-pointer flex justify-center overflow-hidden">
            <div className="transform scale-[1.5]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("ยกเลิกการเข้าสู่ระบบ")}
                useOneTap
                size="large"
              />
            </div>
          </div>
        </div>

        {/* 🌟 ปรับ mt-10 เหลือ mt-6 */}
        <div className="flex text-[11px] font-bold text-base-content/50 uppercase tracking-widest mt-6 justify-center">
          Don't have an account?{" "}
          <button
            type="button"
            className="uppercase text-accent pl-1 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </div>
        {/* 🌟 2. เรียกใช้ Modal ตรงบรรทัดสุดท้ายก่อนปิด </> */}
        <VerifyEmailModal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
        />
      </div>
    </>
  );
};

export default Login;

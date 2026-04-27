import React from "react";
import { Eye, EyeOff, Loader2, User, Mail, Lock } from "lucide-react";
import { useRegisterLogic } from "../hooks/useRegisterLogic";
import ThemeToggleButton from "../components/ThemeToggleButton";
import wongnorkLogo from "../assets/LOGO-WONGNORK2.png";

const Register = () => {
  const {
    form,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    onSubmit,
    navigate,
  } = useRegisterLogic();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const inputClass =
    "w-full bg-[#EAD9CF]/60 border-none rounded-xl py-3.5 px-4 pl-11 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#A65D2E] outline-none transition-all text-sm";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-sm mx-auto px-4 pt-4 pb-8 overflow-y-auto no-scrollbar">
      <div className="text-center mb-2s sm:mb-4 animate-fade-up shrink-0">
        <img
          src={wongnorkLogo}
          alt="Logo"
          className="w-40 scale-200 -mt-20 mx-auto origin-center md:w-56 md:scale-150 md:mt-4 object-contain"
        />
        <div className="w-32 sm:w-48 h-[1px] bg-gray-300 mt-4 sm:mt-6 mx-auto"></div>
        <div className="text-[20px] sm:text-[25px] text-[#2D3E25] font-bold mt-2 sm:mt-3">
          Sign up
        </div>
      </div>

      {/* Form Card: สไตล์เดียวกับ Login */}
      <div className="bg-[#FFF8F4] w-full rounded-[2.5rem] mt-2 py-6 px-6 sm:py-8 sm:px-8 shadow-xl animate-fade-up flex flex-col shrink-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <fieldset disabled={isSubmitting} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A65D2E]/60"
                  size={16}
                />
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Name"
                  className={`${inputClass} ${errors.name ? "ring-2 ring-red-400" : ""}`}
                />
              </div>
              {errors.name && (
                <p className="text-[9px] text-red-500 mt-1 ml-1 font-bold italic">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A65D2E]/60"
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
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A65D2E]/60"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#A65D2E] cursor-pointer"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A65D2E]/60"
                  size={16}
                />
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="•••••••••"
                  className={`${inputClass} ${errors.confirmPassword ? "ring-2 ring-red-400" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#A65D2E] cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[9px] text-red-500 mt-1 ml-1 font-bold italic">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#A65D2E] hover:bg-[#8e4f27] text-white font-semibold py-3 rounded-xl shadow-lg transform active:scale-[0.98] transition-all mt-2 cursor-pointer disabled:bg-gray-400 flex justify-center items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />{" "}
                  Processing...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </fieldset>
        </form>

        {/* Divider: เส้นสีเทาแบบ Login */}
        <div className="relative flex items-center py-5 sm:py-8">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            Or Register
          </span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Google Button: ใช้โครงสร้างล่องหนแบบเดียวกับ Login */}
        <div className="relative w-full h-[50px] flex justify-center items-center rounded-2xl group overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-white border border-[#EAD9CF] rounded-2xl group-active:scale-[0.98] transition-all pointer-events-none shadow-sm">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-4 h-4"
              alt="google logo"
            />
            <span className="text-xs font-bold text-[#736356]">
              Sign up with Google
            </span>
          </div>
          {/* ล่องหนให้กดทะลุ (ต้องให้เพื่อนใส่ GoogleLogin ตรงนี้ทีหลังถ้าจะใช้) */}
          <div className="absolute inset-0 z-10 opacity-[0.01] cursor-pointer flex justify-center overflow-hidden">
            {/* พี่เอา <GoogleLogin /> มาใส่ครอบตรงนี้ได้เลยครับเหมือนหน้า Login */}
          </div>
        </div>

        {/* Bottom Link: สไตล์ตรงกับ Login */}
        <div className="flex text-[10px] font-bold text-gray-500 uppercase tracking-normal mt-6 justify-center">
          Already have an account?{" "}
          <button
            type="button"
            className="uppercase text-[#A65D2E] pl-1 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;

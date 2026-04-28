import React, { useState } from "react";
import { Link } from "react-router";
import { mainApi } from "../api/mainApi";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("กรุณากรอกอีเมล");

    setIsLoading(true);
    try {
      // 🌟 ยิง API ไปที่ Backend ของเรา
      const response = await mainApi.post("/auth/forgot-password", { email });
      toast.success(response.data.message || "ส่งลิงก์ไปที่อีเมลแล้ว!");
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF9F6] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-[#A65D2E] mb-2">ลืมรหัสผ่าน?</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          กรุณากรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#EAD9CF] bg-opacity-60 border-none rounded-xl py-2 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#A65D2E] outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#A65D2E] text-white font-bold rounded-xl py-3 hover:bg-[#8e4f27] transition-colors disabled:opacity-50 mt-2"
          >
            {isLoading ? "กำลังส่ง..." : "ส่งลิงก์ยืนยัน"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          จำรหัสผ่านได้แล้ว?{" "}
          <Link to="/login" className="text-[#A65D2E] font-bold hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { toast } from "sonner";;

export default function ResetPassword() {
  // 🌟 ดึง id และ token ออกมาจาก URL
  const { id, token } = useParams(); 
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
    if (newPassword !== confirmPassword) return toast.error("รหัสผ่านไม่ตรงกัน");

    setIsLoading(true);
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      // 🌟 ยิง API ไปที่ Backend พร้อมส่ง id และ token ผ่าน URL
      const response = await axios.post(`${BACKEND_URL}/auth/reset-password/${id}/${token}`, {
        newPassword
      });
      
      toast.success(response.data.message || "เปลี่ยนรหัสผ่านสำเร็จ!");
      navigate("/login"); // เปลี่ยนเสร็จเด้งไปหน้า Login เลย
    } catch (error) {
      toast.error(error.response?.data?.message || "ลิงก์หมดอายุหรือเกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF9F6] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-[#A65D2E] mb-6">ตั้งรหัสผ่านใหม่</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="รหัสผ่านใหม่"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#EAD9CF] bg-opacity-60 border-none rounded-xl py-2 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#A65D2E] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#EAD9CF] bg-opacity-60 border-none rounded-xl py-2 px-4 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#A65D2E] outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#A65D2E] text-white font-bold rounded-xl py-3 hover:bg-[#8e4f27] transition-colors disabled:opacity-50 mt-4"
          >
            {isLoading ? "กำลังบันทึก..." : "อัปเดตรหัสผ่าน"}
          </button>
        </form>
      </div>
    </div>
  );
}
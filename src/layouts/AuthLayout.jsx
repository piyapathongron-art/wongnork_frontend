import React from "react";
import { Outlet } from "react-router";

function AuthLayout() {
    return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4">
      {/* Main Container: กล่องขาวที่เป็นฐานสำหรับทุกหน้า */}
      <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl flex flex-col items-center pt-12 pb-16 px-8 relative">
        {/* Outlet คือจุดที่เนื้อหาของหน้า Login จะมาแสดงผลตรงนี้ */}
        <Outlet />
            </div>
        </div>
  );
}

export default AuthLayout;

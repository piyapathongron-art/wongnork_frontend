import React, { Suspense, lazy } from "react";
import { Outlet } from "react-router";

// Lazy load the Nav for better performance
const NavBar = lazy(() => import("../components/NavBar"));

const AppLayout = () => {
  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden bg-[#FFF8F5] flex flex-col">
      <main className="flex-grow relative h-full">
        <Outlet />
      </main>

      {/* FIXED NAVBAR (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="w-full flex justify-center pb-6 pointer-events-auto">
          <NavBar />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

import React, { Suspense, lazy, useEffect } from "react";
import { Outlet } from "react-router";
import useRestaurantStore from "../stores/restaurantStore";

// Lazy load the Nav for better performance
const NavBar = lazy(() => import("../components/NavBar"));

const AppLayout = () => {
  const fetchRestaurants = useRestaurantStore(
    (state) => state.fetchRestaurants,
  );
  useEffect(() => {
    fetchRestaurants();
  }, []);
  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden bg-[#FFF8F5] flex flex-col font-primary">
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

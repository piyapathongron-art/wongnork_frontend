import React, { Suspense, lazy } from 'react';
import { Outlet } from 'react-router';

// Lazy load the Nav for better performance
const NavBar = lazy(() => import('../components/NavBar'));

const AppLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFF8F5] font-sans text-[#2B361B]">

            {/* 1. Main Page Content Section */}
            <main className="flex-grow pb-[120px]">
                {/* Outlet renders the current child route (HomeMap, Auth, etc.) */}
                <Outlet />
            </main>

            {/* 2. Persistent Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <Suspense fallback={null}>
                    <NavBar />
                </Suspense>
            </div>

        </div>
    );
};

export default AppLayout;
import React, { Suspense, lazy } from "react";

// 1. Lazy import the sub-components
const SearchBar = lazy(() => import("../components/SearchBar"));
const MapBox = lazy(() => import("../components/MapBox"));
// const NavBar = lazy(() => import('../components/NavBar'));

const HomeMap = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-white touch-none">
      {/* 1. Map Component */}
      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={<div className="w-full h-full bg-gray-100 animate-pulse" />}
        >
          <MapBox />
        </Suspense>
      </div>

      {/* 2. UI Overlay (Search Bar) */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-8 pb-10 bg-gradient-to-b from-[#FFF8F5] via-[#FFF8F5]/80 to-transparent pointer-events-none">
        <div className="w-full max-w-[402px] pointer-events-auto">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default HomeMap;

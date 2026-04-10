import React, { Suspense, lazy } from 'react';

// 1. Lazy import the sub-components
const SearchBar = lazy(() => import('../components/SearchBar'));
// const NavBar = lazy(() => import('../components/NavBar'));

const HomeMap = () => {
    return (
       <div className="w-full h-screen relative overflow-hidden bg-white touch-none">
      
      {/* 1. Map Background Container */}
      <div className="absolute inset-0 z-0">
        {/* When you add Google Maps API, it will live in a div here set to 100% height/width */}
        <img 
          src="https://media.discordapp.net/attachments/1113220556157169724/1156686315847753818/map_background_light.png" 
          alt="Mock Map" 
          className="w-full h-full object-cover opacity-80"
        />
      </div>

      {/* 2. FIXED SEARCH BAR (Top) */}
      <div className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-8 pb-10 bg-gradient-to-b from-[#FFF8F5] via-[#FFF8F5]/80 to-transparent pointer-events-none">
        <div className="w-full max-w-[402px] pointer-events-auto">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>
      </div>

      {/* 3. Central Map Pin */}
      <div className="relative z-10 w-full h-full flex justify-center items-center pointer-events-none">
        <div className="w-[280px] h-[280px] bg-white/70 rounded-full shadow-2xl flex justify-center items-center border border-[#EEE2D1]/40 backdrop-blur-md p-8">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/39/Google_Maps_icon_%282015-2020%29.svg" 
            alt="Google Maps Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

    </div>
    );
};

export default HomeMap;
import React, { Suspense, lazy } from 'react';

// 1. Lazy import the sub-components
const SearchBar = lazy(() => import('../components/SearchBar'));
const NavBar = lazy(() => import('../components/NavBar'));

const HomeMap = () => {
    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-white">
            {/* 2. Wrap components in Suspense */}
            {/* You can use a simple loading div or a skeleton as the fallback */}
            <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-[#FFF8F5] text-[#BC6C25]">Loading Wong Nork...</div>}>

                <div className="relative z-10 w-full h-screen flex flex-col pt-10 px-4">
                    <div className="mb-[-50px]">
                        <SearchBar />
                    </div>

                    <div className="flex-1 flex justify-center items-center">
                        <div className="w-[300px] h-[300px] bg-white/80 rounded-full shadow-xl flex justify-center items-center backdrop-blur-sm p-8">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/3/39/Google_Maps_icon_%282015-2020%29.svg"
                                alt="Google Maps Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>

                <div className="relative z-20">
                    <NavBar />
                </div>

            </Suspense>
        </div>
    );
};

export default HomeMap;
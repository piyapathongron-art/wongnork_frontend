import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import useUserStore from "../stores/userStore";

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("");
    const isLogin = useUserStore(state => state.isLogin);


    // Sync activeTab with current URL path
    useEffect(() => {
        const path = location.pathname;
        if (path === "/ai-recommend") {
            setActiveTab("ai-recommend");
        } else if (path === "/restaurants") {
            setActiveTab("restaurants");
        } else if (path === "/profile") {
            setActiveTab("profile");
        } else if (path === "/party") {
            setActiveTab("party");
        } else if (path === "/") {
            setActiveTab("location");
        }
    }, [location.pathname]);

    // Helper for colors to keep the JSX clean
    const getColors = (id) => ({
        stroke: activeTab === id ? "#BC6C25" : "#2B361B",
        text: activeTab === id ? "text-[#BC6C25]" : "text-[#2B361B]",
        opacity:
            activeTab === id
                ? "opacity-100 scale-110"
                : "opacity-50 hover:opacity-80",
        strokeWidth: activeTab === id ? 2.5 : 1.5,
    });

    return (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-50 pointer-events-none">
            <nav className="w-full max-w-[420px] bg-[#F7EAD7] h-[65px] rounded-[45px] flex items-center justify-between px-5 shadow-xl border border-[#EEE2D1]/30 pointer-events-auto">

                {/* 1. Ai Recommend */}
                <div
                    onClick={() => navigate("/ai-recommend")}
                    className={` w-15 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 h-full ${getColors("ai-recommend").opacity}`}
                >
                    <div className="relative flex flex-col items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            strokeWidth={getColors("ai-recommend").strokeWidth}
                            stroke={getColors("ai-recommend").stroke}
                            className="w-6 h-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                        <span className={`text-[9px] font-bold uppercase tracking-tighter text-center leading-tight mt-1 ${getColors("ai-recommend").text}`}>
                            AI Chat
                        </span>
                    </div>
                </div>

                {/* 2. Restaurants */}
                <div
                    onClick={() => navigate("/restaurants")}
                    className={`w-15 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 h-full ${getColors("restaurants").opacity}`}
                >
                    <div className="relative flex flex-col items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            strokeWidth={getColors("restaurants").strokeWidth}
                            stroke={getColors("restaurants").stroke}
                            className="w-6 h-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-3.75 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span className={`text-[9px] font-bold uppercase tracking-tighter mt-1 ${getColors("restaurants").text}`}>
                            Restaurants
                        </span>
                    </div>
                </div>

                {/* 3. Location (Home) */}
                <div
                    onClick={() => navigate("/")}
                    className={`w-15 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 h-full ${getColors("location").opacity}`}
                >
                    <div className="relative flex flex-col items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            strokeWidth={getColors("location").strokeWidth}
                            stroke={getColors("location").stroke}
                            className="w-6 h-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <span className={`text-[9px] font-bold uppercase tracking-tighter mt-1 ${getColors("location").text}`}>
                            Map
                        </span>
                    </div>
                </div>

                {/* 4. My Parties */}
                <div
                    onClick={() => {
                        navigate("/party");
                    }}
                    className={`w-15 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 h-full px-2 ${getColors("party").opacity}`}
                >
                    <div className="relative flex flex-col items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            strokeWidth={getColors("party").strokeWidth}
                            stroke={getColors("party").stroke}
                            className="w-6 h-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a5.97 5.97 0 0 0-.942 3.197M12 10.5a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75ZM21 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM3 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" />
                        </svg>
                        <span className={`text-[9px] font-bold uppercase tracking-tighter mt-1 ${getColors("party").text}`}>
                            Party
                        </span>
                    </div>
                </div>

                {/* 5. Profile / Login */}
                <div
                    onClick={() => navigate(isLogin ? "/profile" : "/login")}
                    className={`w-15 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 h-full ${getColors("profile").opacity}`}
                >
                    <div className="relative flex flex-col items-center">
                        {isLogin ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                strokeWidth={getColors("profile").strokeWidth}
                                stroke={getColors("profile").stroke}
                                className="w-6 h-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                strokeWidth={getColors("profile").strokeWidth}
                                stroke={getColors("profile").stroke}
                                className="w-6 h-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
                            </svg>
                        )}
                        <span className={`text-[9px] font-bold uppercase tracking-tighter mt-1 ${getColors("profile").text}`}>
                            {isLogin ? "Profile" : "Login"}
                        </span>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default NavBar;

import React, { useState } from "react";
import { useNavigate } from "react-router";

const NavBar = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("location");

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
            <nav className="w-full max-w-[402px] bg-[#F7EAD7] h-[100px] rounded-[50px] flex items-center justify-around px-4 shadow-lg border border-[#EEE2D1]/30 pointer-events-auto">
                {/* 1. Ai Recommend */}
                <div
                    onClick={() => {
                        setActiveTab("ai-recommend");
                        navigate("/ai-recommend");
                    }}
                    className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 h-full px-2 ${getColors("ai-recommend").opacity}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={getColors("ai-recommend").strokeWidth}
                        stroke={getColors("ai-recommend").stroke}
                        className="w-7 h-7"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                        />
                    </svg>
                    <span
                        className={`text-[10px] font-bold uppercase tracking-tighter text-center leading-[0.7rem] ${getColors("ai-recommend").text}`}
                    >
                        Talk with
                        <br />
                        WongNork
                    </span>
                    {activeTab === "ai-recommend" && (
                        <div className="w-1.5 h-1.5 bg-[#BC6C25] rounded-full mt-0.5" />
                    )}
                </div>

                {/* 2. Location */}
                <div
                    onClick={() => {
                        setActiveTab("location");
                        navigate("/");
                    }}
                    className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 h-full px-2 ${getColors("location").opacity}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={getColors("location").strokeWidth}
                        stroke={getColors("location").stroke}
                        className="w-7 h-7"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                    </svg>
                    <span
                        className={`text-[10px] font-bold uppercase tracking-tighter ${getColors("location").text}`}
                    >
                        Location
                    </span>
                    {activeTab === "location" && (
                        <div className="w-1.5 h-1.5 bg-[#BC6C25] rounded-full mt-0.5" />
                    )}
                </div>

                {/* 3. My Parties */}
                <div
                    onClick={() => {
                        setActiveTab("my-parties");
                        navigate("/");
                    }}
                    className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 h-full px-2 ${getColors("my-parties").opacity}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={getColors("my-parties").strokeWidth}
                        stroke={getColors("my-parties").stroke}
                        className="w-7 h-7"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                        />
                    </svg>
                    <span
                        className={`text-[10px] font-bold uppercase tracking-tighter ${getColors("my-parties").text}`}
                    >
                        Create Group
                    </span>
                    {activeTab === "my-parties" && (
                        <div className="w-1.5 h-1.5 bg-[#BC6C25] rounded-full mt-0.5" />
                    )}
                </div>

                {/* 4. Profile */}
                <div
                    onClick={() => {
                        setActiveTab("profile");
                        navigate("/profile");
                    }}
                    className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 h-full px-2 ${getColors("profile").opacity}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={getColors("profile").strokeWidth}
                        stroke={getColors("profile").stroke}
                        className="w-7 h-7"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                    </svg>
                    <span
                        className={`text-[10px] font-bold uppercase tracking-tighter ${getColors("profile").text}`}
                    >
                        Profile
                    </span>
                    {activeTab === "profile" && (
                        <div className="w-1.5 h-1.5 bg-[#BC6C25] rounded-full mt-0.5" />
                    )}
                </div>
            </nav>
        </div>
    );
};

export default NavBar;

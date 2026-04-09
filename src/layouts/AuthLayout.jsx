import React from 'react'
import { Outlet } from 'react-router'

function AuthLayout() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
            {/* Organic Glass Container */}
            <div className="w-full max-w-[350px] bg-[#FFF8F5]/80 backdrop-blur-[12px] rounded-[32px] p-8 shadow-xl border border-[#EEE2D1]/50">
            <h1>AuthLayout</h1>
            {/* <Outlet /> */}

            </div>
        </div>
    )
}

export default AuthLayout
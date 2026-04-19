import React from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ isOpen, onClose, message = "กรุณาล็อกอินเพื่อใช้งานฟีเจอร์นี้" }) => {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-[#FFF8F5] rounded-[2rem] p-6 w-full max-w-sm shadow-2xl text-center border border-[#EEE2D1]"
                    >
                        <div className="w-16 h-16 bg-[#F7EAD7] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[#EEE2D1]/50">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#A65D2E" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-[#2B361B] mb-2 tracking-tight">ต้องเข้าสู่ระบบ</h3>
                        <p className="text-[#8B837E] text-[13px] font-medium mb-6 px-2 leading-relaxed">
                            {message}
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={onClose}
                                className="flex-1 py-3.5 rounded-2xl font-bold text-[#A65D2E] bg-white border border-[#EEE2D1] active:scale-95 transition-all text-sm"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={() => navigate('/login')}
                                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-[#A65D2E] active:scale-95 transition-all shadow-md text-sm"
                            >
                                เข้าสู่ระบบ
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;

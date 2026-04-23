import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, ChevronRight, X, User as UserIcon } from 'lucide-react';
import { apiGetPublicProfile } from '../../api/mainApi';

const ProfileQuickViewSheet = ({ isOpen, userId, onClose, navigate }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState("half"); // 'half' or 'high'

    useEffect(() => {
        if (isOpen && userId) {
            const fetchSummary = async () => {
                try {
                    setLoading(true);
                    const res = await apiGetPublicProfile(userId);
                    setUserData(res.data.data);
                } catch (err) {
                    console.error("Error fetching profile summary:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchSummary();
        } else {
            setUserData(null);
            setStep("half");
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;

    const stats = userData ? {
        reviews: userData.reviews?.length || 0,
        pastParties: [
            ...(userData.joinedParties?.map(jp => jp.party) || []),
            ...(userData.partiesLed || [])
        ].filter(p => p?.status === 'COMPLETED').length
    } : { reviews: 0, pastParties: 0 };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div key="profile-sheet" className="fixed inset-0 z-[100] pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: step === "half" ? "40%" : "0%" }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.1}
                        onDragEnd={(e, info) => {
                            const { y } = info.offset;
                            if (y < -100) {
                                // ลากขึ้นแรงๆ ให้ไปหน้า Profile เต็ม
                                navigate(`/profile/${userId}`);
                                onClose();
                            } else if (y > 100) {
                                // ลากลงให้ปิด
                                onClose();
                            }
                        }}
                        className="absolute inset-x-0 bottom-0 bg-[#FFF8F5] rounded-t-[3rem] shadow-2xl flex flex-col h-[95vh] max-w-[500px] mx-auto overflow-hidden pointer-events-auto border-t border-[#EEE2D1]"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center py-4 shrink-0 cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-[#EEE2D1] rounded-full" />
                        </div>

                        <div className="px-8 pb-12 flex-1 overflow-y-auto no-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                    <div className="w-24 h-24 bg-[#EAD9CF] rounded-full mb-4" />
                                    <div className="h-6 w-32 bg-[#EAD9CF] rounded-lg mb-2" />
                                    <div className="h-4 w-48 bg-[#EAD9CF] rounded-lg" />
                                </div>
                            ) : userData && (
                                <div className="space-y-8">
                                    {/* User Info Header */}
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-[#2D3E25] mb-4">
                                            <img
                                                src={userData.avatarUrl || `https://i.pravatar.cc/150?u=${userData.id}`}
                                                alt={userData.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h2 className="text-2xl font-black text-[#2B361B] tracking-tight">{userData.name}</h2>
                                        <p className="text-[10px] font-bold text-[#A65D2E] uppercase tracking-widest mt-1 bg-[#F7EAD7] px-3 py-1 rounded-full">
                                            {userData.role === 'OWNER' ? 'Restaurant Owner' : 'Verified Member'}
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-5 rounded-[2rem] border border-[#EEE2D1]/50 shadow-sm text-center">
                                            <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-[#A65D2E]">
                                                <Star size={20} fill="currentColor" />
                                            </div>
                                            <span className="block text-2xl font-black text-[#2B361B]">{stats.reviews}</span>
                                            <span className="text-[9px] font-bold text-[#8B837E] uppercase tracking-wider">Reviews</span>
                                        </div>
                                        <div className="bg-white p-5 rounded-[2rem] border border-[#EEE2D1]/50 shadow-sm text-center">
                                            <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-2 text-green-600">
                                                <Clock size={20} />
                                            </div>
                                            <span className="block text-2xl font-black text-[#2B361B]">{stats.pastParties}</span>
                                            <span className="text-[9px] font-bold text-[#8B837E] uppercase tracking-wider">Past Parties</span>
                                        </div>
                                    </div>

                                    {/* Call to Action */}
                                    <div className="space-y-4 pt-4">
                                        <button
                                            onClick={() => {
                                                navigate(`/profile/${userId}`);
                                                onClose();
                                            }}
                                            className="w-full py-5 rounded-[1.5rem] bg-[#182806] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                                        >
                                            ดูโปรไฟล์แบบเต็ม
                                            <ChevronRight size={18} />
                                        </button>

                                        <p className="text-center text-[10px] font-bold text-[#A8A29F] uppercase tracking-widest animate-bounce">
                                            ↑ ลากขึ้นเพื่อดูโปรไฟล์ ↑
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileQuickViewSheet;

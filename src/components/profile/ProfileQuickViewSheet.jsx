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
                        className="absolute inset-x-0 bottom-0 bg-base-100 rounded-t-[3rem] shadow-2xl flex flex-col h-[95vh] max-w-[500px] mx-auto overflow-hidden pointer-events-auto border-t border-base-content/10"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center py-4 shrink-0 cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-base-content/10 rounded-full" />
                        </div>

                        <div className="px-8 pb-12 flex-1 overflow-y-auto no-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                    <div className="w-24 h-24 bg-base-300 rounded-full mb-4" />
                                    <div className="h-6 w-32 bg-base-300 rounded-lg mb-2" />
                                    <div className="h-4 w-48 bg-base-300 rounded-lg" />
                                </div>
                            ) : userData && (
                                <div className="space-y-8">
                                    {/* User Info Header */}
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full border-4 border-base-100 shadow-xl overflow-hidden bg-base-300 mb-4">
                                            <img
                                                src={userData.avatarUrl || `https://i.pravatar.cc/150?u=${userData.id}`}
                                                alt={userData.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h2 className="text-2xl font-black text-base-content tracking-tight">{userData.name}</h2>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 bg-primary/10 px-3 py-1 rounded-full">
                                            {userData.role === 'OWNER' ? 'Restaurant Owner' : 'Verified Member'}
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-base-200 p-5 rounded-[2rem] border border-base-content/5 shadow-sm text-center">
                                            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 text-primary">
                                                <Star size={20} fill="currentColor" />
                                            </div>
                                            <span className="block text-2xl font-black text-base-content">{stats.reviews}</span>
                                            <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-wider">Reviews</span>
                                        </div>
                                        <div className="bg-base-200 p-5 rounded-[2rem] border border-base-content/5 shadow-sm text-center">
                                            <div className="w-10 h-10 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 text-secondary">
                                                <Clock size={20} />
                                            </div>
                                            <span className="block text-2xl font-black text-base-content">{stats.pastParties}</span>
                                            <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-wider">Past Parties</span>
                                        </div>
                                    </div>

                                    {/* Call to Action */}
                                    <div className="space-y-4 pt-4">
                                        <button
                                            onClick={() => {
                                                navigate(`/profile/${userId}`);
                                                onClose();
                                            }}
                                            className="w-full py-5 rounded-[1.5rem] bg-secondary text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                                        >
                                            ดูโปรไฟล์แบบเต็ม
                                            <ChevronRight size={18} />
                                        </button>

                                        <p className="text-center text-[10px] font-bold text-base-content/30 uppercase tracking-widest animate-bounce">
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

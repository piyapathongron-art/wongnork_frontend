import React, { useEffect, useState, useCallback } from 'react';
import NavBar from '../components/NavBar';
import PartyCard from '../components/PartyCard';
import { UserPlus, Search, Users, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiGetParties, apiJoinParty, apiLeaveParty } from '../api/party';
import useUserStore from '../stores/userStore';
import calculateDistance from '../utils/distance.ustils';
import CreatePartyModal from '../components/Modals/CreatePartyModal';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate, useLocation } from 'react-router';

const Party = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLogin, fetchMe } = useUserStore();
    const [parties, setParties] = useState([]);
    const [userLoc, setUserLoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 🌟 Dynamic Error Modal State
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: '',
        message: ''
    });

    // 🌟 รวมปาร์ตี้ที่เราเป็น Leader และที่เรา Join อยู่จาก UserStore (ข้อมูลใน Store มีความสัมพันธ์ครบ)
    const myJoinedGroups = React.useMemo(() => {
        if (!isLogin || !user) return [];
        
        // ดึงจาก partiesLed และ joinedParties โดยตรง
        const led = user.partiesLed || [];
        const joined = (user.joinedParties || []).map(jp => jp.party).filter(p => !!p);

        const combined = [...led, ...joined];
        // Unique by ID เพื่อป้องกันข้อมูลซ้ำ
        const unique = combined.reduce((acc, curr) => {
            if (!acc.find(p => p.id === curr.id)) acc.push(curr);
            return acc;
        }, []);
        return unique;
    }, [user, isLogin]);

    // 🌟 Auto open modal if navigated from Profile with state
    useEffect(() => {
        if (location.state?.openCreateModal) {
            setIsModalOpen(true);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (p) => setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => {
                setLoading(false);
                loadData();
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // ดึงข้อมูลปาร์ตี้ทั้งหมด และ อัปเดตข้อมูลตัวเองใน Store พร้อมกันเพื่อให้ Current Groups อัปเดต
            const [partiesRes] = await Promise.all([
                apiGetParties(),
                isLogin ? fetchMe() : Promise.resolve()
            ]);

            const partiesList = partiesRes.data.data || [];

            const processedParties = partiesList.map(p => ({
                ...p,
                dist: userLoc ? calculateDistance(userLoc.lat, userLoc.lng, p.restaurant?.lat, p.restaurant?.lng) : null
            })).sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity));

            setParties(processedParties);
        } catch (err) {
            console.error("Sync failed", err);
            toast.error("ซิงค์ข้อมูลไม่สำเร็จ");
        } finally {
            setLoading(false);
        }
    }, [isLogin, userLoc, fetchMe]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleJoin = async (partyId) => {
        if (!isLogin) return toast.warning("กรุณาล็อกอินก่อนเข้าร่วม");
        try {
            await apiJoinParty(partyId);
            toast.success("เข้าร่วมปาร์ตี้สำเร็จ!");
            await loadData(); // 🌟 อัปเดต Store และลิสต์ทันที
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message;
            
            if (errorMsg === "คุณกำลังอยู่ในปาร์ตี้ของร้านนี้ที่ยังไม่จบ") {
                setErrorModal({
                    isOpen: true,
                    title: "คุณมีตี้ที่นี่อยู่แล้ว! 🥘",
                    message: "ดูเหมือนคุณจะมีปาร์ตี้ที่ร้านนี้ที่ยังไม่จบนะครับ ลองไปจัดการบิลของเดิมให้เสร็จก่อนนะ!"
                });
            } else if (errorMsg === "คุณมี party ที่มีระยะเวลาใกล้กันอยู่") {
                setErrorModal({
                    isOpen: true,
                    title: "เวลาทับซ้อนกัน! ⏰",
                    message: "คุณมีนัดปาร์ตี้อื่นในช่วงเวลาใกล้เคียงกันอยู่แล้ว (ห่างกันไม่เกิน 1 ชม.) ลองเช็คตารางเวลาอีกครั้งนะครับ"
                });
            } else {
                toast.error(errorMsg || "Join failed");
            }
        }
    };

    const handleLeave = async (partyId) => {
        try {
            await apiLeaveParty(partyId);
            toast.success("ออกจากปาร์ตี้แล้ว");
            await loadData(); 
        } catch (err) {
            toast.error("Leave failed");
        }
    };

    return (
        <div className="fixed inset-0 bg-[#FDF2ED] dark:bg-black overflow-hidden flex flex-col font-sans">

            {/* 1. MAIN SCROLL CONTAINER */}
            <div
                id="scroll-container"
                className="flex-1 overflow-y-auto pt-6 px-4 pb-48 no-scrollbar scroll-smooth"
            >
                <div className="flex flex-col gap-6 max-w-md mx-auto">

                    {/* 📸 SECTION: YOUR CURRENT GROUPS (IG Stories Style) */}
                    {myJoinedGroups.length > 0 && (
                        <div className="flex flex-col gap-3 pt-2">
                            <h2 className="px-2 text-[10px] font-black tracking-[0.2em] text-[#BC6C25] uppercase opacity-70">
                                Your Current Groups
                            </h2>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
                                {myJoinedGroups.map(party => {
                                    const restaurant = party.restaurant || {};
                                    const imageUrl = restaurant.images?.find(img => img.isCover)?.url ||
                                        restaurant.images?.[0]?.url ||
                                        'https://picsum.photos/seed/restaurant/400/300';

                                    return (
                                        <div
                                            key={`story-${party.id}`}
                                            onClick={() => navigate(`/party/${party.id}/split-bill`)}
                                            className="flex-none flex flex-col items-center gap-1.5 w-20 cursor-pointer active:scale-95 transition-transform"
                                        >
                                            <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-[#BC6C25] via-[#F7EAD7] to-[#A65D2E] shadow-sm">
                                                <div className="w-[60px] h-[60px] rounded-full border-2 border-[#FDF2ED] overflow-hidden bg-white">
                                                    <img
                                                        src={imageUrl}
                                                        alt={restaurant.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {party.leaderId === user?.id && (
                                                    <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full shadow-sm border-2 border-white">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white">
                                                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="absolute -bottom-1 -right-1 bg-[#182806] px-1.5 py-0.5 rounded-full shadow-sm border-2 border-white flex items-center gap-0.5">
                                                    <Users size={8} className="text-[#F7EAD7] fill-current" />
                                                    <span className="text-[7px] font-black text-white leading-none">
                                                        {party.members?.length || 0}/{party.maxParticipants}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-[#2B361B] truncate w-full text-center leading-tight">
                                                {party.name?.split(' ')[0] || 'Party'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="h-px bg-[#BC6C25]/10 w-full mt-1" />
                        </div>
                    )}

                    {/* SECTION: DISCOVER HEADER */}
                    <header className="text-center py-2">
                        <h1 className="text-2xl font-black tracking-[0.2em] text-[#2B361B] dark:text-white uppercase">
                            Discover Nearby
                        </h1>
                    </header>

                    {/* SECTION: NEARBY LIST */}
                    <div key="discovery-list" className="flex flex-col gap-6">
                        {loading && parties.length === 0 ? (
                            <div className="text-center py-20 opacity-20 font-black uppercase text-[10px]">Searching...</div>
                        ) : (
                            parties
                                .filter(p => !myJoinedGroups.some(myP => myP.id === p.id))
                                .map((p) => (
                                    <PartyCard
                                        key={`discover-${p.id}`}
                                        party={p}
                                        onJoin={() => handleJoin(p.id)}
                                        isJoined={false}
                                    />
                                ))
                        )}

                        {!loading && parties.filter(p => !myJoinedGroups.some(myP => myP.id === p.id)).length === 0 && (
                            <div className="text-center py-10 opacity-40">
                                <Search className="w-10 h-10 mx-auto text-[#BC6C25] mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No more parties nearby</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. FLOATING UI LAYER */}
            <div className="absolute inset-0 pointer-events-none">
                <button
                    className="absolute bottom-28 right-6 w-20 h-20 bg-[#BC6C25] text-[#F7EAD7] rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-[#FDF2ED] dark:border-zinc-900 z-50 active:scale-90 transition-all pointer-events-auto"
                    onClick={() => setIsModalOpen(true)}
                >
                    <UserPlus className="w-6 h-6 mb-1" />
                    <span className="text-[8px] font-black uppercase">Create</span>
                </button>

                <NavBar />
            </div>

            <CreatePartyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadData} />

            {/* 🌟 Dynamic Error Warning Modal */}
            <AnimatePresence>
                {errorModal.isOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border border-[#EEE2D1]"
                        >
                            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                                <AlertCircle size={40} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-[#2B361B] mb-2 tracking-tight">{errorModal.title}</h3>
                            <p className="text-sm text-[#8B837E] mb-8 leading-relaxed px-2">
                                {errorModal.message}
                            </p>
                            <button 
                                onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                                className="w-full py-4 rounded-2xl font-black text-sm bg-[#182806] text-white shadow-lg active:scale-[0.98] transition-all"
                            >
                                เข้าใจแล้ว
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Party;

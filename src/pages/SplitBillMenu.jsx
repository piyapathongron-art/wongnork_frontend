import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    ArrowLeft,
    Receipt,
    Check,
    Utensils,
    AlertCircle,
    X,
    Users,
    Plus,
    Crown,
    User as UserIcon,
    Star,
    MessageSquare,
    Search,
    ArrowUp
} from 'lucide-react';
import { apiGetPartyById, apiGetSplitBill, apiAddOrderItem, apiKickMember, apiJoinParty } from '../api/party';
import { apiGetMenuByRestaurantId } from '../api/menuApi';
import useUserStore from '../stores/userStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PartyControlMenu from '../components/PartyControlMenu';
import CreateReviewModal from '../components/Modals/CreateReviewModal';
import ProfileQuickViewSheet from '../components/profile/ProfileQuickViewSheet';
import GroupChatOverlay from '../components/GroupChatOverlay';
import { getSocket } from '../services/socket';
import useChatStore from '../stores/chatStore';

const SplitBillMenu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);
    const scrollRef = useRef(null);

    const [party, setParty] = useState(null);
    const [billSummary, setBillSummary] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const unreadCounts = useChatStore(state => state.unreadCounts);
    const hasUnreadMessages = (unreadCounts[id] || 0) > 0;

    // Modal States
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [hasReviewed, setHasHasReviewed] = useState(false);
    const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
    const [customItemForm, setCustomItemForm] = useState({ name: '', price: '' });
    const [errorObj, setErrorObj] = useState(null);

    const isLeader = party?.leaderId === user?.id;
    const isCompleted = party?.status === 'COMPLETED';
    const isQuickBill = !party?.restaurantId;

    const loadData = useCallback(async () => {
        console.log("🛠️ [SplitBillMenu] loadData Triggered! user:", user?.id, "partyId:", id);
        try {
            setLoading(true);
            setErrorObj(null);
            const partyRes = await apiGetPartyById(id);
            let partyData = partyRes.data.data;
            console.log("🛠️ [SplitBillMenu] Fetched partyData:", partyData);

            // เช็คว่าเป็นสมาชิกในปาร์ตี้หรือยัง
            let isMember = partyData.members?.some(m => m.user.id === user?.id || m.userId === user?.id);
            console.log("🛠️ [SplitBillMenu] isMember:", isMember);

            // ถ้ายังไม่ได้เป็นสมาชิก ให้ Auto-join
            if (!isMember && user?.id) {
                console.log("🛠️ [SplitBillMenu] User is not a member. Attempting Auto-Join...");
                try {
                    const joinRes = await apiJoinParty(id);
                    console.log("🛠️ [SplitBillMenu] Auto-Join Success:", joinRes.data);
                    toast.success("เข้าร่วมปาร์ตี้อัตโนมัติ!");
                    // ดึงข้อมูลปาร์ตี้ใหม่หลังจาก join สำเร็จ
                    const updatedPartyRes = await apiGetPartyById(id);
                    partyData = updatedPartyRes.data.data;
                    isMember = true;
                    console.log("🛠️ [SplitBillMenu] Fetched updated partyData after join.");
                } catch (joinErr) {
                    console.error("🚨 [SplitBillMenu] Auto-Join Failed:", joinErr);
                    const errorMsg = joinErr.response?.data?.error || joinErr.response?.data?.message || "ไม่สามารถเข้าร่วมปาร์ตี้ได้";
                    toast.error(errorMsg);
                    setErrorObj(`Auto-Join Error: ${errorMsg}`);
                    setLoading(false);
                    return;
                }
            } else if (!user?.id) {
                 console.log("⚠️ [SplitBillMenu] user?.id is missing. Waiting for user store to hydrate...");
            }

            setParty(partyData);

            if (isMember || user?.role === "ADMIN") {
                console.log("🛠️ [SplitBillMenu] Fetching split bill...");
                const billRes = await apiGetSplitBill(id);
                setBillSummary(billRes.data.data);
                console.log("🛠️ [SplitBillMenu] Split bill fetched:", billRes.data.data);
            }

            if (partyData.restaurant?.reviews) {
                const myReview = partyData.restaurant.reviews.find(r => r.userId === user?.id && r.partyId === id);
                if (myReview) setHasHasReviewed(true);
            }

            if (partyData.restaurant?.id) {
                try {
                    const menuRes = await apiGetMenuByRestaurantId(partyData.restaurant.id);
                    setMenuItems(menuRes.data.data || []);
                } catch (err) {
                    console.error("🚨 [SplitBillMenu] Error fetching menu:", err);
                }
            }
        } catch (error) {
            console.error("🚨 [SplitBillMenu] Critical Error in loadData:", error);
            setErrorObj(`Critical Error: ${error.message || "ไม่สามารถดึงข้อมูลบิลได้"}`);
            toast.error("ไม่สามารถดึงข้อมูลบิลได้");
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const token = useUserStore.getState().token;
        if (!token || !id) return;
        const socket = getSocket(token);
        socket.emit("join_room", id);
    }, [id]);

    const handleScroll = (e) => {
        if (e.target.scrollTop > 400) setShowBackToTop(true);
        else setShowBackToTop(false);
    };

    const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    const handleCopyInvite = () => {
        const url = window.location.origin + `/party/${id}/split-bill`;
        navigator.clipboard.writeText(url);
        toast.success("คัดลอกลิงก์คำเชิญแล้ว! ส่งให้เพื่อนกดเข้าบิลนี้ได้เลย", { icon: '🔗' });
    };

    const handleAvatarClick = (clickedUserId) => {
        if (clickedUserId === user?.id) navigate('/profile');
        else {
            setSelectedUserId(clickedUserId);
            setIsProfileSheetOpen(true);
        }
    };

    const handleAddMenuToBill = async (menu) => {
        if (actionLoading || isCompleted) return;
        setActionLoading(true);
        try {
            await apiAddOrderItem(id, { menuId: menu.id, quantity: 1, isCustom: false });
            toast.success(`เพิ่ม ${menu.name} ลงบิลแล้ว (+1)`);
            const billRes = await apiGetSplitBill(id);
            setBillSummary(billRes.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddCustomItem = async () => {
        if (!customItemForm.name || !customItemForm.price) return toast.warn("กรุณากรอกชื่อและราคา");
        setActionLoading(true);
        try {
            await apiAddOrderItem(id, {
                isCustom: true,
                name: customItemForm.name,
                price: parseFloat(customItemForm.price),
                quantity: 1
            });
            toast.success("เพิ่มรายการอาหารเรียบร้อย!");
            setIsAddCustomModalOpen(false);
            setCustomItemForm({ name: '', price: '' });
            const billRes = await apiGetSplitBill(id);
            setBillSummary(billRes.data.data);
        } catch (error) {
            toast.error("เพิ่มรายการไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    };

    const handleKickMember = async (userId, userName) => {
        if (isCompleted || !window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการเตะ ${userName} ออกจากปาร์ตี้?`)) return;
        try {
            setActionLoading(true);
            await apiKickMember(id, userId);
            toast.success(`เตะ ${userName} ออกเรียบร้อย`);
            await loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || "ไม่สามารถเตะสมาชิกได้");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredMenuItems = React.useMemo(() => {
        if (!searchQuery.trim()) return menuItems;
        return menuItems.filter(item =>
            item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [menuItems, searchQuery]);

    if (errorObj) {
        return (
            <div className="w-full min-h-screen bg-[#FFF8F5] flex flex-col justify-center items-center p-6 text-center">
                <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
                <h2 className="text-xl font-bold text-[#2B361B] mb-2">เข้าปาร์ตี้ไม่ได้ 🥲</h2>
                <p className="text-red-500 mb-6 bg-red-50 p-4 rounded-xl font-mono text-sm break-all">{errorObj}</p>
                <button onClick={() => navigate('/')} className="px-6 py-3 bg-[#A65D2E] text-white rounded-full font-bold">กลับหน้าหลัก</button>
            </div>
        );
    }

    if (loading && !party) {
        return (
            <div className="w-full min-h-screen bg-[#FFF8F5] flex justify-center items-center">
                <span className="text-[#A65D2E] font-bold animate-pulse tracking-widest">LOADING...</span>
            </div>
        );
    }

    if (!party) return null;

    const mySummary = billSummary?.members?.find(m => m.user.id === user?.id) || {
        items: [],
        summary: { subtotal: 0, serviceCharge: 0, vat: 0, netTotal: 0 }
    };

    const sortedMembers = [...(party.members || [])].sort((a, b) => {
        const isAMe = a.user.id === user?.id;
        const isBMe = b.user.id === user?.id;
        const getWeight = (me, leader) => (me ? 2 : (leader ? 1 : 0));
        return getWeight(isBMe, b.user.id === party.leaderId) - getWeight(isAMe, a.user.id === party.leaderId);
    });

    const MenuItemCard = ({ item }) => {
        const tableItem = billSummary?.tableItems?.find(ti => ti.name === item.name && !ti.isCustom);
        const totalOrdered = tableItem ? tableItem.quantity : 0;
        return (
            <motion.div
                layout onClick={() => handleAddMenuToBill(item)}
                className={`p-4 rounded-[1.5rem] bg-white border border-[#EEE2D1] shadow-sm flex items-center gap-4 transition-all group ${isCompleted ? 'opacity-90' : 'cursor-pointer active:scale-[0.98] hover:border-[#A65D2E]/50'}`}
            >
                {item.imageUrl ? (<img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#EEE2D1]" />) : (<div className="w-16 h-16 rounded-xl bg-[#F7EAD7] flex items-center justify-center shrink-0 border border-[#EEE2D1]"><Utensils size={24} className="text-[#A65D2E]" /></div>)}
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[15px] text-[#2B361B] truncate leading-tight">{item.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-[13px] font-black text-[#A65D2E]">฿{item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                            {totalOrdered > 0 && (<span className="text-[10px] font-bold bg-[#F7EAD7] text-[#A65D2E] px-2 py-0.5 rounded-md">โต๊ะสั่งแล้ว {totalOrdered}</span>)}
                            {!isCompleted && (<button className="w-8 h-8 rounded-full bg-[#2B361B] flex items-center justify-center text-white shadow-sm transition-transform group-active:scale-95"><Plus size={16} /></button>)}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="relative w-full h-screen bg-[#FFF8F5] text-[#2B361B] overflow-hidden">
            <header className="absolute top-0 left-0 right-0 z-40 px-6 py-4 flex items-center gap-4">
                <div className="absolute inset-0 bg-[#FFF8F5]/70 backdrop-blur-xl -z-10 shadow-sm" style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} />
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-[#F7EAD7] transition-colors pointer-events-auto"><ArrowLeft size={24} className="text-[#2B361B]" /></button>
                <div className="flex-1 overflow-hidden">
                    <h1 className="text-xl font-extrabold text-[#2B361B]">{isQuickBill ? 'รายการหารบิลด่วน' : 'เลือกเมนูเข้าบิลโต๊ะ'}</h1>
                    <p className="text-[11px] font-bold text-[#A65D2E] uppercase tracking-wider mt-1 truncate">{party.name}</p>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className={`p-2.5 rounded-full bg-white/50 border border-[#EEE2D1] text-[#182806] shadow-sm hover:bg-[#F7EAD7] transition-all relative ${hasUnreadMessages ? 'animate-pulse' : ''}`}
                    >
                        <MessageSquare size={20} />
                        {hasUnreadMessages && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>
                    <PartyControlMenu party={party} isLeader={isLeader} isCompleted={isCompleted} onUpdate={loadData} />
                </div>
            </header>

            <main
                ref={scrollRef}
                onScroll={handleScroll}
                className="h-full overflow-y-auto no-scrollbar pt-24 pb-48 px-6 scroll-smooth"
            >
                {/* 🌟 Quick Bill: Invite Banner */}
                {isQuickBill && !isCompleted && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-5 rounded-[2rem] bg-primary text-primary-content shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20"><Users size={24} className="text-white" /></div>
                                <div className="flex-1"><h3 className="font-bold text-[14px]">ชวนเพื่อนมาหารบิลนี้</h3><p className="text-[10px] text-white/70 mt-0.5">บิลนี้เป็นส่วนตัว เฉพาะคนที่มีลิงก์เท่านั้นที่เข้าได้</p></div>
                            </div>
                            <button onClick={handleCopyInvite} className="w-full py-3 bg-white text-primary rounded-2xl text-[12px] font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"><Check size={16} strokeWidth={3} /> คัดลอกลิงก์ส่งให้เพื่อน</button>
                        </div>
                    </motion.div>
                )}

                <h3 className="text-[10px] font-bold text-[#8B837E] uppercase tracking-[0.2em] mb-4">สมาชิกในปาร์ตี้ ({party.members?.length || 0} คน)</h3>
                <div className="mb-6" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)' }}>
                    <div className="pl-5 flex gap-4 overflow-x-auto no-scrollbar pt-2 pb-2">
                        {sortedMembers?.map((member) => (
                            <div key={member.id} className="flex-none flex flex-col items-center gap-2 relative">
                                <div className="relative">
                                    <div onClick={() => handleAvatarClick(member.user.id)} className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-200 cursor-pointer active:scale-95 transition-transform"><img src={member.user.avatarUrl || `https://i.pravatar.cc/150?u=${member.user.id}`} alt={member.user.name} className="w-full h-full object-cover" /></div>
                                    {member.user.id === user?.id && (<div className="absolute -top-1 -right-0 bg-[#182806] p-1 rounded-full shadow-sm border border-white pointer-events-none"><UserIcon size={10} className="text-white fill-current" /></div>)}
                                    {member.user.id === party.leaderId && (<div className="absolute -top-1 -right-0 bg-yellow-400 p-1 rounded-full shadow-sm border border-white pointer-events-none"><Crown size={10} className="text-white fill-current" /></div>)}
                                    {isLeader && member.user.id !== party.leaderId && !isCompleted && (<button onClick={() => handleKickMember(member.user.id, member.user.name)} className="absolute -top-1 -left-1 bg-red-500 text-white p-1 rounded-full shadow-md border border-white hover:bg-red-600 transition-colors z-10"><X size={10} strokeWidth={3} /></button>)}
                                </div>
                                <span className={`text-[10px] font-bold truncate w-16 text-center ${member.user.id === user?.id ? 'text-[#A65D2E]' : 'text-[#2B361B]'}`}>{member.user.id === user?.id ? 'คุณ' : member.user.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`rounded-[2rem] p-5 mb-8 border flex gap-4 items-center ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-[#EAD9CF]/40 border-[#EAD9CF]'}`}>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">{isCompleted ? <Check size={20} className="text-green-600" /> : <Utensils size={20} className="text-[#A65D2E]" />}</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-[14px] leading-tight">{isCompleted ? 'บิลนี้ปิดยอดเรียบร้อยแล้ว' : isQuickBill ? 'เพิ่มรายการอาหารที่ต้องการหาร' : 'กดเมนูเพื่อเพิ่มเข้าบิลโต๊ะ'}</h3>
                        <p className="text-[11px] text-[#8B837E] mt-1 leading-relaxed">{isCompleted ? 'ดูสรุปยอดบิลได้ที่ปุ่มด้านล่าง' : 'แอดรายการแล้ว เพื่อนๆ จะสามารถมากดร่วมหารได้ทันทีครับ'}</p>
                    </div>
                    {isQuickBill && !isCompleted && (
                        <button onClick={() => setIsAddCustomModalOpen(true)} className="w-12 h-12 bg-primary text-primary-content rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0"><Plus size={24} strokeWidth={3} /></button>
                    )}
                </div>

                {!isQuickBill && (
                    <div className="space-y-4 mb-10 relative">
                        <div className="sticky -top-10 z-30 -mx-6 px-6 py-4 bg-[#FFF8F5]/80 backdrop-blur-xl mb-2 flex flex-col gap-4 border-b border-[#BC6C25]/5">
                            <h3 className="text-[10px] font-bold text-[#8B837E] uppercase tracking-[0.2em] flex items-center gap-2"><div className="h-px flex-1 bg-[#EAD9CF]" />เมนูจากร้าน {party.restaurant?.name}<div className="h-px flex-1 bg-[#EAD9CF]" /></h3>
                            <div className="relative group"><div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#BC6C25]"><Search size={16} strokeWidth={2.5} /></div><input type="text" placeholder="ค้นหาเมนูอาหาร..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-zinc-800 border border-[#BC6C25]/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-[#2B361B] dark:text-white placeholder:text-[#BC6C25]/40 focus:outline-none focus:ring-2 focus:ring-[#BC6C25]/20 transition-all shadow-sm" /></div>
                        </div>
                        <div className="space-y-3">{filteredMenuItems.length > 0 ? (filteredMenuItems.map(menu => <MenuItemCard key={menu.id} item={menu} />)) : (<div className="text-center py-10 opacity-40"><Search className="w-10 h-10 mx-auto text-[#BC6C25] mb-4 opacity-20" /><p className="text-[10px] font-black uppercase tracking-widest">ไม่พบเมนูที่ค้นหา</p></div>)}</div>
                    </div>
                )}
            </main>

            <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-[#EEE2D1] p-6 pb-10">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2"><Receipt size={18} className="text-[#A8A29F]" /><span className="text-[12px] font-bold text-[#8B837E] uppercase tracking-wider">ยอดรวมของคุณ (คนเดียว)</span></div><span className="text-[10px] font-bold bg-[#F7EAD7] text-[#A65D2E] px-2 py-1 rounded-md uppercase">คุณหารอยู่ {mySummary.items.length} รายการ</span></div>
                    <div className="flex justify-between items-end mb-6"><div className="text-4xl font-black text-[#2B361B] tracking-tight flex items-center gap-2"><motion.span key={mySummary.summary.netTotal} initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>฿{Math.ceil(mySummary.summary.netTotal || 0).toLocaleString()}</motion.span></div>{mySummary.items.length > 0 && (<div className="text-right flex flex-col items-end"><p className="text-[9px] text-[#A8A29F] font-bold leading-tight">(ค่าอาหาร ฿{Math.ceil(mySummary.summary.subtotal).toLocaleString()} + บริการ ฿{Math.ceil(mySummary.summary.serviceCharge).toLocaleString()} + ภาษี ฿{Math.ceil(mySummary.summary.vat).toLocaleString()})</p><p className="text-[8px] text-[#A65D2E] font-black uppercase mt-0.5">* หารเท่ากัน {billSummary?.members?.length} คน</p></div>)}</div>
                    <button onClick={() => navigate(`/party/${id}/split-bill/summary`)} className="w-full bg-[#182806] hover:bg-[#2D3E1A] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 relative overflow-hidden">{isCompleted ? 'ดูสรุปบิลทั้งโต๊ะ' : 'จัดการบิลทั้งโต๊ะ'}{billSummary?.tableItems?.length > 0 && (<span className="absolute right-4 bg-[#A65D2E] text-white text-[10px] px-2 py-0.5 rounded-full font-black">{isCompleted ? 'ยอดรวม' : 'โต๊ะสั่งแล้ว'} {billSummary.tableItems.reduce((acc, curr) => acc + curr.quantity, 0)} จาน</span>)}</button>
                </div>
            </div>

            <AnimatePresence>{showBackToTop && (<motion.button initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }} onClick={scrollToTop} className="fixed bottom-40 right-6 w-12 h-12 bg-white border border-[#EEE2D1] text-[#182806] rounded-full shadow-xl z-50 flex items-center justify-center active:scale-90 transition-transform"><ArrowUp size={20} strokeWidth={3} /></motion.button>)}</AnimatePresence>
            <GroupChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} party={party} user={user} />
            <CreateReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} restaurantId={party?.restaurantId} partyId={id} onReviewSuccess={() => { setHasHasReviewed(true); loadData(); toast.success("ขอบคุณสำหรับรีวิวครับ!"); }} />
            <ProfileQuickViewSheet isOpen={isProfileSheetOpen} userId={selectedUserId} onClose={() => setIsProfileSheetOpen(false)} navigate={navigate} />

            <AnimatePresence>{isAddCustomModalOpen && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FFF8F5] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-[#EEE2D1]"><h3 className="text-xl font-bold text-[#2B361B] mb-6">{isQuickBill ? 'เพิ่มรายการอาหาร 🍳' : 'เพิ่มเมนูพิเศษ 🍳'}</h3><div className="space-y-4 mb-8"><div><label className="text-[10px] font-bold text-[#8B837E] uppercase block mb-2 ml-1">ชื่อรายการ</label><input type="text" value={customItemForm.name} onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })} className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all" placeholder="เช่น ค่าข้าวกล่อง, ค่าโค้ก" /></div><div><label className="text-[10px] font-bold text-[#8B837E] uppercase block mb-2 ml-1">ราคา (฿)</label><input type="number" value={customItemForm.price} onChange={(e) => setCustomItemForm({ ...customItemForm, price: e.target.value })} className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all" placeholder="0.00" /></div></div><div className="flex gap-3"><button onClick={() => setIsAddCustomModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-[#8B837E] rounded-xl transition-colors">ยกเลิก</button><button onClick={handleAddCustomItem} disabled={actionLoading} className="flex-1 bg-primary text-primary-content py-3 rounded-xl text-sm font-bold shadow-md">เพิ่มรายการ</button></div></motion.div></div>)}</AnimatePresence>
            {!isQuickBill && <CreateReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} restaurantId={party?.restaurantId} partyId={id} onReviewSuccess={() => { setHasHasReviewed(true); loadData(); toast.success("ขอบคุณสำหรับรีวิวครับ!"); }} />}
        </div>
    );
};

export default SplitBillMenu;

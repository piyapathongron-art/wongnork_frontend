import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    ArrowLeft,
    Plus,
    Minus,
    Trash2,
    Check,
    Users,
    Utensils,
    Receipt,
    UserIcon,
    Star,
    ArrowUp,
    MessageSquare,
    Landmark,
    AlertCircle,
    Edit2
} from 'lucide-react';
import {
    apiGetPartyById,
    apiGetSplitBill,
    apiUpdateOrderItemQuantity,
    apiToggleOrderItemSharer,
    apiRemoveOrderItem,
    apiAddOrderItem,
    apiUpdatePartySettings
} from '../api/party';
import useUserStore from '../stores/userStore';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import PartyControlMenu from '../components/PartyControlMenu';
import CreateReviewModal from '../components/Modals/CreateReviewModal';
import GroupChatOverlay from '../components/GroupChatOverlay';
import { getSocket } from '../services/socket';
import PaymentModal from '../components/Modals/PaymentModal';
import useChatStore from '../stores/chatStore';

const SplitBillSummary = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);
    const scrollRef = useRef(null);

    const [party, setParty] = useState(null);
    const [billSummary, setBillSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // UI States
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const unreadCounts = useChatStore(state => state.unreadCounts);
    const hasUnreadMessages = (unreadCounts[id] || 0) > 0;

    // Modal state for Complete Party Confirmation
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

    // 🌟 Edit Settings State
    const [isEditingSettings, setIsEditingSettings] = useState(false);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // Review System State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [hasReviewed, setHasHasReviewed] = useState(false);

    // Modal state for Delete Confirmation
    const [itemToDelete, setItemToDelete] = useState(null);

    // Modal state for Custom Item
    const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
    const [customItemForm, setCustomItemForm] = useState({ name: '', price: '' });

    // Leader Settings State (for inputs)
    const [settingsForm, setSettingsForm] = useState({
        vat: 0,
        serviceCharge: 0,
        promptPayNumber: '',
        promptPayName: ''
    });

    const loadData = useCallback(async () => {
        try {
            const [partyRes, billRes] = await Promise.all([
                apiGetPartyById(id),
                apiGetSplitBill(id)
            ]);
            const partyData = partyRes.data.data;
            setParty(partyData);
            setBillSummary(billRes.data.data);

            // 🌟 Auto-fill logic: ถ้าในบิลไม่มี แต่ในโปรไฟล์มี ให้เอาในโปรไฟล์มาใช้เลย
            setSettingsForm({
                vat: partyData.vat || 0,
                serviceCharge: partyData.serviceCharge || 0,
                promptPayNumber: partyData.leader?.promptPayNumber || user?.promptPayNumber || '',
                promptPayName: partyData.leader?.promptPayName || user?.promptPayName || ''
            });

            if (partyData.restaurant?.reviews) {
                const myReview = partyData.restaurant.reviews.find(r => r.userId === user?.id && r.partyId === id);
                if (myReview) setHasHasReviewed(true);
            }
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถดึงข้อมูลบิลได้");
        } finally {
            setLoading(false);
        }
    }, [id, user?.id, user?.promptPayNumber, user?.promptPayName]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 🌟 Socket Room Management
    useEffect(() => {
        const token = useUserStore.getState().token;
        if (!token || !id) return;
        const socket = getSocket(token);
        socket.emit("join_room", id);
    }, [id]);


    const isLeader = party?.leaderId === user?.id;
    const isCompleted = party?.status === 'COMPLETED';

    // Handle Scrolling logic
    const handleScroll = (e) => {
        if (e.target.scrollTop > 400) setShowBackToTop(true);
        else setShowBackToTop(false);
    };

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdateSettings = async () => {
        if (!isLeader || isCompleted || actionLoading) return;
        setActionLoading(true);
        try {
            // 1. Update Party VAT/SC
            await apiUpdatePartySettings(id, {
                vat: parseFloat(settingsForm.vat) || 0,
                serviceCharge: parseFloat(settingsForm.serviceCharge) || 0
            });

            // 2. Update User Payment Info (PromptPay)
            const { apiUpdateProfile } = await import('../api/mainApi');
            await apiUpdateProfile({
                promptPayNumber: settingsForm.promptPayNumber,
                promptPayName: settingsForm.promptPayName
            });

            await loadData();
            setIsEditingSettings(false); // 🌟 ปิดโหมดแก้ไขเมื่อบันทึกสำเร็จ
            toast.success("อัปเดตข้อมูลบิลและช่องทางรับเงินสำเร็จ");
        } catch (error) {
            toast.error("อัปเดตไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteParty = async () => {
        if (!isLeader || isCompleted || actionLoading) return;
        setActionLoading(true);
        try {
            await apiUpdatePartySettings(id, { status: 'COMPLETED' });
            await loadData();
            setIsCompleteModalOpen(false);
            toast.success("ปิดปาร์ตี้เรียบร้อยแล้ว!");
        } catch (error) {
            toast.error("ไม่สามารถปิดปาร์ตี้ได้");
        } finally {
            setActionLoading(false);
        }
    };

    const handleQuantityChange = async (itemId, action) => {
        if (actionLoading || isCompleted) return;
        const item = billSummary.tableItems.find(i => i.id === itemId);
        if (action === 'decrement' && item.quantity <= 1) {
            setItemToDelete(item);
            return;
        }
        setActionLoading(true);
        try {
            await apiUpdateOrderItemQuantity(id, itemId, action);

            const { token } = useUserStore.getState();
            const socket = getSocket(token);
            socket.emit('send_message', {
                text: `${user.name} ได้ปรับจำนวน ${item.name} เป็น ${action === 'increment' ? item.quantity + 1 : item.quantity - 1} จาน`,
                partyId: id,
                type: 'SYSTEM'
            });

            await loadData();
        } catch (error) {
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete || actionLoading || isCompleted) return;
        setActionLoading(true);
        try {
            await apiRemoveOrderItem(id, itemToDelete.id);

            const { token } = useUserStore.getState();
            const socket = getSocket(token);
            socket.emit('send_message', {
                text: `${user.name} ได้ลบรายการ ${itemToDelete.name} ออกจากบิลโต๊ะ`,
                partyId: id,
                type: 'SYSTEM'
            });

            toast.success("ลบรายการสำเร็จ");
            setItemToDelete(null);
            await loadData();
        } catch (error) {
            toast.error("ลบรายการไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleSharer = async (itemId, isOptIn) => {
        if (actionLoading || isCompleted) return;
        setActionLoading(true);
        const action = isOptIn ? 'leave' : 'join';
        const item = billSummary.tableItems.find(i => i.id === itemId);
        try {
            await apiToggleOrderItemSharer(id, itemId, action);

            const { token } = useUserStore.getState();
            const socket = getSocket(token);
            socket.emit('send_message', {
                text: `${user.name} ได้${isOptIn ? 'ถอนตัวจากการหาร' : 'เข้าร่วมหาร'} ${item.name}`,
                partyId: id,
                type: 'SYSTEM'
            });

            await loadData();
        } catch (error) {
            toast.error("ไม่สามารถเปลี่ยนสถานะได้");
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddCustomItem = async () => {
        if (!customItemForm.name || !customItemForm.price) {
            return toast.warn("กรุณากรอกชื่อและราคา");
        }
        setActionLoading(true);
        try {
            await apiAddOrderItem(id, {
                isCustom: true,
                name: customItemForm.name,
                price: parseFloat(customItemForm.price),
                quantity: 1
            });
            toast.success("เพิ่มเมนูพิเศษเรียบร้อย!");
            setIsAddCustomModalOpen(false);
            setCustomItemForm({ name: '', price: '' });
            await loadData();
        } catch (error) {
            toast.error("เพิ่มเมนูไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !billSummary) return (
        <div className="w-full min-h-screen bg-[#FFF8F5] flex justify-center items-center">
            <span className="text-[#A65D2E] font-bold animate-pulse tracking-widest">LOADING...</span>
        </div>
    );

    const mySummary = billSummary?.members?.find(m => m.user.id === user?.id) || {
        items: [],
        summary: { subtotal: 0, serviceCharge: 0, vat: 0, netTotal: 0 }
    };

    return (
        <div className="relative w-full h-screen bg-[#FFF8F5] text-[#2B361B] font-sans overflow-hidden flex flex-col">
            <header className="bg-[#FFF8F5]/90 backdrop-blur-xl px-6 pt-12 pb-4 flex items-center gap-4 shadow-sm z-40 shrink-0">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-[#F7EAD7] transition-colors pointer-events-auto"><ArrowLeft size={24} className="text-[#2B361B]" /></button>
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2"><h1 className="text-xl font-extrabold text-[#2B361B] tracking-tight leading-none">สรุปบิลรวม</h1>{isCompleted && <span className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">ปิดจ็อบแล้ว</span>}</div>
                    <p className="text-[11px] font-bold text-[#A65D2E] uppercase tracking-wider mt-1 truncate">{party?.name}</p>
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
                className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-48 scroll-smooth"
            >
                {/* 🌟 Review Prompt for Completed Party */}
                {isCompleted && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-5 rounded-[2rem] bg-[#182806] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                                <Star size={24} className={`${hasReviewed ? 'text-gray-400' : 'text-yellow-400 fill-current animate-bounce'}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-[14px]">{hasReviewed ? 'ได้รับรีวิวของคุณแล้ว' : 'ประทับใจมื้อนี้แค่ไหน?'}</h3>
                                <p className="text-[10px] text-white/60 mt-0.5">{hasReviewed ? 'ขอบคุณที่ร่วมแบ่งปันประสบการณ์ครับ' : 'ให้คะแนนร้านอาหาร'}</p>
                            </div>
                            <button
                                onClick={() => !hasReviewed && setIsReviewModalOpen(true)}
                                disabled={hasReviewed}
                                className={`px-5 py-2.5 rounded-full text-[11px] font-black transition-all ${hasReviewed ? 'bg-white/10 text-white/40' : 'bg-[#A65D2E] text-white shadow-lg active:scale-95'}`}
                            >
                                {hasReviewed ? 'รีวิวแล้ว' : 'เขียนรีวิว'}
                            </button>
                        </div>
                    </motion.div>
                )}

                <div className="bg-[#182806] rounded-[2rem] p-6 mb-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#F7EAD7] opacity-80 mb-1 block">ยอดรวมทั้งโต๊ะ (Grand Total)</span>
                        <div className="text-4xl font-black mb-1">฿{Math.ceil(billSummary?.grandTotal || 0).toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-[#F7EAD7]/60 flex gap-2"><span>(ค่าอาหาร ฿{Math.ceil(billSummary?.grandTotal - (billSummary?.vatAmount + billSummary?.serviceChargeAmount) || 0).toLocaleString()} + บริการ ฿{Math.ceil(billSummary?.serviceChargeAmount || 0).toLocaleString()} + ภาษี ฿{Math.ceil(billSummary?.vatAmount || 0).toLocaleString()})</span></div>
                        <div className="flex gap-4 mt-4"><div className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2"><Users size={12} className="text-[#F7EAD7]" /><span className="text-xs font-medium">{billSummary?.members?.length} คน</span></div><div className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2"><Utensils size={12} className="text-[#F7EAD7]" /><span className="text-xs font-medium">{billSummary?.tableItems?.reduce((acc, curr) => acc + curr.quantity, 0)} จาน</span></div></div>
                    </div>
                </div>
                {isCompleted && (<div className="mt-12 mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl text-center"><Check size={32} className="text-green-600 mx-auto mb-2" /><h4 className="text-green-800 font-bold">ปาร์ตี้นี้ปิดยอดเรียบร้อยแล้ว</h4><p className="text-green-600/70 text-[10px] mt-1">ข้อมูลถูกล็อกไว้เพื่อความถูกต้องในการโอนเงิน</p></div>)}

                {isLeader && (
                    <div className="bg-white border border-[#EEE2D1] rounded-[2.5rem] p-6 mb-8 shadow-sm transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black text-[#8B837E] uppercase tracking-widest flex items-center gap-2">
                                <Receipt size={14} className="text-[#A65D2E]" /> ตั้งค่าบิลและช่องทางรับเงิน
                            </h3>
                            {!isCompleted && !isEditingSettings && (
                                <button
                                    onClick={() => setIsEditingSettings(true)}
                                    className="p-2 bg-[#F7EAD7] text-[#A65D2E] rounded-full hover:bg-[#EAD9CF] transition-colors"
                                >
                                    <Edit2 size={14} />
                                    <span className="sr-only">Edit</span>
                                </button>
                            )}
                        </div>

                        {!isEditingSettings ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#FFF8F5] p-3 rounded-2xl border border-[#EEE2D1]/50">
                                        <p className="text-[8px] font-black text-[#A65D2E] uppercase mb-1">Service Charge</p>
                                        <p className="text-sm font-bold text-[#2B361B]">฿{settingsForm.serviceCharge.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-[#FFF8F5] p-3 rounded-2xl border border-[#EEE2D1]/50">
                                        <p className="text-[8px] font-black text-[#A65D2E] uppercase mb-1">VAT</p>
                                        <p className="text-sm font-bold text-[#2B361B]">฿{settingsForm.vat.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="bg-[#F7FCF0] p-4 rounded-2xl border border-[#182806]/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <Landmark size={16} className="text-[#182806]" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-[#182806]/60 uppercase">พร้อมเพย์รับเงิน</p>
                                            <p className="text-sm font-black text-[#182806]">{settingsForm.promptPayNumber || 'ยังไม่ได้ระบุ'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-black text-[#A65D2E] uppercase block mb-1 ml-1">Service Charge (฿)</label>
                                        <input type="number" value={settingsForm.serviceCharge} onChange={(e) => setSettingsForm({ ...settingsForm, serviceCharge: e.target.value })} placeholder="0" className="w-full bg-[#FFF8F5] border border-[#EEE2D1] rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-[#A65D2E] transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-[#A65D2E] uppercase block mb-1 ml-1">VAT (฿)</label>
                                        <input type="number" value={settingsForm.vat} onChange={(e) => setSettingsForm({ ...settingsForm, vat: e.target.value })} placeholder="0" className="w-full bg-[#FFF8F5] border border-[#EEE2D1] rounded-xl py-2 px-3 text-sm font-bold outline-none focus:border-[#A65D2E] transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-[#182806] uppercase block mb-2 ml-1">เบอร์พร้อมเพย์รับเงิน</label>
                                    <input type="text" value={settingsForm.promptPayNumber} onChange={(e) => setSettingsForm({ ...settingsForm, promptPayNumber: e.target.value })} placeholder="08x-xxx-xxxx" className="w-full bg-[#F7FCF0] border border-[#182806]/10 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:border-[#182806] transition-all text-[#182806]" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setIsEditingSettings(false);
                                            loadData(); // Reset form
                                        }}
                                        className="flex-1 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold active:scale-95 transition-all"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleUpdateSettings}
                                        disabled={actionLoading}
                                        className="flex-[2] py-2.5 bg-[#182806] text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? 'กำลังบันทึก...' : <><Check size={14} strokeWidth={3} /> บันทึกการตั้งค่า</>}
                                    </button>
                                </div>
                            </div>
                        )}
                        {!isEditingSettings && !isCompleted && (
                            <p className="text-[8px] text-gray-400 mt-4 italic text-center">* ยอดเงินที่กรอกจะถูกหารเฉลี่ยให้สมาชิกทุกคนอัตโนมัติ</p>
                        )}
                    </div>
                )}

                {!isLeader && party?.leader?.promptPayNumber && (
                    <div className="mb-8 p-5 rounded-[2rem] bg-blue-600 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                                <Landmark size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-[14px]">พร้อมโอนหรือยัง?</h3>
                                <p className="text-[10px] text-white/70 mt-0.5">กดเพื่อแสดง QR Code พร้อมเพย์ของหัวหน้า</p>
                            </div>
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="px-5 py-2.5 bg-white text-blue-600 rounded-full text-[11px] font-black shadow-lg active:scale-95 transition-all"
                            >
                                สแกนจ่าย
                            </button>
                        </div>
                    </div>
                )}

                {/*  no PromptPay */}
                {!isLeader && !party?.leader?.promptPayNumber && (
                    <div className={`mb-8 p-5 rounded-[2rem] border relative overflow-hidden transition-all ${isCompleted ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isCompleted ? 'bg-white text-orange-500' : 'bg-white text-gray-400'}`}>
                                <AlertCircle size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold text-[14px] ${isCompleted ? 'text-orange-900' : 'text-gray-700'}`}>
                                    {isCompleted ? 'ไม่พบข้อมูลการโอนเงิน' : 'ยังไม่มีช่องทางรับเงิน'}
                                </h3>
                                <p className={`text-[10px] mt-0.5 leading-relaxed ${isCompleted ? 'text-orange-700/80' : 'text-gray-500'}`}>
                                    หัวหน้าตี้นี้ไม่ได้ลงทะเบียน PromptPay กับระบบ <br />
                                    กรุณาสอบถามเลขบัญชีเพื่อโอนเงินกับหัวหน้าโดยตรงครับ
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4"><h3 className="text-[12px] font-bold text-[#8B837E] uppercase tracking-[0.2em]">รายการอาหารในโต๊ะ</h3>{!isCompleted && (<button onClick={() => setIsAddCustomModalOpen(true)} className="text-[#A65D2E] text-xs font-bold flex items-center gap-1 hover:underline"><Plus size={14} /> เพิ่มเมนูพิเศษ</button>)}</div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {billSummary?.tableItems?.map((item) => {
                            const isOptIn = item.sharers.some(s => s.id === user?.id);
                            return (
                                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={`p-4 rounded-[1.5rem] bg-white border shadow-sm transition-all ${isOptIn ? 'border-[#A65D2E] ring-1 ring-[#A65D2E]/10' : 'border-[#EEE2D1] opacity-70'}`}>
                                    <div className="flex gap-3 mb-3">{item.imageUrl ? (<img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#EEE2D1]" />) : (<div className="w-12 h-12 rounded-lg bg-[#F7EAD7] flex items-center justify-center shrink-0 border border-[#EEE2D1]"><Utensils size={16} className="text-[#A65D2E]" /></div>)}<div className="flex-1 min-w-0"><h4 className="font-bold text-[14px] text-[#2B361B] truncate">{item.name} {item.isCustom && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium ml-1">พิเศษ</span>}</h4><div className="text-[12px] font-black text-[#A65D2E]">฿{item.price?.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">/ จาน</span></div></div></div>
                                    <div className="flex items-center justify-between border-t border-[#EEE2D1]/50 pt-3"><div className="flex items-center gap-2"><button onClick={() => handleToggleSharer(item.id, isOptIn)} disabled={isCompleted} className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${isOptIn ? 'bg-[#A65D2E] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{isOptIn ? <><Check size={12} strokeWidth={3} /> คุณร่วมหาร</> : 'ฉันไม่ได้กิน'}</button>{item.sharers.length > 0 && (<div className="flex -space-x-1">{item.sharers.slice(0, 3).map(s => (<img key={s.id} src={s.avatarUrl || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 object-cover shadow-sm" title={s.name} />))}{item.sharers.length > 3 && <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600 shadow-sm">+{item.sharers.length - 3}</div>}</div>)}</div><div className="flex items-center gap-3 bg-[#FFF8F5] p-1 rounded-xl border border-[#EEE2D1]"><button onClick={() => handleQuantityChange(item.id, 'decrement')} disabled={actionLoading || isCompleted} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm text-red-500 hover:bg-red-50 active:scale-95 transition-colors disabled:opacity-30">{item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}</button><span className="font-bold text-[14px] w-4 text-center text-[#2B361B]">{item.quantity}</span><button onClick={() => handleQuantityChange(item.id, 'increment')} disabled={actionLoading || isCompleted} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#2B361B] shadow-sm text-white hover:bg-[#1A2210] active:scale-95 transition-colors disabled:opacity-30"><Plus size={14} /></button></div></div>
                                    {isOptIn && item.costPerPerson > 0 && (<div className="mt-3 bg-[#FFF8F5] rounded-xl p-2.5 flex justify-between items-center border border-[#EEE2D1]"><span className="text-[10px] font-bold text-[#8B837E]">คุณหารอยู่ที่:</span><span className="text-[13px] font-black text-[#A65D2E]">฿{Math.ceil(item.costPerPerson).toLocaleString()}</span></div>)}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {isLeader && !isCompleted && (<button onClick={() => setIsCompleteModalOpen(true)} className="w-full mt-12 mb-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"><Check size={18} strokeWidth={3} /> ปิดจ็อบปาร์ตี้และสรุปยอดบิล</button>)}
            </main>

            <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border-t border-[#EEE2D1] p-6 pb-10">
                <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-1"><span className="text-[12px] font-bold text-[#8B837E] uppercase tracking-wider flex items-center gap-1"><UserIcon size={14} /> ยอดที่คุณต้องจ่าย</span><div className="text-2xl font-black text-[#A65D2E] tracking-tight"><motion.span key={mySummary.summary.netTotal} initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>฿{Math.ceil(mySummary.summary.netTotal || 0).toLocaleString()}</motion.span></div></div>
                    {mySummary.items.length >= 0 && (<div className="text-[9px] text-[#A8A29F] font-medium text-right mt-1 flex flex-col"><span>(ค่าอาหาร ฿{Math.ceil(mySummary.summary.subtotal).toLocaleString()} + บริการ ฿{Math.ceil(mySummary.summary.serviceCharge).toLocaleString()} + ภาษี ฿{Math.ceil(mySummary.summary.vat).toLocaleString()})</span><span className="text-[#A65D2E] font-bold uppercase mt-0.5">* หารเท่ากันทั้งโต๊ะ {billSummary?.members?.length} คน</span></div>)}
                </div>
            </div>

            {/* 🚀 To the Top Button */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        onClick={scrollToTop}
                        className="fixed bottom-40 right-6 w-12 h-12 bg-white border border-[#EEE2D1] text-[#182806] rounded-full shadow-xl z-50 flex items-center justify-center active:scale-90 transition-transform pointer-events-auto"
                    >
                        <ArrowUp size={20} strokeWidth={3} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* 💬 Shared Group Chat Overlay */}
            <GroupChatOverlay
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                party={party}
                user={user}
            />

            {/* 💳 Payment QR Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                leader={party?.leader}
                amount={mySummary.summary.netTotal}
            />

            {/* Modal: Delete Confirmation */}
            <AnimatePresence>{itemToDelete && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-6"><motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white w-full max-w-xs rounded-[2rem] p-6 text-center shadow-2xl"><div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div><h3 className="text-lg font-bold text-[#2B361B] mb-2">ลบรายการอาหาร?</h3><p className="text-sm text-[#8B837E] mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบ "{itemToDelete.name}" ออกจากบิลโต๊ะ</p><div className="flex gap-3"><button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-gray-100 text-[#8B837E] hover:bg-gray-200 transition-colors rounded-xl font-bold text-sm">ยกเลิก</button><button onClick={handleDeleteItem} className="flex-1 py-3 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-xl font-bold text-sm shadow-md">ลบรายการ</button></div></motion.div></motion.div>)}</AnimatePresence>

            {/* Modal: Add Custom Item */}
            <AnimatePresence>{isAddCustomModalOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-6"><motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-[#FFF8F5] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-[#EEE2D1]"><h3 className="text-xl font-bold text-[#2B361B] mb-6">เพิ่มเมนูพิเศษ 🍳</h3><div className="space-y-4 mb-8"><div><label className="text-[10px] font-bold text-[#8B837E] uppercase tracking-widest block mb-2 ml-1">ชื่อเมนู</label><input type="text" value={customItemForm.name} onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })} placeholder="เช่น เครื่องดื่ม, ค่าเปิดขวด" className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all text-sm" /></div><div><label className="text-[10px] font-bold text-[#8B837E] uppercase tracking-widest block mb-2 ml-1">ราคา (฿)</label><input type="number" value={customItemForm.price} onChange={(e) => setCustomItemForm({ ...customItemForm, price: e.target.value })} placeholder="0.00" className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all text-sm" /></div></div><div className="flex gap-3"><button onClick={() => setIsAddCustomModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-[#8B837E] hover:bg-[#EAD9CF] rounded-xl transition-colors">ยกเลิก</button><button onClick={handleAddCustomItem} disabled={actionLoading} className="flex-1 bg-[#A65D2E] hover:bg-[#8B4D24] transition-colors text-white py-3 rounded-xl text-sm font-bold shadow-md">{actionLoading ? 'กำลังเพิ่ม...' : 'เพิ่มลงบิล'}</button></div></motion.div></motion.div>)}</AnimatePresence>

            {/* Modal: Complete Party Confirmation */}
            <AnimatePresence>{isCompleteModalOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-6"><motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl"><div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} strokeWidth={3} /></div><h3 className="text-xl font-black text-[#2B361B] mb-3">ยืนยันการสรุปยอดบิล?</h3><p className="text-sm text-[#8B837E] mb-8 leading-relaxed">เมื่อยืนยันแล้ว สมาชิกทุกคนจะไม่สามารถแก้ไขรายการอาหารหรือจำนวนได้อีก คุณแน่ใจใช่หรือไม่?</p><div className="flex gap-3"><button onClick={() => setIsCompleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-[#8B837E] hover:bg-gray-200 transition-colors rounded-xl font-bold text-sm">ยังก่อน</button><button onClick={handleCompleteParty} disabled={actionLoading} className="flex-1 py-3 bg-green-600 hover:bg-green-700 transition-colors text-white rounded-xl font-bold text-sm shadow-md">ใช่, ปิดจ็อบเลย</button></div></motion.div></motion.div>)}</AnimatePresence>

            {/* 🌟 Review Modal */}
            <CreateReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                restaurantId={party?.restaurant?.id}
                partyId={id}
                onReviewSuccess={() => {
                    setHasHasReviewed(true);
                    loadData();
                    toast.success("ขอบคุณสำหรับรีวิวครับ!");
                }}
            />
        </div>
    );
};

export default SplitBillSummary;



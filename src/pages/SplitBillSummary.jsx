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
    Edit2,
    Camera,
    ExternalLink,
    Eye,
    ShieldCheck,
    Clock as ClockIcon,
    X,
    QrCode,
    RefreshCcw
} from 'lucide-react';
import {
    apiGetPartyById,
    apiGetSplitBill,
    apiUpdateOrderItemQuantity,
    apiToggleOrderItemSharer,
    apiRemoveOrderItem,
    apiAddOrderItem,
    apiUpdatePartySettings,
    apiNotifyPayment,
    apiVerifyPayment,
    apiCancelPayment
} from '../api/party';
import useUserStore from '../stores/userStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import PartyControlMenu from '../components/PartyControlMenu';
import CreateReviewModal from '../components/Modals/CreateReviewModal';
import GroupChatOverlay from '../components/GroupChatOverlay';
import { getSocket } from '../services/socket';
import PaymentModal from '../components/Modals/PaymentModal';
import useChatStore from '../stores/chatStore';
import uploadCloudinary from '../utils/cloudinary';

const SplitBillSummary = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);

    const [party, setParty] = useState(null);
    const [billSummary, setBillSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // 🌟 Tab State
    const [activeTab, setActiveTab] = useState('items'); // 'items' | 'payments'

    // UI States
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const unreadCounts = useChatStore(state => state.unreadCounts);
    const hasUnreadMessages = (unreadCounts[id] || 0) > 0;

    // Modal states
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
    const [isCancelPaymentModalOpen, setIsCancelPaymentModalOpen] = useState(false);

    // Payment Status State
    const [isNotifyPaymentModalOpen, setIsNotifyPaymentModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [slipPreviewUrl, setSlipPreviewUrl] = useState(null);

    // Form States
    const [customItemForm, setCustomItemForm] = useState({ name: '', price: '' });
    const [settingsForm, setSettingsForm] = useState({
        vat: 0,
        serviceCharge: 0,
        promptPayNumber: '',
        promptPayName: ''
    });
    const [hasReviewed, setHasHasReviewed] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [partyRes, billRes] = await Promise.all([
                apiGetPartyById(id),
                apiGetSplitBill(id)
            ]);
            const partyData = partyRes.data.data;
            setParty(partyData);
            setBillSummary(billRes.data.data);

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

    useEffect(() => {
        const token = useUserStore.getState().token;
        if (!token || !id) return;
        const socket = getSocket(token);
        socket.emit("join_room", id);
    }, [id]);

    const isLeader = party?.leaderId === user?.id;
    const isCompleted = party?.status === 'COMPLETED';
    const isPendingSettlement = party?.status === 'PENDING_SETTLEMENT';

    // 🌟 Current User Payment Status
    const mySummary = billSummary?.members?.find(m => m.user.id === user?.id) || {
        items: [],
        summary: { subtotal: 0, serviceCharge: 0, vat: 0, netTotal: 0 },
        paymentStatus: 'PENDING'
    };
    const isMyPaymentLocked = mySummary.paymentStatus === 'PAID' || mySummary.paymentStatus === 'VERIFIED';

    const handleScroll = (e) => {
        if (e.target.scrollTop > 400) setShowBackToTop(true);
        else setShowBackToTop(false);
    };

    const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    const handleUpdateSettings = async () => {
        if (!isLeader || isCompleted || actionLoading) return;
        setActionLoading(true);
        try {
            await apiUpdatePartySettings(id, {
                vat: parseFloat(settingsForm.vat) || 0,
                serviceCharge: parseFloat(settingsForm.serviceCharge) || 0,
                promptPayNumber: settingsForm.promptPayNumber,
                promptPayName: settingsForm.promptPayName
            });
            const { apiUpdateProfile } = await import('../api/mainApi');
            await apiUpdateProfile({
                promptPayNumber: settingsForm.promptPayNumber,
                promptPayName: settingsForm.promptPayName
            });
            await loadData();
            setIsEditingSettings(false);
            toast.success("อัปเดตข้อมูลบิลและช่องทางรับเงินสำเร็จ");
        } catch (error) {
            console.log(error)
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
            console.log(error)
            toast.error("ไม่สามารถปิดปาร์ตี้ได้");
        } finally {
            setActionLoading(false);
        }
    };

    const handleQuantityChange = async (itemId, action) => {
        if (actionLoading || isCompleted || isMyPaymentLocked) return;
        const item = billSummary.tableItems.find(i => i.id === itemId);
        if (action === 'decrement' && item.quantity <= 1) {
            setItemToDelete(item);
            return;
        }
        setActionLoading(true);
        try {
            await apiUpdateOrderItemQuantity(id, itemId, action);
            await loadData();
        } catch (error) {
            console.log(error)
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete || actionLoading || isCompleted || isMyPaymentLocked) return;
        setActionLoading(true);
        try {
            await apiRemoveOrderItem(id, itemToDelete.id);
            toast.success("ลบรายการสำเร็จ");
            setItemToDelete(null);
            await loadData();
        } catch (error) {
            console.log(error)
            toast.error("ลบรายการไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleSharer = async (itemId, isOptIn) => {
        if (actionLoading || isCompleted || isMyPaymentLocked) return;
        setActionLoading(true);
        const action = isOptIn ? 'leave' : 'join';
        try {
            await apiToggleOrderItemSharer(id, itemId, action);
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
            console.log(error)
            toast.error("เพิ่มเมนูไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleNotifyPayment = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            let finalSlipUrl = null;
            if (selectedFile) {
                finalSlipUrl = await uploadCloudinary(selectedFile);
            }
            await apiNotifyPayment(id, { paymentSlipUrl: finalSlipUrl });
            toast.success("แจ้งชำระเงินเรียบร้อย รอหัวหน้าตรวจสอบครับ");
            setIsNotifyPaymentModalOpen(false);
            setPreviewUrl('');
            setSelectedFile(null);
            await loadData();
        } catch (error) {
            console.log(error)
            toast.error("แจ้งชำระเงินไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    };

    const handleVerifyPayment = async (userId) => {
        if (!isLeader || actionLoading) return;
        setActionLoading(true);
        try {
            await apiVerifyPayment(id, userId);
            toast.success("ยืนยันยอดเงินเรียบร้อย ✅");
            await loadData();
        } catch (error) {
            toast.error("ไม่สามารถยืนยันได้");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelPayment = async () => {
        setActionLoading(true);
        setIsCancelPaymentModalOpen(false);
        try {
            await apiCancelPayment(id);
            toast.success("ยกเลิกการแจ้งโอนแล้ว คุณสามารถแก้ไขรายการอาหารได้");
            await loadData();
        } catch (error) {
            toast.error("ยกเลิกไม่สำเร็จ");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !billSummary) return (
        <div className="w-full min-h-screen bg-[#FFF8F5] flex justify-center items-center">
            <span className="text-[#A65D2E] font-bold animate-pulse tracking-widest">LOADING...</span>
        </div>
    );

    return (
        <div className="relative w-full h-screen bg-[#FFF8F5] text-[#2B361B] font-sans overflow-hidden flex flex-col">
            <header className="bg-[#FFF8F5]/90 backdrop-blur-xl px-6 pt-12 pb-4 flex items-center gap-4 shadow-sm z-40 shrink-0">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-[#F7EAD7] transition-colors pointer-events-auto"><ArrowLeft size={24} className="text-[#2B361B]" /></button>
                <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-extrabold text-[#2B361B] tracking-tight leading-none">สรุปบิลรวม</h1>
                        {isCompleted && <span className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">ปิดจ็อบแล้ว</span>}
                        {isPendingSettlement && <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">รอสรุปยอด</span>}
                    </div>
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
                {/* 🌟 Reminders */}
                {isPendingSettlement && isLeader && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 rounded-[2rem] bg-orange-500 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20"><ClockIcon size={24} className="text-white animate-pulse" /></div>
                                <div className="flex-1"><h3 className="font-bold text-[14px]">ถึงเวลาสรุปยอดแล้ว! ⏰</h3><p className="text-[10px] text-white/80 mt-0.5 leading-relaxed">รบกวนหัวหน้าช่วยตรวจสอบรายการและกด "ปิดจ็อบ" เพื่อให้ทุกคนรีวิวได้ครับ</p></div>
                            </div>
                            <button onClick={() => setIsCompleteModalOpen(true)} className="w-full py-3 bg-white text-orange-600 rounded-2xl text-[12px] font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"><Check size={16} strokeWidth={3} /> สรุปยอดและปิดปาร์ตี้ตอนนี้</button>
                        </div>
                    </motion.div>
                )}

                {isCompleted && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-5 rounded-[2rem] bg-[#182806] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20"><Star size={24} className={`${hasReviewed ? 'text-gray-400' : 'text-yellow-400 fill-current animate-bounce'}`} /></div>
                            <div className="flex-1"><h3 className="font-bold text-[14px]">{hasReviewed ? 'ได้รับรีวิวของคุณแล้ว' : 'ประทับใจมื้อนี้แค่ไหน?'}</h3><p className="text-[10px] text-white/60 mt-0.5">ให้คะแนนร้านอาหารเพื่อรับเหรียญยืนยัน</p></div>
                            <button onClick={() => !hasReviewed && setIsReviewModalOpen(true)} disabled={hasReviewed} className={`px-5 py-2.5 rounded-full text-[11px] font-black transition-all ${hasReviewed ? 'bg-white/10 text-white/40' : 'bg-[#A65D2E] text-white shadow-lg active:scale-95'}`}>{hasReviewed ? 'รีวิวแล้ว' : 'เขียนรีวิว'}</button>
                        </div>
                    </motion.div>
                )}

                {/* 🌟 Grand Total Card */}
                <div className="bg-[#182806] rounded-[2rem] p-6 mb-6 text-white relative overflow-hidden shadow-xl shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#F7EAD7] opacity-80 mb-1 block">ยอดรวมทั้งโต๊ะ (Grand Total)</span>
                        <div className="text-4xl font-black mb-1">฿{Math.ceil(billSummary?.grandTotal || 0).toLocaleString()}</div>
                        <div className="text-[10px] font-bold text-[#F7EAD7]/60 flex gap-2"><span>(ค่าอาหาร ฿{Math.ceil(billSummary?.grandTotal - (billSummary?.vatAmount + billSummary?.serviceChargeAmount) || 0).toLocaleString()} + บริการ ฿{Math.ceil(billSummary?.serviceChargeAmount || 0).toLocaleString()} + ภาษี ฿{Math.ceil(billSummary?.vatAmount || 0).toLocaleString()})</span></div>
                    </div>
                </div>

                {/* 🌟 Tab Switcher */}
                <div className="flex p-1.5 bg-[#EAD9CF]/30 rounded-2xl mb-8 border border-[#EEE2D1] sticky top-0 z-30 backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'items' ? 'bg-white text-[#2B361B] shadow-sm' : 'text-[#8B837E]'}`}
                    >
                        <Utensils size={14} /> รายการอาหาร
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'payments' ? 'bg-white text-primary shadow-sm' : 'text-[#8B837E]'}`}
                    >
                        <Landmark size={14} /> การจ่ายเงิน
                    </button>
                </div>

                {/* 🌟 Tab Content: Shared Items */}
                {activeTab === 'items' && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-[10px] font-bold text-[#8B837E] uppercase tracking-[0.2em]">เมนูในบิล ({billSummary?.tableItems?.length || 0})</h3>
                            {!isCompleted && !isMyPaymentLocked && (
                                <button onClick={() => setIsAddCustomModalOpen(true)} className="text-[#A65D2E] text-[10px] font-black uppercase flex items-center gap-1.5 bg-[#F7EAD7] px-3 py-1.5 rounded-full active:scale-95 transition-all">
                                    <Plus size={12} strokeWidth={3} /> เพิ่มเมนูพิเศษ
                                </button>
                            )}
                        </div>

                        {isMyPaymentLocked && (
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
                                <ShieldCheck size={18} className="text-blue-500 shrink-0" />
                                <p className="text-[10px] text-blue-700 leading-relaxed font-medium">รายการหารถูกล็อกไว้เนื่องจากคุณแจ้งชำระเงินแล้ว <br /> หากต้องการหารอาหารเพิ่ม กรุณายกเลิกการแจ้งโอนเงินในหน้า "การจ่ายเงิน" ก่อนครับ</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {billSummary?.tableItems?.map((item) => {
                                    const isOptIn = item.sharers.some(s => s.id === user?.id);
                                    return (
                                        <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`p-4 rounded-[1.5rem] bg-white border shadow-sm transition-all ${isOptIn ? 'border-[#A65D2E] ring-1 ring-[#A65D2E]/10' : 'border-[#EEE2D1] opacity-70'}`}>
                                            <div className="flex gap-3 mb-3">{item.imageUrl ? (<img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#EEE2D1]" />) : (<div className="w-12 h-12 rounded-lg bg-[#F7EAD7] flex items-center justify-center shrink-0 border border-[#EEE2D1]"><Utensils size={16} className="text-[#A65D2E]" /></div>)}<div className="flex-1 min-w-0"><h4 className="font-bold text-[14px] text-[#2B361B] truncate">{item.name} {item.isCustom && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium ml-1">พิเศษ</span>}</h4><div className="text-[12px] font-black text-[#A65D2E]">฿{item.price?.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">/ จาน</span></div></div></div>
                                            <div className="flex items-center justify-between border-t border-[#EEE2D1]/50 pt-3"><div className="flex items-center gap-2"><button onClick={() => handleToggleSharer(item.id, isOptIn)} disabled={isCompleted || isMyPaymentLocked} className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${isOptIn ? 'bg-[#A65D2E] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'} disabled:opacity-50`}>{isOptIn ? <><Check size={12} strokeWidth={3} /> คุณร่วมหาร</> : 'ฉันไม่ได้กิน'}</button>{item.sharers.length > 0 && (<div className="flex -space-x-1">{item.sharers.slice(0, 3).map(s => (<img key={s.id} src={s.avatarUrl || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 object-cover shadow-sm" />))}{item.sharers.length > 3 && <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600 shadow-sm">+{item.sharers.length - 3}</div>}</div>)}</div><div className="flex items-center gap-3 bg-[#FFF8F5] p-1 rounded-xl border border-[#EEE2D1]"><button onClick={() => handleQuantityChange(item.id, 'decrement')} disabled={actionLoading || isCompleted || isMyPaymentLocked} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm text-red-500 transition-colors disabled:opacity-30">{item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}</button><span className="font-bold text-[14px] w-4 text-center text-[#2B361B]">{item.quantity}</span><button onClick={() => handleQuantityChange(item.id, 'increment')} disabled={actionLoading || isCompleted || isMyPaymentLocked} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#2B361B] shadow-sm text-white transition-colors disabled:opacity-30"><Plus size={14} /></button></div></div>
                                            {isOptIn && item.costPerPerson > 0 && (<div className="mt-3 bg-[#FFF8F5] rounded-xl p-2.5 flex justify-between items-center border border-[#EEE2D1]"><span className="text-[10px] font-bold text-[#8B837E]">คุณหารอยู่ที่:</span><span className="text-[13px] font-black text-[#A65D2E]">฿{Math.ceil(item.costPerPerson).toLocaleString()}</span></div>)}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* 🌟 Tab Content: Payment Dashboard */}
                {activeTab === 'payments' && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

                        {/* PromptPay Alert for Members */}
                        {!isLeader && !party?.leader?.promptPayNumber && (
                            <div className="p-5 rounded-3xl bg-red-50 border border-red-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white text-red-500 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-red-100"><AlertCircle size={24} strokeWidth={2.5} /></div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-red-900 leading-tight">ยังไม่มีช่องทางรับเงิน! ⚠️</h4>
                                    <p className="text-[10px] text-red-700/70 mt-1 leading-relaxed italic">หัวหน้ากลุ่มยังไม่ได้ใส่เบอร์พร้อมเพย์ รบกวนแจ้งหัวหน้าในแชทให้ระบุข้อมูลด้วยครับ</p>
                                </div>
                            </div>
                        )}

                        {/* Payment Button for Members */}
                        {!isLeader && party?.leader?.promptPayNumber && (
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="w-full p-6 rounded-[2.5rem] bg-blue-600 text-white shadow-xl relative overflow-hidden active:scale-[0.98] transition-all"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                <div className="flex items-center gap-5 relative z-10 text-left">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                                        <QrCode size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg leading-tight uppercase tracking-tight">สแกนจ่ายค่าอาหาร</h3>
                                        <p className="text-[10px] text-white/70 mt-0.5 font-bold uppercase tracking-widest flex items-center gap-1">ดู QR พร้อมเพย์ของหัวหน้า <ExternalLink size={10} /></p>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Leader Bill Settings */}
                        {isLeader && (
                            <div className="bg-white border border-[#EEE2D1] rounded-[2.5rem] p-6 shadow-sm transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[10px] font-black text-[#8B837E] uppercase tracking-widest flex items-center gap-2"><Receipt size={14} className="text-[#A65D2E]" /> ตั้งค่าบิลและพร้อมเพย์</h3>
                                    {!isCompleted && !isEditingSettings && (<button onClick={() => setIsEditingSettings(true)} className="p-2 bg-[#F7EAD7] text-[#A65D2E] rounded-full hover:bg-[#EAD9CF] transition-colors"><Edit2 size={14} /></button>)}
                                </div>
                                {!isEditingSettings ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4"><div className="bg-[#FFF8F5] p-3 rounded-2xl border border-[#EEE2D1]/50"><p className="text-[8px] font-black text-[#A65D2E] uppercase mb-1">Service Charge</p><p className="text-sm font-bold text-[#2B361B]">฿{settingsForm.serviceCharge.toLocaleString()}</p></div><div className="bg-[#FFF8F5] p-3 rounded-2xl border border-[#EEE2D1]/50"><p className="text-[8px] font-black text-[#A65D2E] uppercase mb-1">VAT</p><p className="text-sm font-bold text-[#2B361B]">฿{settingsForm.vat.toLocaleString()}</p></div></div>
                                        <div className="bg-[#F7FCF0] p-4 rounded-2xl border border-[#182806]/10 flex items-center gap-3"><div className="p-2 bg-white rounded-xl shadow-sm"><Landmark size={16} className="text-[#182806]" /></div><div><p className="text-[8px] font-black text-[#182806]/60 uppercase">พร้อมเพย์รับเงิน</p><p className="text-sm font-black text-[#182806]">{settingsForm.promptPayNumber || 'ยังไม่ได้ระบุ'}</p></div></div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-[9px] font-black text-[#A65D2E] uppercase block mb-1 ml-1">Service Charge (฿)</label><input type="number" value={settingsForm.serviceCharge} onChange={(e) => setSettingsForm({ ...settingsForm, serviceCharge: e.target.value })} className="w-full bg-[#FFF8F5] border border-[#EEE2D1] rounded-xl py-2 px-3 text-sm font-bold outline-none" /></div>
                                            <div><label className="text-[9px] font-black text-[#A65D2E] uppercase block mb-1 ml-1">VAT (฿)</label><input type="number" value={settingsForm.vat} onChange={(e) => setSettingsForm({ ...settingsForm, vat: e.target.value })} className="w-full bg-[#FFF8F5] border border-[#EEE2D1] rounded-xl py-2 px-3 text-sm font-bold outline-none" /></div>
                                        </div>
                                        <div><label className="text-[9px] font-black text-[#182806] uppercase block mb-2 ml-1">เบอร์พร้อมเพย์รับเงิน</label><input type="text" value={settingsForm.promptPayNumber} onChange={(e) => setSettingsForm({ ...settingsForm, promptPayNumber: e.target.value })} className="w-full bg-[#F7FCF0] border border-[#182806]/10 rounded-xl py-3 px-4 text-sm font-bold outline-none" /></div>
                                        <div className="flex gap-3 pt-2"><button onClick={() => { setIsEditingSettings(false); loadData(); }} className="flex-1 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-bold active:scale-95 transition-all">ยกเลิก</button><button onClick={handleUpdateSettings} disabled={actionLoading} className="flex-[2] py-2.5 bg-[#182806] text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">{actionLoading ? 'กำลังบันทึก...' : <><Check size={14} strokeWidth={3} /> บันทึก</>}</button></div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment Tracking Dashboard */}
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-[10px] font-bold text-[#8B837E] uppercase tracking-[0.2em]">สรุปการโอนเงินรายคน</h3>
                            {mySummary.paymentStatus === 'PENDING' && mySummary.summary.netTotal > 0 && (
                                <button
                                    onClick={() => setIsNotifyPaymentModalOpen(true)}
                                    className="text-primary text-[10px] font-black uppercase flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full active:scale-95 transition-all shadow-sm"
                                >
                                    <MessageSquare size={12} strokeWidth={3} /> แจ้งสลิป
                                </button>
                            )}
                        </div>

                        <div className="space-y-3 pb-4">
                            {billSummary?.members?.map((m) => {
                                const isMe = m.user.id === user?.id;
                                const status = m.paymentStatus;
                                const amount = m.summary.netTotal;
                                return (
                                    <div key={m.memberId} className="bg-white border border-[#EEE2D1] p-4 rounded-[2rem] flex items-center gap-4 shadow-sm relative overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status === 'VERIFIED' ? 'bg-green-500' : status === 'PAID' ? 'bg-blue-500' : 'bg-gray-200'}`} />
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0"><img src={m.user.avatarUrl || `https://i.pravatar.cc/150?u=${m.user.id}`} className="w-full h-full object-cover" alt={m.user.name} /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2"><h4 className="font-bold text-sm text-[#2B361B] truncate">{isMe ? 'คุณ (ยอดของคุณ)' : m.user.name}</h4>{status === 'VERIFIED' && <ShieldCheck size={14} className="text-green-600" />}</div>
                                            <p className="text-[12px] font-black text-[#A65D2E]">฿{Math.ceil(amount).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {m.paymentSlipUrl && (<button onClick={() => setSlipPreviewUrl(m.paymentSlipUrl)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"><Eye size={16} /></button>)}
                                            {status === 'PENDING' && (<span className="text-[9px] font-black uppercase text-gray-400 bg-gray-50 px-3 py-1 rounded-full flex items-center gap-1 border border-gray-100"><ClockIcon size={10} /> Pending</span>)}
                                            {status === 'PAID' && (
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className='flex gap-1'>
                                                        <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">รอตรวจ</span>
                                                        {isMe && (
                                                            <button
                                                                onClick={() => setIsCancelPaymentModalOpen(true)}
                                                                title="แก้ไขสลิป"
                                                                className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                                            >
                                                                <RefreshCcw size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {isLeader && (<button onClick={() => handleVerifyPayment(m.user.id)} disabled={actionLoading} className="text-[8px] font-black uppercase text-white bg-green-600 px-2 py-1 rounded-lg shadow-sm active:scale-95 transition-all">Verify</button>)}
                                                </div>
                                            )}
                                            {status === 'VERIFIED' && (<span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">Paid</span>)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {isLeader && !isCompleted && (<button onClick={() => setIsCompleteModalOpen(true)} className="w-full mt-12 mb-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"><Check size={18} strokeWidth={3} /> ปิดจ็อบปาร์ตี้และสรุปยอดบิล</button>)}
            </main>

            {/* 🌟 Footer: My Total */}
            <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border-t border-[#EEE2D1] p-6 pb-10">
                <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] font-bold text-[#8B837E] uppercase tracking-wider flex items-center gap-1.5"><UserIcon size={14} className="text-primary" /> ยอดโอนรวมของคุณ</span>
                        <div className="text-2xl font-black text-primary tracking-tight">
                            <motion.span key={mySummary.summary.netTotal} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                ฿{Math.ceil(mySummary.summary.netTotal || 0).toLocaleString()}
                            </motion.span>
                        </div>
                    </div>
                    <div className="text-[9px] text-[#A8A29F] font-medium text-right mt-1 flex flex-col">
                        <span>(ค่าอาหาร ฿{Math.ceil(mySummary.summary.subtotal).toLocaleString()} + บริการ ฿{Math.ceil(mySummary.summary.serviceCharge).toLocaleString()} + ภาษี ฿{Math.ceil(mySummary.summary.vat).toLocaleString()})</span>
                    </div>
                </div>
            </div>

            {/* 🚀 To the Top Button */}
            <AnimatePresence>{showBackToTop && (<motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} onClick={scrollToTop} className="fixed bottom-40 right-6 w-12 h-12 bg-white border border-[#EEE2D1] text-[#182806] rounded-full shadow-xl z-50 flex items-center justify-center active:scale-90 transition-transform"><ArrowUp size={20} /></motion.button>)}</AnimatePresence>

            <GroupChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} party={party} user={user} />
            <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} leader={party?.leader} amount={mySummary.summary.netTotal} />

            <AnimatePresence>{isAddCustomModalOpen && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FFF8F5] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-[#EEE2D1]"><h3 className="text-xl font-bold text-[#2B361B] mb-6">เพิ่มเมนูพิเศษ 🍳</h3><div className="space-y-4 mb-8"><div><label className="text-[10px] font-bold text-[#8B837E] uppercase block mb-2 ml-1">ชื่อเมนู</label><input type="text" value={customItemForm.name} onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })} className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all" /></div><div><label className="text-[10px] font-bold text-[#8B837E] uppercase block mb-2 ml-1">ราคา (฿)</label><input type="number" value={customItemForm.price} onChange={(e) => setCustomItemForm({ ...customItemForm, price: e.target.value })} className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all" /></div></div><div className="flex gap-3"><button onClick={() => setIsAddCustomModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-[#8B837E] rounded-xl transition-colors">ยกเลิก</button><button onClick={handleAddCustomItem} disabled={actionLoading} className="flex-1 bg-[#A65D2E] text-white py-3 rounded-xl text-sm font-bold shadow-md">เพิ่มลงบิล</button></div></motion.div></div>)}</AnimatePresence>

            <AnimatePresence>
                {isNotifyPaymentModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-end sm:items-center justify-center p-4">
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-base-100 w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative">
                            <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black text-[#2B361B]">แจ้งชำระเงิน 💰</h3><button onClick={() => setIsNotifyPaymentModalOpen(false)} className="p-2 bg-base-200 rounded-full text-base-content/40 transition-colors"><X size={20} /></button></div>
                            <div className="space-y-6">
                                <div className="text-center"><p className="text-[10px] font-bold text-[#8B837E] uppercase mb-1">ยอดที่ต้องโอน</p><div className="text-4xl font-black text-primary">฿{Math.ceil(mySummary.summary.netTotal).toLocaleString()}</div></div>
                                <div onClick={() => fileInputRef.current?.click()} className={`relative h-48 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${previewUrl ? 'border-primary' : 'border-gray-200 bg-gray-50'}`}>{previewUrl ? (<img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />) : (<><Camera size={32} className="text-gray-300 mb-2" /><p className="text-[10px] font-bold text-gray-400 uppercase">แนบสลิปการโอนเงิน</p></>)}<input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} /></div>
                                <button onClick={handleNotifyPayment} disabled={actionLoading} className="w-full py-4 bg-primary text-primary-content rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">{actionLoading ? <span className="loading loading-spinner loading-xs"></span> : <><Check size={18} strokeWidth={3} /> แจ้งจ่ายเงินตอนนี้</>}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {slipPreviewUrl && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[350] flex flex-col items-center justify-center p-6" onClick={() => setSlipPreviewUrl(null)}>
                        <button className="absolute top-8 right-8 p-3 text-white transition-colors backdrop-blur-sm bg-white/10 rounded-full"><X size={24} /></button>
                        <div className="relative max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}><div className="p-4 bg-gray-50 border-b flex items-center justify-between"><span className="text-xs font-black text-gray-500 uppercase tracking-widest">หลักฐานการโอนเงิน</span><button onClick={() => window.open(slipPreviewUrl, '_blank')} className="text-blue-600 text-[10px] font-bold flex items-center gap-1"><ExternalLink size={12} /> เปิดรูปเต็ม</button></div><img src={slipPreviewUrl} className="w-full object-contain max-h-[70vh] bg-base-200" alt="Slip" /></div>
                    </div>
                )}
            </AnimatePresence>

            {/* 🌟 Modal: Cancel Payment Confirmation */}
            <AnimatePresence>
                {isCancelPaymentModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[280] flex items-center justify-center px-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border border-[#EEE2D1]">
                            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <RefreshCcw size={40} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-[#2B361B] mb-3">ยกเลิกการแจ้งโอน?</h3>
                            <p className="text-sm text-[#8B837E] mb-8 leading-relaxed">
                                สลิปเดิมจะถูกลบออก และระบบจะปลดล็อกรายการอาหารเพื่อให้คุณแก้ไขหรือแจ้งโอนใหม่อีกครั้งครับ
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleCancelPayment}
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-[#182806] text-white rounded-2xl font-black text-sm shadow-lg active:scale-[0.98] transition-all"
                                >
                                    ยืนยันยกเลิกและแก้ไข
                                </button>
                                <button
                                    onClick={() => setIsCancelPaymentModalOpen(false)}
                                    className="w-full py-3 text-sm font-bold text-[#8B837E] hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    กลับไปหน้าเดิม
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>{isCompleteModalOpen && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center px-6"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl"><div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} strokeWidth={3} /></div><h3 className="text-xl font-black text-[#2B361B] mb-3">ยืนยันการสรุปยอดบิล?</h3><p className="text-sm text-[#8B837E] mb-8 leading-relaxed">เมื่อยืนยันแล้ว สมาชิกจะไม่สามารถแก้ไขรายการหรือร่วมหารเพิ่มได้อีก คุณแน่ใจใช่หรือไม่?</p><div className="flex gap-3"><button onClick={() => setIsCompleteModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-[#8B837E] rounded-xl font-bold text-sm transition-all active:scale-95">ยังก่อน</button><button onClick={handleCompleteParty} disabled={actionLoading} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95">ใช่, ปิดจ็อบเลย</button></div></motion.div></div>)}</AnimatePresence>

            <CreateReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} restaurantId={party?.restaurant?.id} partyId={id} onReviewSuccess={() => { setHasHasReviewed(true); loadData(); }} />
        </div>
    );
};

export default SplitBillSummary;

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Receipt, Check, Utensils, AlertCircle, X, Users, Plus, Crown, User as UserIcon } from 'lucide-react';
import { apiGetPartyById, apiGetSplitBill, apiAddOrderItem, apiRemoveOrderItem, apiAddCustomItem, apiKickMember } from '../api/party';
import { apiGetMenuByRestaurantId } from '../api/menuApi';
import useUserStore from '../stores/userStore';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const SplitBillMenu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);

    const [party, setParty] = useState(null);
    const [billSummary, setBillSummary] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // 🌟 State สำหรับ Bottom Sheet และ Modal
    const [selectedMenuForSheet, setSelectedMenuForSheet] = useState(null);
    const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
    const [customItemForm, setCustomItemForm] = useState({ name: '', price: '' });

    const isLeader = party?.leaderId === user?.id;

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [partyRes, billRes] = await Promise.all([
                apiGetPartyById(id),
                apiGetSplitBill(id)
            ]);
            const partyData = partyRes.data.data;
            setParty(partyData);
            setBillSummary(billRes.data.data);

            if (partyData.restaurant?.id) {
                try {
                    const menuRes = await apiGetMenuByRestaurantId(partyData.restaurant.id);
                    setMenuItems(menuRes.data.data || []);
                } catch (err) {
                    console.error("Error fetching menu:", err);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถดึงข้อมูลบิลได้");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleConfirmToggle = async () => {
        if (!selectedMenuForSheet || actionLoading) return;

        const isCustom = !!selectedMenuForSheet.partyId;
        const itemId = selectedMenuForSheet.id;

        // เช็คว่าเลือกไปแล้วหรือยัง
        const isSelected = isCustom
            ? mySummary.items.some(i => i.itemId === itemId && i.type === 'CUSTOM')
            : mySummary.items.some(i => i.itemId === itemId && i.type === 'OFFICIAL');

        setActionLoading(true);
        try {
            if (isSelected) {
                await apiRemoveOrderItem(id, itemId);
                toast.info("ยกเลิกรายการนี้แล้ว", { autoClose: 1000 });
            } else {
                const body = isCustom ? { customItemId: itemId } : { menuId: itemId };
                await apiAddOrderItem(id, body);
                toast.success("เลือกรายการนี้แล้ว", { autoClose: 1000 });
            }
            setSelectedMenuForSheet(null);
            await loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
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
            await apiAddCustomItem(id, {
                name: customItemForm.name,
                price: parseFloat(customItemForm.price)
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

    const handleKickMember = async (userId, userName) => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการเตะ ${userName} ออกจากปาร์ตี้?`)) return;

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
        const isALeader = a.user.id === party.leaderId;
        const isBLeader = b.user.id === party.leaderId;

        const getWeight = (isMe, isLeader) => {
            if (isMe) return 2;
            if (isLeader) return 1;
            return 0;
        };

        return getWeight(isBMe, isBLeader) - getWeight(isAMe, isALeader);
    });

    const getMenuSharers = (itemId, type) => {
        const sharers = [];
        billSummary?.members?.forEach(m => {
            if (m.items.some(i => i.itemId === itemId && i.type === type)) {
                sharers.push(m.user);
            }
        });
        return sharers;
    };

    const MenuItemCard = ({ item, isCustom = false }) => {
        const type = isCustom ? 'CUSTOM' : 'OFFICIAL';
        const isSelected = mySummary.items.some(i => i.itemId === item.id && i.type === type);
        const currentSharers = getMenuSharers(item.id, type);

        return (
            <div
                onClick={() => setSelectedMenuForSheet(item)}
                className={`p-4 rounded-[1.5rem] flex items-center gap-4 border transition-all cursor-pointer active:scale-[0.98] ${isSelected
                    ? 'bg-white border-[#A65D2E] shadow-md ring-1 ring-[#A65D2E]/20'
                    : 'bg-white border-[#EEE2D1] opacity-80 hover:opacity-100'
                    }`}
            >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#A65D2E] border-[#A65D2E]' : 'border-[#D9C5B2]'
                    }`}>
                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>

                {item.imageUrl && !isCustom && (
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                )}

                {isCustom && (
                    <div className="w-16 h-16 rounded-xl bg-[#F7EAD7] flex items-center justify-center shrink-0">
                        <Utensils size={24} className="text-[#A65D2E]" />
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[15px] text-[#2B361B] truncate leading-tight">{item.name}</h4>
                    <div className="flex items-end justify-between mt-2">
                        <p className="text-[13px] font-black text-[#A65D2E]">฿{item.price.toLocaleString()}</p>
                        <div className='flex flex-col items-end space-y-2'>
                            {currentSharers.length > 0 && (
                                <div className="flex items-center gap-1 bg-[#F7EAD7] px-2 py-0.5 rounded-md">
                                    <Users size={10} className="text-[#A65D2E]" />
                                    <span className="text-[9px] font-bold flex uppercase tracking-wider text-[#A65D2E]">
                                        หาร {currentSharers.length} คน
                                    </span>
                                </div>
                            )}
                            <div className='flex -space-x-2'>
                                {currentSharers.slice(0, 3).map((u, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative z-10 shadow-sm">
                                        <img src={u.avatarUrl || `https://i.pravatar.cc/150?u=${u.id}`} alt="Member" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {currentSharers.length > 3 && (
                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-[#F7EAD7] flex items-center justify-center text-[8px] font-bold text-[#A65D2E] z-20 shadow-sm">
                                        +{currentSharers.length - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-full h-screen bg-[#FFF8F5] text-[#2B361B] font-sans overflow-hidden">
            {/* 🌟 Glass Header with Gradient Fade */}
            <header className="absolute top-0 left-0 right-0 z-40 bg-[#FFF8F5]/70 backdrop-blur-xl px-6 py-4 flex items-center gap-4 shadow-sm" style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}>
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-[#F7EAD7] transition-colors pointer-events-auto">
                    <ArrowLeft size={24} className="text-[#2B361B]" />
                </button>
                <div className="flex-1 overflow-hidden">
                    <h1 className="text-xl font-extrabold text-[#2B361B] tracking-tight leading-none truncate">รายการอาหาร</h1>
                    <p className="text-[11px] font-bold text-[#A65D2E] uppercase tracking-wider mt-1 truncate">{party.name}</p>
                </div>
            </header>

            {/* 🌟 Scrollable Main Content */}
            <main className="h-full overflow-y-auto no-scrollbar pt-24 pb-72 px-6">

                {/* 🌟 Party Members Section */}
                <h3 className="text-[10px] font-bold text-[#8B837E] uppercase tracking-[0.2em] mb-4">สมาชิกในปาร์ตี้ ({party.members?.length || 0} คน)</h3>
                <div className="mb-8 "
                    style={{
                        maskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)'
                    }}
                >

                    <div className="pl-5 flex gap-4 overflow-x-auto no-scrollbar pt-2 ">
                        {sortedMembers?.map((member) => {
                            const isMemberLeader = party.leaderId === member.user.id;
                            const isMemberMe = member.user.id === user?.id;
                            const canKick = isLeader && !isMemberLeader;

                            return (
                                <div key={member.id} className="flex-none flex flex-col items-center gap-2 relative">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-200">
                                            <img
                                                src={member.user.avatarUrl || `https://i.pravatar.cc/150?u=${member.user.id}`}
                                                alt={member.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {isMemberMe && (
                                            <div className="absolute -top-1 -right-0 bg-[#182806] p-1 rounded-full shadow-sm border border-white">
                                                <UserIcon size={10} className="text-white fill-current" />
                                            </div>
                                        )}

                                        {isMemberLeader && (
                                            <div className="absolute -top-1 -right-0 bg-yellow-400 p-1 rounded-full shadow-sm border border-white">
                                                <Crown size={10} className="text-white fill-current" />
                                            </div>
                                        )}
                                        {canKick && (
                                            <button
                                                onClick={() => handleKickMember(member.user.id, member.user.name)}
                                                className="absolute -top-1 -left-1 bg-red-500 text-white p-1 rounded-full shadow-md border border-white hover:bg-red-600 transition-colors"
                                            >
                                                <X size={10} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-bold truncate w-16 text-center ${member.user.id === user?.id ? 'text-[#A65D2E]' : 'text-[#2B361B]'}`}>
                                        {member.user.id === user?.id ? 'คุณ' : member.user.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-[#EAD9CF]/40 rounded-[2rem] p-5 mb-8 border border-[#EAD9CF] flex gap-4 items-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <Utensils size={20} className="text-[#A65D2E]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[14px] leading-tight">ร่วมหารเมนูที่คุณทาน</h3>
                        <p className="text-[11px] text-[#8B837E] mt-1 leading-relaxed">กดเพื่อดูรายละเอียด และเริ่มหารบิลกับเพื่อนๆ</p>
                    </div>
                </div>

                {/* 1. Official Menu Section */}
                <div className="space-y-4 mb-10">
                    <h3 className="text-[10px] font-bold text-[#8B837E] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="h-px flex-1 bg-[#EAD9CF]" />
                        เมนูจากร้านอาหาร
                        <div className="h-px flex-1 bg-[#EAD9CF]" />
                    </h3>
                    {menuItems.map(menu => <MenuItemCard key={menu.id} item={menu} isCustom={false} />)}
                    {menuItems.length === 0 && (
                        <div className="text-center py-6 opacity-40">
                            <p className="text-xs font-bold italic">ไม่พบเมนูจากร้านอาหาร</p>
                        </div>
                    )}
                </div>

                {/* 2. Custom Items Section */}
                <div className="space-y-4 mb-10">
                    <h3 className="text-[10px] font-bold text-[#8B837E] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <div className="h-px flex-1 bg-[#EAD9CF]" />
                        เมนูพิเศษประจำตี้
                        <div className="h-px flex-1 bg-[#EAD9CF]" />
                    </h3>
                    {party.customItems?.map(item => <MenuItemCard key={item.id} item={item} isCustom={true} />)}

                    <button
                        onClick={() => setIsAddCustomModalOpen(true)}
                        className="w-full py-4 rounded-[1.5rem] border-2 border-dashed border-[#EAD9CF] text-[#A65D2E] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#F7EAD7]/30 transition-colors"
                    >
                        <Plus size={18} />
                        เพิ่มเมนูอื่นที่ไม่มีในรายการ
                    </button>
                </div>
            </main>

            {/* 🌟 Glass Bill Summary Sticky Bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-[#EEE2D1] p-6 pb-10" style={{ maskImage: 'linear-gradient(to top, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 90%, transparent 100%)' }}>
                <div className="max-w-md mx-auto pointer-events-auto">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <Receipt size={18} className="text-[#A8A29F]" />
                            <span className="text-[12px] font-bold text-[#8B837E] uppercase tracking-wider">สรุปยอดของคุณ</span>
                        </div>
                        <span className="text-[10px] font-bold bg-[#F7EAD7] text-[#A65D2E] px-2 py-1 rounded-md uppercase">
                            SC {party.serviceCharge}% • VAT {party.vat}%
                        </span>
                    </div>

                    <div className="flex justify-between items-end mb-6">
                        <div className="text-4xl font-black text-[#2B361B] tracking-tight">
                            ฿{Math.ceil(mySummary.summary.netTotal || 0).toLocaleString()}
                        </div>
                        {mySummary.items.length > 0 && (
                            <div className="text-right">
                                <p className="text-[11px] text-[#A8A29F] font-bold">ค่าอาหาร: ฿{mySummary.summary.subtotal.toFixed(2)}</p>
                                <p className="text-[11px] text-[#A8A29F] font-medium">+ SC & VAT: ฿{(mySummary.summary.serviceCharge + mySummary.summary.vat).toFixed(2)}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate(`/party/${id}/split-bill/summary`)}
                        className="w-full bg-[#182806] hover:bg-[#2D3E1A] text-white py-4 rounded-2xl font-bold shadow-lg shadow-black/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2 cursor-pointer"
                    >
                        ดูสรุปบิลทั้งโต๊ะ
                    </button>
                </div>
            </div>

            {/* 🌟 Add Custom Item Modal (Glassmorphism) */}
            <AnimatePresence>
                {isAddCustomModalOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddCustomModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="fixed inset-0 flex items-center justify-center z-[101] px-6">
                            <div className="bg-[#FFF8F5] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-[#EEE2D1]">
                                <h3 className="text-xl font-bold text-[#2B361B] mb-6">เพิ่มเมนูพิเศษ 🍳</h3>
                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="text-[10px] font-bold text-[#8B837E] uppercase tracking-widest block mb-2 ml-1">ชื่อเมนู</label>
                                        <input
                                            type="text"
                                            value={customItemForm.name}
                                            onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })}
                                            placeholder="เช่น เบียร์ขวด, ติ่มซำแถม"
                                            className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-[#8B837E] uppercase tracking-widest block mb-2 ml-1">ราคา (฿)</label>
                                        <input
                                            type="number"
                                            value={customItemForm.price}
                                            onChange={(e) => setCustomItemForm({ ...customItemForm, price: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsAddCustomModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-[#8B837E]">ยกเลิก</button>
                                    <button onClick={handleAddCustomItem} disabled={actionLoading} className="flex-1 bg-[#A65D2E] text-white py-3 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all">
                                        {actionLoading ? '...' : 'เพิ่มเมนู'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* 🌟 Bottom Sheet สำหรับกดเลือกเมนู (Glassmorphism) */}
            <AnimatePresence>
                {selectedMenuForSheet && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMenuForSheet(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-[#FFF8F5] rounded-t-[2.5rem] z-50 p-6 shadow-2xl border-t border-[#EEE2D1]"
                        >
                            <div className="max-w-md mx-auto relative">
                                <button
                                    onClick={() => setSelectedMenuForSheet(null)}
                                    className="absolute -top-2 -right-2 p-2 bg-[#EAD9CF]/50 rounded-full text-[#8B837E] hover:bg-[#EAD9CF] transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                {selectedMenuForSheet.imageUrl && (
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-sm border border-[#EAD9CF]">
                                        <img src={selectedMenuForSheet.imageUrl} alt={selectedMenuForSheet.name} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-center text-[#2B361B] mb-1">{selectedMenuForSheet.name}</h3>
                                <p className="text-center text-[#A65D2E] font-black text-lg mb-6">ราคาเต็ม: ฿{selectedMenuForSheet.price.toLocaleString()}</p>

                                {/* ข้อมูลผู้ที่แชร์อยู่ */}
                                {(() => {
                                    const isCustom = !!selectedMenuForSheet.partyId;
                                    const type = isCustom ? 'CUSTOM' : 'OFFICIAL';
                                    const sharers = getMenuSharers(selectedMenuForSheet.id, type);
                                    const isCurrentlySelected = isCustom
                                        ? mySummary.items.some(i => i.itemId === selectedMenuForSheet.id && i.type === 'CUSTOM')
                                        : mySummary.items.some(i => i.itemId === selectedMenuForSheet.id && i.type === 'OFFICIAL');

                                    const futureSharerCount = isCurrentlySelected ? Math.max(sharers.length - 1, 1) : sharers.length + 1;
                                    const estimatedCost = selectedMenuForSheet.price / futureSharerCount;

                                    return (
                                        <div className="bg-white rounded-[1.5rem] p-4 mb-6 border border-[#EAD9CF]/50 shadow-sm">
                                            <h4 className="text-[11px] font-bold text-[#8B837E] uppercase tracking-wider mb-3">
                                                สมาชิกที่หารเมนูนี้อยู่ ({sharers.length} คน)
                                            </h4>

                                            {sharers.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {sharers.map(s => (
                                                        <div key={s.id} className="flex items-center gap-1.5 bg-[#FFF8F5] px-2 py-1 rounded-lg border border-[#EEE2D1]">
                                                            <img src={s.avatarUrl || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} className="w-5 h-5 rounded-full object-cover" />
                                                            <span className="text-[10px] font-bold text-[#2B361B]">{s.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[12px] text-[#A8A29F] mb-4 italic">ยังไม่มีใครเลือกเมนูนี้ (คุณจะเป็นคนแรก)</p>
                                            )}

                                            <div className="flex justify-between items-center pt-3 border-t border-[#EAD9CF]/50">
                                                <span className="text-[12px] font-bold text-[#2B361B]">ยอดแชร์ (โดยประมาณ)</span>
                                                <span className="text-[15px] font-black text-[#A65D2E]">฿{Math.ceil(estimatedCost).toLocaleString()} <span className="text-[10px] font-medium text-[#8B837E]">/ คน</span></span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <button
                                    onClick={handleConfirmToggle}
                                    disabled={actionLoading}
                                    className={`w-full py-4 rounded-2xl font-bold shadow-sm transition-all flex justify-center items-center gap-2 cursor-pointer ${(() => {
                                        const isCustom = !!selectedMenuForSheet.partyId;
                                        const type = isCustom ? 'CUSTOM' : 'OFFICIAL';
                                        return mySummary.items.some(i => i.itemId === selectedMenuForSheet.id && i.type === type);
                                    })()
                                        ? 'bg-[#EAD9CF] text-[#2B361B] hover:bg-[#D9C5B2]'
                                        : 'bg-[#2B361B] text-white hover:bg-[#1A2210]'
                                        }`}
                                >
                                    {actionLoading ? 'กำลังประมวลผล...' : (
                                        (() => {
                                            const isCustom = !!selectedMenuForSheet.partyId;
                                            const type = isCustom ? 'CUSTOM' : 'OFFICIAL';
                                            return mySummary.items.some(i => i.itemId === selectedMenuForSheet.id && i.type === type);
                                        })() ? 'ยกเลิกการหารเมนูนี้' : 'ยืนยันเข้าร่วมหาร'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SplitBillMenu;

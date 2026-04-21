import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Plus, Minus, Trash2, Check, Users, Utensils, Receipt, UserIcon } from 'lucide-react';
import { apiGetPartyById, apiGetSplitBill, apiUpdateOrderItemQuantity, apiToggleOrderItemSharer, apiRemoveOrderItem, apiAddOrderItem } from '../api/party';
import useUserStore from '../stores/userStore';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const SplitBillSummary = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);

    const [party, setParty] = useState(null);
    const [billSummary, setBillSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal state for Delete Confirmation
    const [itemToDelete, setItemToDelete] = useState(null);

    // Modal state for Custom Item
    const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
    const [customItemForm, setCustomItemForm] = useState({ name: '', price: '' });

    const loadData = useCallback(async () => {
        try {
            const [partyRes, billRes] = await Promise.all([
                apiGetPartyById(id),
                apiGetSplitBill(id)
            ]);
            setParty(partyRes.data.data);
            setBillSummary(billRes.data.data);
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

    const handleQuantityChange = async (itemId, action) => {
        if (actionLoading) return;

        // If decrementing to 0, show modal instead
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
            toast.error("เกิดข้อผิดพลาด");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete || actionLoading) return;
        setActionLoading(true);
        try {
            await apiRemoveOrderItem(id, itemToDelete.id);
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
        if (actionLoading) return;
        setActionLoading(true);
        const action = isOptIn ? 'leave' : 'join'; // If currently opted in, action is leave.
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
            {/* Header */}
            <header className="bg-[#FFF8F5]/90 backdrop-blur-xl px-6 pt-12 pb-4 flex items-center gap-4 shadow-sm z-40 shrink-0">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-[#F7EAD7] transition-colors">
                    <ArrowLeft size={24} className="text-[#2B361B]" />
                </button>
                <div className="flex-1 overflow-hidden">
                    <h1 className="text-xl font-extrabold text-[#2B361B] tracking-tight leading-none">สรุปบิลรวม (Table Bill)</h1>
                    <p className="text-[11px] font-bold text-[#A65D2E] uppercase tracking-wider mt-1 truncate">{party?.name}</p>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-6 pb-48">

                <div className="bg-[#182806] rounded-[2rem] p-6 mb-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#F7EAD7] opacity-80 mb-1 block">ยอดรวมทั้งโต๊ะ (Grand Total)</span>
                        <div className="text-4xl font-black mb-1">
                            ฿{Math.ceil(billSummary?.grandTotal || 0).toLocaleString()}
                        </div>
                        <div className="flex gap-4 mt-4">
                            <div className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <Users size={12} className="text-[#F7EAD7]" />
                                <span className="text-xs font-medium">{billSummary?.members?.length} คน</span>
                            </div>
                            <div className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                <Utensils size={12} className="text-[#F7EAD7]" />
                                <span className="text-xs font-medium">{billSummary?.tableItems?.reduce((acc, curr) => acc + curr.quantity, 0)} จาน</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[12px] font-bold text-[#8B837E] uppercase tracking-[0.2em]">รายการอาหารในโต๊ะ</h3>
                    <button onClick={() => setIsAddCustomModalOpen(true)} className="text-[#A65D2E] text-xs font-bold flex items-center gap-1 hover:underline">
                        <Plus size={14} /> เพิ่มเมนูพิเศษ
                    </button>
                </div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {billSummary?.tableItems?.map((item) => {
                            const isOptIn = item.sharers.some(s => s.id === user?.id);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-4 rounded-[1.5rem] bg-white border shadow-sm transition-all ${isOptIn ? 'border-[#A65D2E] ring-1 ring-[#A65D2E]/10' : 'border-[#EEE2D1] opacity-70'}`}
                                >
                                    <div className="flex gap-3 mb-3">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#EEE2D1]" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-[#F7EAD7] flex items-center justify-center shrink-0 border border-[#EEE2D1]">
                                                <Utensils size={16} className="text-[#A65D2E]" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-[14px] text-[#2B361B] truncate">{item.name} {item.isCustom && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium ml-1">พิเศษ</span>}</h4>
                                            <div className="text-[12px] font-black text-[#A65D2E]">฿{item.price.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">/ จาน</span></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-[#EEE2D1]/50 pt-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleSharer(item.id, isOptIn)}
                                                className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors ${isOptIn ? 'bg-[#A65D2E] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                {isOptIn ? <><Check size={12} strokeWidth={3} /> คุณร่วมหาร</> : 'ฉันไม่ได้กิน'}
                                            </button>

                                            {item.sharers.length > 0 && (
                                                <div className="flex -space-x-1">
                                                    {item.sharers.slice(0, 3).map(s => (
                                                        <img key={s.id} src={s.avatarUrl || `https://i.pravatar.cc/150?u=${s.id}`} alt={s.name} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 object-cover shadow-sm" title={s.name} />
                                                    ))}
                                                    {item.sharers.length > 3 && <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600 shadow-sm">+{item.sharers.length - 3}</div>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 bg-[#FFF8F5] p-1 rounded-xl border border-[#EEE2D1]">
                                            <button onClick={() => handleQuantityChange(item.id, 'decrement')} disabled={actionLoading} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm text-red-500 hover:bg-red-50 active:scale-95 transition-colors">
                                                {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                                            </button>
                                            <span className="font-bold text-[14px] w-4 text-center text-[#2B361B]">{item.quantity}</span>
                                            <button onClick={() => handleQuantityChange(item.id, 'increment')} disabled={actionLoading} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#2B361B] shadow-sm text-white hover:bg-[#1A2210] active:scale-95 transition-colors">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cost Summary Box for this item */}
                                    {isOptIn && item.costPerPerson > 0 && (
                                        <div className="mt-3 bg-[#FFF8F5] rounded-xl p-2.5 flex justify-between items-center border border-[#EEE2D1]">
                                            <span className="text-[10px] font-bold text-[#8B837E]">คุณหารอยู่ที่:</span>
                                            <span className="text-[13px] font-black text-[#A65D2E]">฿{Math.ceil(item.costPerPerson).toLocaleString()}</span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    {billSummary?.tableItems?.length === 0 && (
                        <div className="text-center py-10 opacity-40">
                            <p className="text-sm font-bold italic">ยังไม่มีรายการอาหารในโต๊ะ</p>
                            <p className="text-xs mt-1">กลับไปเลือกเมนูเพื่อเพิ่มเข้าบิลโต๊ะเลย</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Bottom Your Summary */}
            <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border-t border-[#EEE2D1] p-6 pb-10" style={{ maskImage: 'linear-gradient(to top, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 90%, transparent 100%)' }}>
                <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] font-bold text-[#8B837E] uppercase tracking-wider flex items-center gap-1"><UserIcon size={14} /> ยอดที่คุณต้องจ่าย</span>
                        <div className="text-2xl font-black text-[#A65D2E] tracking-tight">
                            <motion.span
                                key={mySummary.summary.netTotal}
                                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                ฿{Math.ceil(mySummary.summary.netTotal || 0).toLocaleString()}
                            </motion.span>
                        </div>
                    </div>
                    {mySummary.items.length > 0 && (
                        <p className="text-[10px] text-[#A8A29F] font-medium text-right mb-4">รวม VAT {party?.vat}% & SC {party?.serviceCharge}% แล้ว</p>
                    )}
                </div>
            </div>

            {/* Modal: Delete Confirmation */}
            <AnimatePresence>
                {itemToDelete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-white w-full max-w-xs rounded-[2rem] p-6 text-center shadow-2xl">
                            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-[#2B361B] mb-2">ลบรายการอาหาร?</h3>
                            <p className="text-sm text-[#8B837E] mb-6">คุณแน่ใจหรือไม่ว่าต้องการลบ "{itemToDelete.name}" ออกจากบิลโต๊ะ</p>
                            <div className="flex gap-3">
                                <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-gray-100 text-[#8B837E] hover:bg-gray-200 transition-colors rounded-xl font-bold text-sm">ยกเลิก</button>
                                <button onClick={handleDeleteItem} className="flex-1 py-3 bg-red-500 hover:bg-red-600 transition-colors text-white rounded-xl font-bold text-sm shadow-md">ลบรายการ</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal: Add Custom Item */}
            <AnimatePresence>
                {isAddCustomModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center px-6">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-[#FFF8F5] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-[#EEE2D1]">
                            <h3 className="text-xl font-bold text-[#2B361B] mb-6">เพิ่มเมนูพิเศษ 🍳</h3>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-[10px] font-bold text-[#8B837E] uppercase tracking-widest block mb-2 ml-1">ชื่อเมนู</label>
                                    <input type="text" value={customItemForm.name} onChange={(e) => setCustomItemForm({ ...customItemForm, name: e.target.value })} placeholder="เช่น เครื่องดื่ม, ค่าเปิดขวด" className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all text-sm" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-[#8B837E] uppercase tracking-widest block mb-2 ml-1">ราคา (฿)</label>
                                    <input type="number" value={customItemForm.price} onChange={(e) => setCustomItemForm({ ...customItemForm, price: e.target.value })} placeholder="0.00" className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsAddCustomModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-[#8B837E] hover:bg-[#EAD9CF] rounded-xl transition-colors">ยกเลิก</button>
                                <button onClick={handleAddCustomItem} disabled={actionLoading} className="flex-1 bg-[#A65D2E] hover:bg-[#8B4D24] transition-colors text-white py-3 rounded-xl text-sm font-bold shadow-md">{actionLoading ? 'กำลังเพิ่ม...' : 'เพิ่มลงบิล'}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SplitBillSummary;

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Receipt, Check, Utensils, AlertCircle, X, Users } from 'lucide-react';
import { apiGetPartyById, apiGetSplitBill, apiAddOrderItem, apiRemoveOrderItem } from '../api/party';
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

    // 🌟 State สำหรับ Bottom Sheet
    const [selectedMenuForSheet, setSelectedMenuForSheet] = useState(null);

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

            // Fetch menu by restaurant ID
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

        const menuId = selectedMenuForSheet.id;
        const isSelected = selectedMenuIds.includes(menuId);

        setActionLoading(true);
        try {
            if (isSelected) {
                await apiRemoveOrderItem(id, menuId);
                toast.info("ยกเลิกการหารเมนูนี้แล้ว", { autoClose: 1000 });
            } else {
                await apiAddOrderItem(id, menuId);
                toast.success("เข้าร่วมวงหารเมนูนี้แล้ว", { autoClose: 1000 });
            }
            setSelectedMenuForSheet(null);
            await loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
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

    const selectedMenuIds = mySummary.items.map(item => item.menuId);

    // คำนวณว่าเมนูไหนมีใครแชร์บ้าง เพื่อเอาไปโชว์ใน Sheet
    const getMenuSharers = (menuId) => {
        const sharers = [];
        billSummary?.members?.forEach(m => {
            if (m.items.some(i => i.menuId === menuId)) {
                sharers.push(m.user);
            }
        });
        return sharers;
    };

    return (
        <div className="w-full min-h-screen bg-[#FFF8F5] text-[#2B361B] font-sans pb-40">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#FFF8F5]/90 backdrop-blur-md px-6 py-4 flex items-center gap-4 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-[#F7EAD7] transition-colors">
                    <ArrowLeft size={24} className="text-[#2B361B]" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-extrabold text-[#2B361B] tracking-tight leading-none">รายการอาหาร</h1>
                    <p className="text-[11px] font-bold text-[#A65D2E] uppercase tracking-wider mt-1">{party.name}</p>
                </div>
            </header>

            <main className="px-6 pt-6">
                <div className="bg-[#EAD9CF]/40 rounded-[2rem] p-5 mb-8 border border-[#EAD9CF] flex gap-4 items-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <Utensils size={20} className="text-[#A65D2E]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[14px] leading-tight">เลือกเมนูที่คุณต้องการหาร</h3>
                        <p className="text-[11px] text-[#8B837E] mt-1 leading-relaxed">กดที่เมนูเพื่อดูรายละเอียดการหาร และยืนยันการเลือก</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {menuItems.map(menu => {
                        const isSelected = selectedMenuIds.includes(menu.id);
                        const currentSharers = getMenuSharers(menu.id);
                        console.log(currentSharers)
                        return (
                            <div
                                key={menu.id}
                                onClick={() => setSelectedMenuForSheet(menu)}
                                className={`p-4 rounded-[1.5rem] flex items-center gap-4 border transition-all cursor-pointer active:scale-[0.98] ${isSelected
                                    ? 'bg-white border-[#A65D2E] shadow-md ring-1 ring-[#A65D2E]/20'
                                    : 'bg-white border-[#EEE2D1] opacity-80 hover:opacity-100'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-[#A65D2E] border-[#A65D2E]' : 'border-[#D9C5B2]'
                                    }`}>
                                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                </div>

                                {menu.imageUrl && (
                                    <img src={menu.imageUrl} alt={menu.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                )}

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[15px] text-[#2B361B] truncate leading-tight">{menu.name}</h4>
                                    <div className="flex items-end justify-between mt-2">
                                        <p className="text-[13px] font-black text-[#A65D2E]">฿{menu.price.toLocaleString()}</p>
                                        <div className='flex flex-col items-end space-y-2'>
                                            {currentSharers.length > 0 && (
                                                <div className="flex items-center gap-1 bg-[#F7EAD7] px-2 py-0.5 rounded-md">
                                                    <Users size={10} className="text-[#A65D2E]" />
                                                    <span className="text-[9px] font-bold flex uppercase tracking-wider text-[#A65D2E]">
                                                        หาร {currentSharers.length} คน
                                                    </span>

                                                </div>
                                            )}

                                            <div className='flex'>
                                                {currentSharers.map
                                                    ((user, i) => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative z-10 shadow-sm">
                                                        <img
                                                            src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`}
                                                            alt={user.name || "Member"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>)
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {menuItems.length === 0 && (
                    <div className="text-center py-10 opacity-50 flex flex-col items-center">
                        <AlertCircle size={40} className="mb-3 text-[#A65D2E]" />
                        <p className="font-bold text-[14px]">ร้านนี้ยังไม่มีเมนูในระบบ</p>
                    </div>
                )}
            </main>

            {/* Bill Summary Sticky Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border-t border-[#EEE2D1] p-6 z-40">
                <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <Receipt size={18} className="text-[#A8A29F]" />
                            <span className="text-[12px] font-bold text-[#8B837E] uppercase tracking-wider">ยอดรวมของคุณ</span>
                        </div>
                        <span className="text-[10px] font-bold bg-[#F7EAD7] text-[#A65D2E] px-2 py-1 rounded-md uppercase">
                            SC {party.serviceCharge}% • VAT {party.vat}%
                        </span>
                    </div>

                    <div className="flex justify-between items-end mb-5">
                        <div className="text-3xl font-black text-[#2B361B] tracking-tight">
                            ฿{Math.ceil(mySummary.summary.netTotal || 0).toLocaleString()}
                        </div>
                        {mySummary.items.length > 0 && (
                            <div className="text-right">
                                <p className="text-[11px] text-[#A8A29F] font-medium leading-tight">ค่าอาหาร: ฿{mySummary.summary.subtotal.toFixed(2)}</p>
                                <p className="text-[11px] text-[#A8A29F] font-medium leading-tight">+ SC & VAT: ฿{(mySummary.summary.serviceCharge + mySummary.summary.vat).toFixed(2)}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate(`/party/${id}/split-bill/summary`)}
                        className="w-full bg-[#A65D2E] hover:bg-[#8B4D24] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#A65D2E]/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2 cursor-pointer"
                    >
                        ดูสรุปบิลทั้งโต๊ะ
                    </button>
                </div>
            </div>

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
                                    const sharers = getMenuSharers(selectedMenuForSheet.id);
                                    const isCurrentlySelected = selectedMenuIds.includes(selectedMenuForSheet.id);

                                    // คำนวณราคาเฉลี่ยต่อคน (จำลองให้เห็นว่าถ้ากดตกลงจะเสียเท่าไหร่)
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
                                    className={`w-full py-4 rounded-2xl font-bold shadow-sm transition-all flex justify-center items-center gap-2 cursor-pointer ${selectedMenuIds.includes(selectedMenuForSheet.id)
                                        ? 'bg-[#EAD9CF] text-[#2B361B] hover:bg-[#D9C5B2]'
                                        : 'bg-[#2B361B] text-white hover:bg-[#1A2210]'
                                        }`}
                                >
                                    {actionLoading ? 'กำลังประมวลผล...' : (selectedMenuIds.includes(selectedMenuForSheet.id) ? 'ยกเลิกการหารเมนูนี้' : 'ยืนยันเข้าร่วมหาร')}
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
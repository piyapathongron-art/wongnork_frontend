import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Receipt, Check, Utensils, AlertCircle } from 'lucide-react';
import { apiGetPartyById, apiGetSplitBill, apiAddOrderItem, apiRemoveOrderItem } from '../api/party';
import useUserStore from '../stores/userStore';
import { toast } from 'react-toastify';

const SplitBillMenu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);

    const [party, setParty] = useState(null);
    const [billSummary, setBillSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
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

    const handleToggleMenu = async (menuId, isSelected) => {
        if (actionLoading) return;
        setActionLoading(true);
        try {
            if (isSelected) {
                await apiRemoveOrderItem(id, menuId);
                toast.info("ยกเลิกเมนูแล้ว", { autoClose: 1000 });
            } else {
                await apiAddOrderItem(id, menuId);
                toast.success("เลือกเมนูแล้ว", { autoClose: 1000 });
            }
            // รีโหลดข้อมูลบิลใหม่เพื่ออัปเดตยอดเงินทันที
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

    const menuItems = party.restaurant?.menu || party.restaurant?.menus || [];
    
    // หายอดสรุปของ User ตัวเองจาก response
    const mySummary = billSummary?.members?.find(m => m.user.id === user?.id) || {
        items: [],
        summary: { subtotal: 0, serviceCharge: 0, vat: 0, netTotal: 0 }
    };
    
    const selectedMenuIds = mySummary.items.map(item => item.menuId);

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
                        <h3 className="font-bold text-[14px] leading-tight">ติ๊กเลือกเมนูที่คุณทาน</h3>
                        <p className="text-[11px] text-[#8B837E] mt-1 leading-relaxed">ราคาจะถูกนำไปหารเฉลี่ยกับเพื่อนคนอื่นที่เลือกเมนูเดียวกันอัตโนมัติ</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {menuItems.map(menu => {
                        const isSelected = selectedMenuIds.includes(menu.id);
                        return (
                            <div 
                                key={menu.id}
                                onClick={() => handleToggleMenu(menu.id, isSelected)}
                                className={`p-4 rounded-[1.5rem] flex items-center gap-4 border transition-all cursor-pointer active:scale-[0.98] ${
                                    isSelected 
                                    ? 'bg-white border-[#A65D2E] shadow-md ring-1 ring-[#A65D2E]/20' 
                                    : 'bg-white border-[#EEE2D1] opacity-80 hover:opacity-100'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected ? 'bg-[#A65D2E] border-[#A65D2E]' : 'border-[#D9C5B2]'
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
                                        
                                        {/* Show who else is eating this if > 0 */}
                                        {isSelected && mySummary.items.find(i => i.menuId === menu.id)?.sharedBy > 1 && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider bg-[#F7EAD7] text-[#A65D2E] px-2 py-0.5 rounded-md">
                                                หาร {mySummary.items.find(i => i.menuId === menu.id).sharedBy} คน
                                            </span>
                                        )}
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
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] border-t border-[#EEE2D1] p-6 z-50">
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
        </div>
    );
};

export default SplitBillMenu;
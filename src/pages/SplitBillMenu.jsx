import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Receipt, Check, Utensils, AlertCircle, X, Users, Plus, Crown, User as UserIcon, Star, MessageSquare } from 'lucide-react';
import { apiGetPartyById, apiGetSplitBill, apiAddOrderItem, apiKickMember } from '../api/party';
import { apiGetMenuByRestaurantId } from '../api/menuApi';
import useUserStore from '../stores/userStore';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import PartyControlMenu from '../components/PartyControlMenu';
import CreateReviewModal from '../components/Modals/CreateReviewModal';

const SplitBillMenu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);

    const [party, setParty] = useState(null);
    const [billSummary, setBillSummary] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Review System State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [hasReviewed, setHasHasReviewed] = useState(false);

    const isLeader = party?.leaderId === user?.id;
    const isCompleted = party?.status === 'COMPLETED';

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

            // 🌟 เช็คว่า User นี้รีวิวปาร์ตี้นี้ไปหรือยัง (สมมติว่า backend ส่งข้อมูลรีวิวมาในปาร์ตี้ หรือเราเช็คจากรายการรีวิวของร้าน)
            // ในที่นี้เราจะเช็คว่าในรายการ reviews ของร้าน มีอันไหนที่มี userId และ partyId ตรงกับเราไหม
            if (partyData.restaurant?.reviews) {
                const myReview = partyData.restaurant.reviews.find(r => r.userId === user?.id && r.partyId === id);
                if (myReview) setHasHasReviewed(true);
            }
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
    }, [id, user?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAddMenuToBill = async (menu) => {
        if (actionLoading || isCompleted) return;
        setActionLoading(true);
        try {
            await apiAddOrderItem(id, { menuId: menu.id, quantity: 1, isCustom: false });
            toast.success(`เพิ่ม ${menu.name} ลงบิลแล้ว (+1)`, { autoClose: 1000, position: "top-center", theme: "dark" });
            const billRes = await apiGetSplitBill(id);
            setBillSummary(billRes.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
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
            <div onClick={() => handleAddMenuToBill(item)} className={`p-4 rounded-[1.5rem] bg-white border border-[#EEE2D1] shadow-sm flex items-center gap-4 transition-all group ${isCompleted ? 'opacity-90' : 'cursor-pointer active:scale-[0.98] hover:border-[#A65D2E]/50'}`}>
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
            </div>
        );
    };

    return (
        <div className="relative w-full h-screen bg-[#FFF8F5] text-[#2B361B] overflow-hidden">
            <header className="absolute top-0 left-0 right-0 z-40 px-6 py-4 flex items-center gap-4">
                <div className="absolute inset-0 bg-[#FFF8F5]/70 backdrop-blur-xl -z-10 shadow-sm" style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }} />
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-[#F7EAD7] transition-colors pointer-events-auto"><ArrowLeft size={24} className="text-[#2B361B]" /></button>
                <div className="flex-1 overflow-hidden"><h1 className="text-xl font-extrabold text-[#2B361B] tracking-tight leading-none truncate">เลือกเมนูเข้าบิลโต๊ะ</h1><p className="text-[11px] font-bold text-[#A65D2E] uppercase tracking-wider mt-1 truncate">{party.name}</p></div>
                <PartyControlMenu party={party} isLeader={isLeader} isCompleted={isCompleted} onUpdate={loadData} />
            </header>

            <main className="h-full overflow-y-auto no-scrollbar pt-24 pb-48 px-6">
                {/* 🌟 Review Prompt for Completed Party */}
                {isCompleted && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-5 rounded-[2rem] bg-white border border-[#A67045]/20 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#A67045]/5 rounded-full -mr-8 -mt-8" />
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#F4E8DB] rounded-2xl flex items-center justify-center shrink-0">
                                <Star size={24} className={`${hasReviewed ? 'text-gray-400' : 'text-[#A67045] fill-current animate-pulse'}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-[14px] text-[#2B361B]">{hasReviewed ? 'ขอบคุณสำหรับการรีวิว!' : 'รสชาติเป็นยังไงบ้าง?'}</h3>
                                <p className="text-[10px] text-[#8B837E] mt-0.5">{hasReviewed ? 'รีวิวของคุณช่วยเพื่อนๆ ได้มากเลยครับ' : 'ร่วมแบ่งปันประสบการณ์มื้อนี้ของคุณ'}</p>
                            </div>
                            <button
                                onClick={() => !hasReviewed && setIsReviewModalOpen(true)}
                                disabled={hasReviewed}
                                className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all ${hasReviewed ? 'bg-gray-100 text-gray-400' : 'bg-[#182806] text-white shadow-md active:scale-95'}`}
                            >
                                {hasReviewed ? 'รีวิวแล้ว' : 'รีวิวเลย'}
                            </button>
                        </div>
                    </motion.div>
                )}

                <h3 className="text-[10px] font-bold text-[#8B837E] uppercase tracking-[0.2em] mb-4">สมาชิกในปาร์ตี้ ({party.members?.length || 0} คน)</h3>
                <div className="mb-6" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)' }}>
                    <div className="pl-5 flex gap-4 overflow-x-auto no-scrollbar pt-2 pb-2">
                        {sortedMembers?.map((member) => (
                            <div key={member.id} className="flex-none flex flex-col items-center gap-2 relative">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-gray-200"><img src={member.user.avatarUrl || `https://i.pravatar.cc/150?u=${member.user.id}`} alt={member.user.name} className="w-full h-full object-cover" /></div>
                                    {member.user.id === user?.id && (<div className="absolute -top-1 -right-0 bg-[#182806] p-1 rounded-full shadow-sm border border-white"><UserIcon size={10} className="text-white fill-current" /></div>)}
                                    {member.user.id === party.leaderId && (<div className="absolute -top-1 -right-0 bg-yellow-400 p-1 rounded-full shadow-sm border border-white"><Crown size={10} className="text-white fill-current" /></div>)}
                                    {isLeader && member.user.id !== party.leaderId && !isCompleted && (<button onClick={() => handleKickMember(member.user.id, member.user.name)} className="absolute -top-1 -left-1 bg-red-500 text-white p-1 rounded-full shadow-md border border-white hover:bg-red-600 transition-colors"><X size={10} strokeWidth={3} /></button>)}
                                </div>
                                <span className={`text-[10px] font-bold truncate w-16 text-center ${member.user.id === user?.id ? 'text-[#A65D2E]' : 'text-[#2B361B]'}`}>{member.user.id === user?.id ? 'คุณ' : member.user.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`rounded-[2rem] p-5 mb-8 border flex gap-4 items-center ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-[#EAD9CF]/40 border-[#EAD9CF]'}`}>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">{isCompleted ? <Check size={20} className="text-green-600" /> : <Utensils size={20} className="text-[#A65D2E]" />}</div>
                    <div><h3 className="font-bold text-[14px] leading-tight">{isCompleted ? 'ปาร์ตี้นี้ปิดยอดเรียบร้อยแล้ว' : 'กดเมนูเพื่อเพิ่มเข้าบิลโต๊ะ'}</h3><p className="text-[11px] text-[#8B837E] mt-1 leading-relaxed">{isCompleted ? 'คุณสามารถดูสรุปยอดบิลได้ที่ปุ่มด้านล่าง แต่ไม่สามารถแก้ไขข้อมูลได้แล้ว' : 'เมื่อกด ระบบจะถือว่าคุณเริ่มทานและร่วมหารเมนูนี้อัตโนมัติ'}</p></div>
                </div>

                <div className="space-y-3 mb-10">
                    <h3 className="text-[10px] font-bold text-[#8B837E] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><div className="h-px flex-1 bg-[#EAD9CF]" />เมนูทั้งหมดจากร้าน<div className="h-px flex-1 bg-[#EAD9CF]" /></h3>
                    {menuItems.map(menu => <MenuItemCard key={menu.id} item={menu} />)}
                </div>
            </main>

            <div className="absolute bottom-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-xl rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-[#EEE2D1] p-6 pb-10" style={{ maskImage: 'linear-gradient(to top, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 90%, transparent 100%)' }}>
                <div className="max-w-md mx-auto pointer-events-auto">
                    <div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2"><Receipt size={18} className="text-[#A8A29F]" /><span className="text-[12px] font-bold text-[#8B837E] uppercase tracking-wider">ยอดรวมของคุณ (คนเดียว)</span></div><span className="text-[10px] font-bold bg-[#F7EAD7] text-[#A65D2E] px-2 py-1 rounded-md uppercase">คุณหารอยู่ {mySummary.items.length} รายการ</span></div>
                    <div className="flex justify-between items-end mb-6"><div className="text-4xl font-black text-[#2B361B] tracking-tight flex items-center gap-2"><motion.span key={mySummary.summary.netTotal} initial={{ opacity: 0, scale: 0.9, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>฿{Math.ceil(mySummary.summary.netTotal || 0).toLocaleString()}</motion.span></div>{mySummary.items.length > 0 && (<div className="text-right flex flex-col items-end"><p className="text-[9px] text-[#A8A29F] font-bold leading-tight">(ค่าอาหาร ฿{Math.ceil(mySummary.summary.subtotal).toLocaleString()} + บริการ ฿{Math.ceil(mySummary.summary.serviceCharge).toLocaleString()} + ภาษี ฿{Math.ceil(mySummary.summary.vat).toLocaleString()})</p><p className="text-[8px] text-[#A65D2E] font-black uppercase mt-0.5">* หารเท่ากัน {billSummary?.members?.length} คน</p></div>)}</div>
                    <button onClick={() => navigate(`/party/${id}/split-bill/summary`)} className="w-full bg-[#182806] hover:bg-[#2D3E1A] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 relative overflow-hidden">{isCompleted ? 'ดูสรุปบิลทั้งโต๊ะ' : 'จัดการบิลทั้งโต๊ะ'}{billSummary?.tableItems?.length > 0 && (<span className="absolute right-4 bg-[#A65D2E] text-white text-[10px] px-2 py-0.5 rounded-full font-black">{isCompleted ? 'ยอดรวม' : 'โต๊ะสั่งแล้ว'} {billSummary.tableItems.reduce((acc, curr) => acc + curr.quantity, 0)} จาน</span>)}</button>
                </div>
            </div>

            {/* 🌟 Review Modal */}
            <CreateReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                restaurantId={party?.restaurantId}
                partyId={id} // 🌟 ส่ง partyId ไปด้วย
                onReviewSuccess={() => {
                    setHasHasReviewed(true);
                    loadData();
                    toast.success("ขอบคุณสำหรับรีวิวครับ!");
                }}
            />
        </div>
    );
};

export default SplitBillMenu;

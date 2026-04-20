import React, { useState } from 'react';
import { Search, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import useUserStore from '../stores/userStore';
import AuthModal from '../components/AuthModal';

const MyParties = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const isLogin = useUserStore(state => state.isLogin);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    const mockParties = [
        {
            id: 'p1',
            name: 'หาคนหารชาบู ด่วนๆ!',
            restaurantName: 'Shabu ชาบู ชิลล์ๆ',
            leader: { name: 'อาร์ตี้', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
            meetupTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            currentMembers: 2,
            maxMembers: 4,
            distance: '1.2 km',
            restaurantImage: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'
        },
        {
            id: 'p2',
            name: 'ตี้สายหวาน คาเฟ่เปิดใหม่',
            restaurantName: 'Café de น่านนั้ง',
            leader: { name: 'น้องไดฟ์', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
            meetupTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            currentMembers: 3,
            maxMembers: 6,
            distance: '2.5 km',
            restaurantImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
        },
        {
            id: 'p3',
            name: 'เนื้อย่างพรีเมียม หารเท่า',
            restaurantName: 'เนื้อย่างพรีเมียม',
            leader: { name: 'เปรม', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
            meetupTime: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
            currentMembers: 4,
            maxMembers: 4,
            distance: '4.1 km',
            restaurantImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
        }
    ];

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const handleJoinClick = (e, party) => {
        e.stopPropagation();
        if (!isLogin) {
            setIsAuthModalOpen(true);
            return;
        }
        // Logic for logged in users to join party
        console.log("Join party", party.id);
    };

    const handleCreateClick = () => {
        if (!isLogin) {
            setIsAuthModalOpen(true);
            return;
        }
        // Logic to create party
        console.log("Create party");
    };

    return (
        <div className="w-full min-h-screen bg-[#FFF8F5] text-[#2B361B] pb-32 font-sans overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#FFF8F5]/90 backdrop-blur-md px-6 pt-6 pb-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-extrabold text-[#A65D2E]">Open Parties</h1>
                    <button 
                        onClick={handleCreateClick}
                        className="bg-[#A65D2E] text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-transform cursor-pointer"
                    >
                        + Create
                    </button>
                </div>
                
                <div className="flex items-center bg-white rounded-full px-4 py-3 shadow-sm border border-[#EEE2D1]">
                    <Search size={18} className="text-[#A8A29F]" />
                    <input 
                        type="text" 
                        placeholder="ค้นหาปาร์ตี้ที่น่าสนใจ..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-[#2B361B] placeholder:text-[#A8A29F]"
                    />
                </div>
            </div>

            {/* Party List */}
            <div className="px-6 mt-4 flex flex-col gap-5">
                {mockParties.map(party => {
                    const isFull = party.currentMembers >= party.maxMembers;
                    return (
                        <div 
                            key={party.id}
                            className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#EEE2D1]/50 active:scale-[0.98] transition-transform cursor-pointer"
                        >
                            <div className="relative h-32 bg-gray-200">
                                <img src={party.restaurantImage} alt="restaurant" className="w-full h-full object-cover" />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <Clock size={12} className="text-[#A65D2E]" />
                                    <span className="text-[10px] font-bold text-[#A65D2E]">{formatDate(party.meetupTime)}</span>
                                </div>
                                {isFull && (
                                    <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Full</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-5">
                                <h3 className="font-bold text-[16px] text-[#2B361B] mb-1 line-clamp-1">{party.name}</h3>
                                <div className="flex items-center gap-1.5 text-[12px] text-[#8B837E] font-medium mb-4">
                                    <MapPin size={14} className="text-[#A65D2E]" />
                                    <span className="truncate">{party.restaurantName} • {party.distance}</span>
                                </div>
                                
                                <div className="flex justify-between items-end mb-4">
                                    <div className="flex items-center gap-2">
                                        <img src={party.leader.avatarUrl} alt={party.leader.name} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-[#A8A29F] uppercase tracking-wider font-bold">Leader</span>
                                            <span className="text-[12px] font-bold text-[#2B361B]">{party.leader.name}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#2B361B]">
                                            <Users size={14} className={isFull ? "text-red-500" : "text-[#A65D2E]"} />
                                            <span className={isFull ? "text-red-500" : ""}>{party.currentMembers}/{party.maxMembers}</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={(e) => handleJoinClick(e, party)}
                                    disabled={isFull}
                                    className={`w-full py-3 rounded-xl font-bold text-[13px] flex justify-center items-center gap-2 shadow-sm transition-all ${
                                        isFull 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : 'bg-[#A65D2E] text-white hover:bg-[#8B4D24] active:scale-95 cursor-pointer'
                                    }`}
                                >
                                    {isFull ? 'Party Full' : 'Join Party'}
                                    {!isFull && <ArrowRight size={16} />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Authentication Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                message="กรุณาล็อกอินเพื่อเข้าร่วมปาร์ตี้ หรือสร้างปาร์ตี้ใหม่กับเพื่อนๆ"
            />
        </div>
    );
};

export default MyParties;
import React from 'react';
import { History, Clock } from 'lucide-react';

const PartySection = ({ 
    activeParties, 
    hasPastParties, 
    setIsHistoryOpen, 
    navigate, 
    formatDate, 
    formatTime 
}) => {
    return (
        <section className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-xl text-[#2B361B]">My Parties</h3>
                {hasPastParties && (
                    <button 
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-[#A65D2E] bg-[#F7EAD7] px-3 py-1.5 rounded-full active:scale-95 transition-transform cursor-pointer shadow-sm hover:bg-[#EAD9CF]"
                    >
                        <History size={14} />
                        History
                    </button>
                )}
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {activeParties.length === 0 ? (
                    <div className="flex-none w-64 py-8 flex flex-col items-center justify-center bg-white/40 rounded-3xl border border-dashed border-[#EEE2D1] text-center">
                        <Clock size={24} className="text-[#A8A29F] mb-2 opacity-50" />
                        <p className="text-[10px] font-bold text-[#8B837E] uppercase tracking-wider">No active parties</p>
                    </div>
                ) : (
                    activeParties.map((party, index) => {
                        const restaurant = party.restaurant || {};
                        const imageUrl =
                        restaurant.images?.find((img) => img.isCover)?.url ||
                        restaurant.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80';
                        const memberCount = party.members?.length || 1;

                        return (
                            <div key={party.relationId || index} onClick={() => navigate(`/party/${party.id}/split-bill`)} className="flex-none w-[160px] bg-white rounded-3xl p-3 shadow-sm border border-[#EEE2D1]/30 space-y-3 relative overflow-hidden cursor-pointer active:scale-95 transition-transform">
                                {party.isLeader && (
                                    <div className="absolute top-2 right-2 z-10 bg-[#FFF8F5]/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-[#F7EAD7]">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#A65D2E]">
                                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                                <div className="w-full h-24 rounded-2xl overflow-hidden bg-[#2D3E25] relative">
                                    <img alt={party.name} className="w-full h-full object-cover" src={imageUrl} />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-[#A65D2E] uppercase tracking-wide">
                                        {formatDate(party.meetupTime)} • {formatTime(party.meetupTime)}
                                    </p>
                                    <h4 className="font-bold text-sm truncate text-[#2B361B]">{party.name || 'Party'}</h4>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <div className="flex -space-x-2">
                                        {party.members?.slice(0, 3).map((member, mIdx) => (
                                            <div key={mIdx} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative z-10 shadow-sm">
                                                <img
                                                    src={member.user?.avatarUrl || `https://i.pravatar.cc/150?u=${member.user?.id || mIdx}`}
                                                    alt={member.user?.name || "Member"}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        <div className="w-6 h-6 rounded-full border-2 border-white bg-[#F7EAD7] flex items-center justify-center text-[10px] font-bold text-[#A65D2E] shadow-sm z-20">
                                            +{Math.max(memberCount - 3, 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                <div
                    onClick={() => navigate('/party', { state: { openCreateModal: true } })}
                    className="flex-none w-[160px] bg-[#FAF5F0] rounded-3xl p-3 border border-[#EEE2D1]/50 flex flex-col justify-center items-center text-center space-y-2 cursor-pointer hover:bg-[#F2E8DF] transition-colors"
                >
                    <div className="w-10 h-10 rounded-full border border-[#8B837E] flex items-center justify-center text-[#8B837E]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <p className="text-xs font-medium text-[#8B837E]">Host a new party</p>
                </div>
            </div>
        </section>
    );
};

export default PartySection;
import React, { useRef } from 'react';
import { Crown, Users, ChevronRight, ChevronLeft } from 'lucide-react';

const PartyCard = ({ party, onJoin, onLeave, isJoined }) => {
    const scrollRef = useRef(null);

    const maxSlots = party.maxParticipants || 4;
    const guestsOnly = party.members?.filter(m => 
        m.userId?.toString() !== party.leaderId?.toString()
    ) || [];

    const currentMemberCount = 1 + guestsOnly.length;
    const additionalSlots = maxSlots - 1; 

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -120 : 120;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const hostName = party.leader?.name || "Host";
    const hostImg = party.leader?.avatarUrl || party.leader?.user?.avatarUrl;
    const coverImage = party.restaurant?.images?.find(img => img.isCover)?.url 
                       || party.restaurant?.images?.[0]?.url;

    const getAvatar = (imgUrl, nameFallback) => {
        if (imgUrl) return imgUrl;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameFallback || 'U')}&background=BC6C25&color=fff&bold=true`;
    };

    return (
        <div className={`transition-all duration-500 relative bg-[#F7EAD7] dark:bg-zinc-900 rounded-[32px] p-5 flex gap-4 shadow-md border 
            ${isJoined 
                ? 'border-[#BC6C25] ring-2 ring-[#BC6C25]/20 scale-[1.02] z-10' 
                : 'border-[#D9C5B2]/50 dark:border-zinc-800'
            }`}>
            
            {/* Status Dot */}
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full border-2 border-[#F7EAD7] dark:border-zinc-900 
                ${party.status === 'OPEN' ? 'bg-[#BC6C25]' : 'bg-gray-400'}`} 
            />

            {/* Left Side: Restaurant Image */}
            <div className="w-28 h-28 bg-[#E7D7C1] dark:bg-zinc-800 rounded-[24px] flex items-center justify-center text-center p-3 flex-shrink-0 overflow-hidden border border-[#D9C5B2]/30">
                {coverImage ? (
                    <img src={coverImage} className="w-full h-full object-cover" alt="restaurant" />
                ) : (
                    <span className="text-[9px] font-black uppercase text-[#BC6C25] leading-tight tracking-tighter">
                        {party.restaurant?.name || "RESTAURANT"}
                    </span>
                )}
            </div>

            {/* Right Side: Content Area */}
            <div className="flex-1 flex flex-col justify-between py-1 min-w-0"> 
                <div className="relative min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-[13px] font-black uppercase tracking-tight text-[#2B361B] dark:text-white leading-tight truncate flex-1">
                            {party.name}
                        </h3>
                    </div>

                    <div className="relative group">
                        {/* LEFT SCROLL */}
                        {maxSlots > 3 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                                className="absolute -left-2 bottom-8 z-30 bg-[#BC6C25]/90 text-white p-1 rounded-full shadow-lg pointer-events-auto backdrop-blur-sm active:scale-90 transition-all"
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </button>
                        )}

                        <div 
                            ref={scrollRef}
                            className="flex items-end gap-2.5 mt-6 overflow-x-auto no-scrollbar flex-nowrap pb-2 scroll-smooth w-full px-2"
                        >
                            {/* Leader Slot */}
                            <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <div className="relative pt-3"> 
                                    <Crown className="absolute top-0 left-1/2 -translate-x-1/2 text-[#BC6C25] w-4 h-4 z-20" fill="currentColor" />
                                    <div className="w-11 h-11 bg-[#BC6C25] rounded-full border-2 border-[#F7EAD7] overflow-hidden flex items-center justify-center shadow-sm relative z-10">
                                        <img src={getAvatar(hostImg, hostName)} className="w-full h-full object-cover" alt="host" />
                                    </div>
                                </div>
                                <span className="text-[7px] font-black uppercase text-[#2B361B]/50 dark:text-zinc-500 truncate w-12 text-center">
                                    {hostName}
                                </span>
                            </div>

                            {/* Guest Slots */}
                            {[...Array(additionalSlots)].map((_, i) => {
                                const guest = guestsOnly[i];
                                const guestImg = guest?.user?.avatarUrl || guest?.avatarUrl;
                                const guestName = guest?.user?.name || guest?.name;

                                return (
                                    <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                                        <div className={`w-11 h-11 rounded-full border-2 border-[#F7EAD7] shadow-sm overflow-hidden flex items-center justify-center transition-all duration-300
                                            ${guest ? "bg-[#BC6C25]" : "bg-[#E7D7C1]/40 dark:bg-zinc-800/40 border-dashed border-[#BC6C25]/20"}`}>
                                            {guest && (
                                                <img src={getAvatar(guestImg, guestName)} className="w-full h-full object-cover" alt="member" />
                                            )}
                                        </div>
                                        <span className={`text-[7px] font-black uppercase truncate w-12 text-center 
                                            ${guest ? 'text-[#2B361B]/50 dark:text-zinc-500' : 'text-[#BC6C25]/30'}`}>
                                            {guest ? guestName : "Open"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* RIGHT SCROLL */}
                        {maxSlots > 3 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); scroll('right'); }}
                                className="absolute -right-2 bottom-8 z-30 bg-[#BC6C25]/90 text-white p-1 rounded-full shadow-lg pointer-events-auto backdrop-blur-sm active:scale-90 transition-all"
                            >
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-1 opacity-50">
                        <Users className="w-3 h-3 text-[#2B361B] dark:text-zinc-400" />
                        <span className="text-[9px] font-black">{currentMemberCount}/{maxSlots}</span>
                    </div>

                    <button 
                        onClick={(e) => { e.stopPropagation(); isJoined ? onLeave() : onJoin(); }}
                        disabled={!isJoined && currentMemberCount >= maxSlots}
                        className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm transition-all active:scale-95
                            ${isJoined 
                                ? "bg-[#2B361B] text-[#F7EAD7]" 
                                : currentMemberCount >= maxSlots 
                                    ? "bg-zinc-400 text-zinc-600 cursor-not-allowed" 
                                    : "bg-[#BC6C25] text-[#F7EAD7]"
                            }`}
                    >
                        {isJoined ? "Leave" : (currentMemberCount >= maxSlots ? "Full" : "Join")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartyCard;
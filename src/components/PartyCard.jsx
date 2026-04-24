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
        <div className={`transition-all duration-500 relative bg-base-200  rounded-[32px] p-5 flex gap-4 shadow-md border 
            ${isJoined
                ? 'border-primary ring-2 ring-primary/20 scale-[1.02] z-10'
                : 'border-base-content/15 '
            }`}>

            {/* Status Dot */}
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full border-2 border-base-200 animate-pulse
                ${party.status === 'OPEN' ? 'bg-[#4cb944]' : 'bg-[#de3636]'}`}
            />

            {/* Left Side: Restaurant Image */}
            <div className="w-28 h-28 bg-base-300  rounded-[24px] flex items-center justify-center text-center flex-shrink-0 overflow-hidden border border-base-content/10">
                {coverImage ? (
                    <img src={coverImage} className="w-full h-full object-cover" alt="restaurant" />
                ) : (
                    <span className="text-[9px] font-black uppercase text-primary leading-tight tracking-tighter">
                        {party.restaurant?.name || "Restaurant"}
                    </span>
                )}
            </div>

            {/* Right Side: Content Area */}
            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                <div className="relative min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-[13px] font-black uppercase tracking-tight text-base-content  leading-tight truncate flex-1">
                            {party.name}
                        </h3>
                    </div>

                    <div className="relative group">
                        {/* LEFT SCROLL */}
                        {maxSlots > 3 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                                className="absolute -left-2 bottom-8 z-30 bg-primary/90 text-white p-1 rounded-full shadow-lg pointer-events-auto backdrop-blur-sm active:scale-90 transition-all"
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
                                    <Crown className="absolute top-0 left-1/2 -translate-x-1/2 text-primary w-4 h-4 z-20" fill="currentColor" />
                                    <div className="w-11 h-11 bg-primary rounded-full border-2 border-base-200 overflow-hidden flex items-center justify-center shadow-sm relative z-10">
                                        <img src={getAvatar(hostImg, hostName)} className="w-full h-full object-cover" alt="host" />
                                    </div>
                                </div>
                                <span className="text-[7px] font-black uppercase text-base-content/50  truncate w-12 text-center">
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
                                        <div className={`w-11 h-11 rounded-full border-2 border-base-200 shadow-sm overflow-hidden flex items-center justify-center transition-all duration-300
                                            ${guest ? "bg-primary" : "bg-base-300/40  border-dashed border-primary/20"}`}>
                                            {guest && (
                                                <img src={getAvatar(guestImg, guestName)} className="w-full h-full object-cover" alt="member" />
                                            )}
                                        </div>
                                        <span className={`text-[7px] font-black uppercase truncate w-12 text-center 
                                            ${guest ? 'text-base-content/50' : 'text-primary/30'}`}>
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
                                className="absolute -right-2 bottom-8 z-30 bg-primary/90 text-white p-1 rounded-full shadow-lg pointer-events-auto backdrop-blur-sm active:scale-90 transition-all"
                            >
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-1 opacity-50">
                        <Users className="w-3 h-3 text-base-content" />
                        <span className="text-[9px] font-black">{currentMemberCount}/{maxSlots}</span>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); isJoined ? onLeave() : onJoin(); }}
                        disabled={!isJoined && currentMemberCount >= maxSlots || party.status !== 'OPEN'}
                        className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm transition-all active:scale-95
                            ${isJoined
                                ? "bg-secondary text-base-200"
                                : currentMemberCount >= maxSlots || party.status !== 'OPEN'
                                    ? "bg-zinc-400 text-zinc-600 cursor-not-allowed"
                                    : "bg-primary text-base-200"
                            }`}
                    >
                        {isJoined ? "Leave" : (currentMemberCount >= maxSlots || party.status !== 'OPEN') ? "Close" : "Join"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartyCard;
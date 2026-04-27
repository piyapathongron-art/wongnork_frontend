import React, { useRef } from 'react';
import { Crown, Users, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';

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
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameFallback || 'U')}&background=FCF5ED&color=A65D2E&bold=true`;
    };

    return (
        <div className={`transition-all duration-500 relative bg-base-300 rounded-[32px] p-5  flex gap-5 shadow-sm border 
            ${isJoined
                ? 'border-primary ring-4 ring-primary/5 scale-[1.01] z-10'
                : 'border-base-content/10 hover:border-primary/20 hover:shadow-md transition-all duration-300'
            }`}
        >

            {/* Status Dot */}
            <div className={`absolute top-5 right-5 w-2.5 h-2.5 rounded-full border-2 border-base-100 shadow-sm
                ${party.status === 'OPEN' ? 'bg-success animate-pulse' : 'bg-error'}`}
            />

            {/* Left Side: Restaurant Image */}
            <div className="w-28 h-32 bg-base-300 rounded-[24px] flex-shrink-0 overflow-hidden border border-base-content/5 shadow-inner">
                {coverImage ? (
                    <img src={coverImage} className="w-full h-full object-cover" alt="restaurant" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-2 text-center bg-primary/10">
                        <span className="text-[8px] font-black uppercase text-primary leading-tight tracking-tighter">
                            {party.restaurant?.name || "Restaurant"}
                        </span>
                    </div>
                )}
            </div>

            {/* Right Side: Content Area */}
            <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div className="min-w-0">
                    {/* Header: Restaurant & Distance */}
                    <div className="flex flex-col mb-1.5">
                        <div className="flex items-center gap-1.5 text-primary mb-0.5">
                            <h4 className="text-[11px] font-black uppercase tracking-widest truncate max-w-[80%]">
                                {party.restaurant?.name || "Unknown Place"}
                            </h4>
                            {party.dist !== null && (
                                <div className="flex items-center gap-0.5 bg-primary/10 px-1.5 py-0.5 rounded-md shrink-0">
                                    <MapPin size={8} strokeWidth={3} />
                                    <span className="text-[8px] font-black">{party.dist.toFixed(1)} km</span>
                                </div>
                            )}
                        </div>
                        <h3 className="text-sm font-black text-base-content leading-tight truncate">
                            {party.name || "มื้ออาหารแสนอร่อย"}
                        </h3>
                    </div>

                    {/* Member Avatars Scroll Area */}
                    <div className="relative group/scroll mt-3">
                        {maxSlots > 3 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); scroll('left'); }}
                                className="absolute -left-2 top-1/2 -translate-y-1/2 z-30 bg-base-100/90 text-base-content p-1 rounded-full shadow-md backdrop-blur-sm active:scale-90 transition-all opacity-0 group-hover/scroll:opacity-100 border border-base-content/5"
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </button>
                        )}

                        <div
                            ref={scrollRef}
                            className="flex items-end gap-3 overflow-x-auto no-scrollbar flex-nowrap pb-2 scroll-smooth w-full px-1"
                        >
                            {/* Leader Slot */}
                            <div className="flex flex-col items-center gap-1 shrink-0">
                                <div className="relative pt-2.5">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-warning rounded-full p-0.5 border border-base-100 shadow-sm z-20">
                                        <Crown size={8} fill="white" className="text-white" />
                                    </div>
                                    <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center relative z-10 shadow-sm ring-2 ring-primary/10">
                                        <img src={getAvatar(hostImg, hostName)} className="w-full h-full object-cover" alt="host" />
                                    </div>
                                </div>
                                <span className="text-[6px] font-black uppercase text-base-content/40 truncate w-10 text-center">
                                    {hostName}
                                </span>
                            </div>

                            {/* Guest Slots */}
                            {[...Array(additionalSlots)].map((_, i) => {
                                const guest = guestsOnly[i];
                                const guestImg = guest?.user?.avatarUrl || guest?.avatarUrl;
                                const guestName = guest?.user?.name || guest?.name;

                                return (
                                    <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                                        <div className={`w-10 h-10 rounded-full border-2 transition-all duration-300 overflow-hidden flex items-center justify-center
                                            ${guest ? "border-primary/40 shadow-sm" : "border-dashed border-base-content/10 bg-base-200"}`}>
                                            {guest && (
                                                <img src={getAvatar(guestImg, guestName)} className="w-full h-full object-cover" alt="member" />
                                            )}
                                        </div>
                                        <span className={`text-[6px] font-black uppercase truncate w-10 text-center 
                                            ${guest ? 'text-base-content/40' : 'text-base-content/10'}`}>
                                            {guest ? guestName : "Open"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {maxSlots > 3 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); scroll('right'); }}
                                className="absolute -right-2 top-1/2 -translate-y-1/2 z-30 bg-base-100/90 text-base-content p-1 rounded-full shadow-md backdrop-blur-sm active:scale-90 transition-all opacity-0 group-hover/scroll:opacity-100 border border-base-content/5"
                            >
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mt-2.5">
                    <div className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-lg">
                        <Users className="w-2.5 h-2.5 text-base-content/60" />
                        <span className="text-[9px] font-black text-base-content/60">{currentMemberCount}/{maxSlots}</span>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); isJoined ? onLeave() : onJoin(); }}
                        disabled={!isJoined && currentMemberCount >= maxSlots || party.status !== 'OPEN'}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm transition-all active:scale-95 border-none
                            ${isJoined
                                ? "bg-secondary text-secondary-content"
                                : currentMemberCount >= maxSlots || party.status !== 'OPEN'
                                    ? "bg-base-300 text-base-content/20 cursor-not-allowed"
                                    : "bg-primary text-primary-content hover:opacity-90"
                            }`}
                    >
                        {isJoined ? "Leave" : (currentMemberCount >= maxSlots || party.status !== 'OPEN') ? "Closed" : "Join Party"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartyCard;
import React from 'react';
import { Crown, Users, LogOut } from 'lucide-react';

const PartyCard = ({ party, onJoin, onLeave, isJoined }) => {
    const maxSlots = party.maxParticipants || 4;
    // Fallback to 1 if count is missing to avoid division errors
    const currentMemberCount = party._count?.members || party.members?.length || 1;
    
    const hostName = party.leader?.username || "Host";
    const hostImg = party.leader?.profileImage;

    return (
        <div className={`transition-all duration-300 relative bg-[#F7EAD7] dark:bg-zinc-900 rounded-[32px] p-5 flex gap-4 border 
            ${isJoined ? 'border-[#BC6C25] ring-2 ring-[#BC6C25]/10' : 'border-transparent'}`}>
            
            {/* Status Dot */}
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full border-2 border-[#F7EAD7] 
                ${party.status === 'OPEN' ? 'bg-green-500' : 'bg-gray-400'}`} 
            />

            {/* Left: Image Placeholder */}
            <div className="w-28 h-28 bg-[#EEE2D1] dark:bg-zinc-800 rounded-[24px] flex items-center justify-center text-center p-3 flex-shrink-0">
                <span className="text-[9px] font-black uppercase text-[#BC6C25]">
                    {party.restaurant?.name || "Restaurant"}
                </span>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-[13px] font-black uppercase text-[#2B361B] dark:text-white mb-2 truncate">
                        {party.name}
                    </h3>

                    {isJoined ? (
                        /* GRID VIEW - Added stable keys for React DOM tracking */
                        <div className="grid grid-cols-2 gap-2 bg-[#D9C5B2]/20 p-2 rounded-xl">
                            <div className="bg-white rounded-lg p-1 flex items-center gap-2">
                                <div className="relative w-6 h-6 bg-zinc-200 rounded-full overflow-hidden">
                                    <Crown className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 text-black" fill="currentColor" />
                                    {hostImg && <img src={hostImg} className="w-full h-full object-cover" alt="leader" />}
                                </div>
                                <span className="text-[8px] font-bold truncate uppercase">{hostName}</span>
                            </div>

                            {[...Array(maxSlots - 1)].map((_, i) => {
                                const member = party.members?.[i]?.user;
                                return (
                                    <div key={`member-slot-${i}`} className="bg-white rounded-lg p-1 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-zinc-100 rounded-full overflow-hidden">
                                            {member?.profileImage && <img src={member.profileImage} className="w-full h-full object-cover" />}
                                        </div>
                                        <span className="text-[8px] font-bold truncate uppercase opacity-60">
                                            {member?.username || "Empty"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* ROW VIEW */
                        <div className="flex gap-2 items-center">
                            <div className="relative">
                                <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 text-[#BC6C25] w-3 h-3" fill="currentColor" />
                                <div className="w-10 h-10 bg-[#BC6C25]/20 rounded-full border-2 border-[#F7EAD7] overflow-hidden">
                                    {hostImg && <img src={hostImg} className="w-full h-full object-cover" />}
                                </div>
                            </div>
                            {[...Array(maxSlots - 1)].map((_, i) => (
                                <div key={`discovery-slot-${i}`} className={`w-10 h-10 rounded-full border-2 border-[#F7EAD7] 
                                    ${i < (currentMemberCount - 1) ? "bg-[#BC6C25]/40" : "bg-[#EEE2D1] opacity-60"}`} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-1 opacity-50">
                        <Users className="w-3 h-3" />
                        <span className="text-[9px] font-black">{currentMemberCount}/{maxSlots}</span>
                    </div>

                    {isJoined ? (
                        <button onClick={(e) => { e.stopPropagation(); onLeave(); }} className="bg-[#2B361B] text-[#F7EAD7] px-6 py-1.5 rounded-full text-[10px] font-black uppercase active:scale-95">
                            Leave
                        </button>
                    ) : (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onJoin(); }}
                            disabled={party.status === 'FULL'}
                            className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase active:scale-95
                                ${party.status === 'FULL' ? "bg-zinc-300 text-zinc-500" : "bg-[#BC6C25] text-[#F7EAD7]"}`}
                        >
                            {party.status === 'FULL' ? "Full" : "Join"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PartyCard;
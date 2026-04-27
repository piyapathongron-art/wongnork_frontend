import React from 'react'
import { useNavigate } from 'react-router';
import { Users } from 'lucide-react';

export default function MyJoinedGroups({ user, myJoinedGroups, unreadCounts }) {
    const navigate = useNavigate();
    return (
        myJoinedGroups.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 mb-4">
                <h2 className="px-2 text-[10px] font-black tracking-[0.2em] text-primary uppercase opacity-70">
                    Your Current Groups
                </h2>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
                    {myJoinedGroups.map((party) => {
                        const isQuickBill = !party.restaurantId;
                        const restaurant = party.restaurant || {};
                        const imageUrl = isQuickBill ? "https://ui-avatars.com/api/?name=Bill&background=F7EAD7&color=A65D2E&bold=true"
                            : (restaurant.images?.find((img) => img.isCover)?.url || restaurant.images?.[0]?.url || "https://picsum.photos/seed/restaurant/400/300");
                        const unreadCount = unreadCounts[party.id] || 0;

                        return (
                            <div key={`story-${party.id}`}
                                onClick={() => navigate(`/party/${party.id}/split-bill`)}
                                className="flex-none flex flex-col items-center gap-1.5 w-20 cursor-pointer active:scale-95 transition-transform relative">
                                {unreadCount > 0 && (<div className="absolute top-0 right-1 z-10 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-base-100 animate-bounce shadow-md">{unreadCount > 9 ? "9+" : unreadCount}</div>)}
                                <div className={`relative p-[2.5px] rounded-full shadow-sm ${unreadCount > 0 ? "bg-red-500 animate-pulse" : "bg-linear-to-tr from-primary via-base-300 to-accent"}`}>
                                    <div className="w-[60px] h-[60px] rounded-full border-2 border-base-100 overflow-hidden bg-white">
                                        <img src={imageUrl} alt={party.name || "Quick Bill"} className="w-full h-full object-cover" />
                                    </div>
                                    {party.leaderId === user?.id && (
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full shadow-sm border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-white"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg></div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 bg-secondary px-1.5 py-0.5 rounded-full shadow-sm border-2 border-white flex items-center gap-0.5">
                                        <Users size={8} className="text-white fill-current" />
                                        <span className="text-[7px] font-black text-white leading-none">{party.members?.length || 0}/{party.maxParticipants || "∞"}</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-base-content truncate w-full text-center leading-tight">{party.name?.split(" ")[0] || "บิลด่วน"}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="h-px bg-primary/10 w-full mt-1" />
            </div>
        )
    )
}

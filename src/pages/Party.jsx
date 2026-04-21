import React, { useEffect, useState, useCallback } from 'react';
import NavBar from '../components/NavBar';
import PartyCard from '../components/PartyCard';
import { UserPlus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiGetParties, apiJoinParty, apiLeaveParty } from '../api/party';
import useUserStore from '../stores/userStore';
import calculateDistance from '../utils/distance.ustils';

import { useNavigate } from 'react-router';

const Party = () => {
    const navigate = useNavigate();
    const { user, isLogin } = useUserStore();
    const [parties, setParties] = useState([]);
    const [myParties, setMyParties] = useState([]);
    const [userLoc, setUserLoc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (p) => setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => {
                setLoading(false);
                loadData();
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiGetParties();
            let partiesList = res.data.data || [];

            if (partiesList.length > 0) {
                partiesList = partiesList.map(p => ({
                    ...p,
                    dist: userLoc ? calculateDistance(userLoc.lat, userLoc.lng, p.restaurant?.lat, p.restaurant?.lng) : null
                })).sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity));
            }

            if (isLogin && user?.id) {
                const currentUserId = String(user.id);
                const joinedGroups = partiesList.filter(p => 
                    String(p.leaderId) === currentUserId || 
                    p.members?.some(m => String(m.userId) === currentUserId)
                );
                setMyParties(joinedGroups);
            } else {
                setMyParties([]);
            }
            
            setParties(partiesList);
        } catch (err) {
            setMyParties([]);
            toast.error("Sync failed");
        } finally {
            setLoading(false);
        }
    }, [isLogin, user?.id, userLoc]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleJoin = async (partyId) => {
        if (!isLogin) return toast.warning("Login required");
        try {
            await apiJoinParty(partyId);
            toast.success("Joined!");
            await loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Join failed");
        }
    };

    const handleLeave = async (partyId) => {
        try {
            await apiLeaveParty(partyId);
            toast.success("Left party");
            await loadData(); 
        } catch (err) {
            toast.error("Leave failed");
        }
    };

    return (
        <div className="fixed inset-0 bg-[#FDF2ED] dark:bg-black overflow-hidden flex flex-col font-sans">
            
            {/* 1. MAIN SCROLL CONTAINER */}
            {/* FIX: Increased pb-48 (192px) to ensure the last card 
                completely clears the floating button. 
            */}
            <div 
                id="scroll-container" 
                className="flex-1 overflow-y-auto pt-6 px-4 pb-48 no-scrollbar scroll-smooth"
            >
                <div className="flex flex-col gap-6 max-w-md mx-auto">
                    
                    {/* SECTION: YOUR CURRENT GROUPS */}
                    <div key={`my-parties-container-${myParties.length}`} className="flex flex-col gap-6">
                        {myParties.length > 0 && (
                            <>
                                <h2 className="text-center text-[10px] font-black tracking-[0.3em] text-[#BC6C25] uppercase">
                                    — Your Current Groups —
                                </h2>
                                {myParties.map(party => (
                                    <div key={`joined-${party.id}`} onClick={() => navigate(`/party/${party.id}/split-bill`)} className="cursor-pointer">
                                        <PartyCard 
                                            party={party} 
                                            isJoined={true} 
                                            onLeave={(e) => { e?.stopPropagation(); handleLeave(party.id); }}
                                        />
                                    </div>
                                ))}
                                <div className="h-px bg-[#BC6C25]/20 w-full mt-4 mb-2" />
                            </>
                        )}
                    </div>

                    {/* SECTION: DISCOVER HEADER */}
                    <header className="text-center py-2">
                        <h1 className="text-2xl font-black tracking-[0.2em] text-[#2B361B] dark:text-white uppercase">
                            Discover Nearby
                        </h1>
                    </header>

                    {/* SECTION: NEARBY LIST */}
                    <div key="discovery-list" className="flex flex-col gap-6">
                        {loading && parties.length === 0 ? (
                            <div className="text-center py-20 opacity-20 font-black uppercase text-[10px]">Searching...</div>
                        ) : (
                            parties
                                .filter(p => !myParties.some(myP => myP.id === p.id))
                                .map((p) => (
                                    <PartyCard 
                                        key={`discover-${p.id}`} 
                                        party={p} 
                                        onJoin={() => handleJoin(p.id)}
                                        isJoined={false}
                                    />
                                ))
                        )}

                        {!loading && parties.filter(p => !myParties.some(myP => myP.id === p.id)).length === 0 && (
                            <div className="text-center py-10 opacity-40">
                                <Search className="w-10 h-10 mx-auto text-[#BC6C25] mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No more parties nearby</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. FLOATING UI LAYER */}
            {/* Using absolute here instead of fixed because it's inside 
                the fixed inset-0 parent. 
            */}
            <div className="absolute inset-0 pointer-events-none">
                
                {/* FIX: bottom-28 (instead of 32) puts it slightly closer 
                    to the NavBar but away from the list content. 
                */}
                <button 
                    className="absolute bottom-28 right-6 w-20 h-20 bg-[#BC6C25] text-[#F7EAD7] rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-[#FDF2ED] dark:border-zinc-900 z-50 active:scale-90 transition-all pointer-events-auto"
                >
                    <UserPlus className="w-6 h-6 mb-1" />
                    <span className="text-[8px] font-black uppercase">Create</span>
                </button>

                <NavBar />
            </div>
        </div>
    );
};

export default Party;
import React, { useEffect, useState, useCallback } from 'react';
import NavBar from '../components/NavBar';
import PartyCard from '../components/PartyCard';
import { UserPlus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiGetParties, apiJoinParty, apiLeaveParty } from '../api/party';
import useUserStore from '../stores/userStore';

const Party = () => {
    const { user, isLogin } = useUserStore();
    const [parties, setParties] = useState([]);
    const [myParty, setMyParty] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Memoized Load Logic
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiGetParties();
            const partiesList = res.data.data || [];

            if (isLogin && user?.id) {
                const currentUserId = String(user.id);
                
                // Find if the user is the leader OR a member
                const joined = partiesList.find(p => 
                    String(p.leaderId) === currentUserId || 
                    p.members?.some(m => String(m.userId) === currentUserId)
                );
                
                // CRITICAL: Explicitly set to null if not found to hide "YOUR GROUP"
                setMyParty(joined || null);
            } else {
                setMyParty(null);
            }
            
            setParties(partiesList);
        } catch (err) {
            console.error("Sync Error:", err);
            setMyParty(null);
        } finally {
            setLoading(false);
        }
    }, [isLogin, user?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 2. Action Handlers
    const handleJoin = async (partyId) => {
        if (!isLogin) return toast.warning("Please login to join a party");
        try {
            await apiJoinParty(partyId);
            toast.success("Joined successfully!");
            await loadData(); // Refresh both lists
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not join");
        }
    };

    const handleLeave = async (partyId) => {
        try {
            await apiLeaveParty(partyId);
            toast.success("You left the party");
            await loadData(); // This will clear myParty because your ID is now gone
        } catch (err) {
            toast.error("Failed to leave party");
        }
    };

    return (
        <div className="fixed inset-0 bg-[#FDF2ED] dark:bg-black overflow-hidden flex flex-col font-sans">
            {/* Main Scroll Area */}
            <div id="scroll-container" className="flex-1 overflow-y-auto pt-6 px-4 pb-40 no-scrollbar scroll-smooth">
                
                {/* --- SECTION 1: YOUR GROUP --- */}
                {/* We use a wrapper div with a key to prevent React DOM tracking errors */}
                <div key={myParty?.id || 'no-joined-party'} className="mb-10 transition-all duration-500">
                    {myParty && (
                        <>
                            <h2 className="text-center text-[10px] font-black tracking-[0.3em] text-[#BC6C25] uppercase mb-4 animate-pulse">
                                — Your Current Group —
                            </h2>
                            <PartyCard 
                                party={myParty} 
                                isJoined={true} 
                                onLeave={() => handleLeave(myParty.id)}
                            />
                            <div className="mt-10 h-px bg-[#BC6C25]/10 w-full" />
                        </>
                    )}
                </div>

                {/* --- SECTION 2: DISCOVERY --- */}
                <h1 className="text-center text-2xl font-black tracking-widest text-[#2B361B] dark:text-white uppercase mb-8">
                    Discover Nearby
                </h1>

                <div className="flex flex-col gap-6">
                    {loading && parties.length === 0 ? (
                        <div className="text-center py-10 opacity-30 font-bold uppercase text-[10px] tracking-widest">
                            Syncing Tables...
                        </div>
                    ) : (
                        parties
                            // Filter out the party you are already in
                            .filter(p => p.id !== myParty?.id)
                            .map((p) => (
                                <PartyCard 
                                    key={p.id} 
                                    party={p} 
                                    onJoin={() => handleJoin(p.id)}
                                    isJoined={false}
                                />
                            ))
                    )}

                    {/* Empty State */}
                    {!loading && parties.filter(p => p.id !== myParty?.id).length === 0 && (
                        <div className="text-center py-20 opacity-40">
                            <Search className="w-10 h-10 mx-auto text-[#BC6C25] mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#2B361B]">
                                No other parties found
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Float Action Button */}
            <div className="relative pointer-events-none">
                <button className="fixed bottom-32 right-6 w-16 h-16 bg-[#BC6C25] text-[#F7EAD7] rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-[#F7EAD7] dark:border-zinc-900 z-40 active:scale-95 transition-all pointer-events-auto">
                    <UserPlus className="w-5 h-5" />
                    <span className="text-[7px] font-black uppercase mt-1">Create</span>
                </button>
                <NavBar />
            </div>
        </div>
    );
};

export default Party;
import React, { useEffect, useState, useCallback } from "react";
import NavBar from "../components/NavBar";
import PartyCard from "../components/PartyCard";
import { UserPlus, Search, Users, AlertCircle, ArrowUp, MapPin, Clock, CheckCircle2, X as CloseIcon } from "lucide-react";
import { toast } from "react-toastify";
import { apiGetParties, apiJoinParty, apiLeaveParty } from "../api/party";
import useUserStore from "../stores/userStore";
import useChatStore from "../stores/chatStore";
import calculateDistance from "../utils/distance.ustils";
import CreatePartyModal from "../components/Modals/CreatePartyModal";
import { motion, AnimatePresence } from "framer-motion";

import { useNavigate, useLocation } from "react-router";

const Party = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLogin, fetchMe } = useUserStore();
  const unreadCounts = useChatStore((state) => state.unreadCounts);
  const [parties, setParties] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomingRestaurant, setIncomingRestaurant] = useState(null);

  // 🌟 Join Confirmation State
  const [isJoinConfirmOpen, setIsJoinConfirmOpen] = useState(false);
  const [partyToJoin, setPartyToJoin] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  // 🌟 To Top Button State
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleScroll = useCallback((e) => {
    if (e.target.scrollTop > 200) {
      setShowBackToTop(true);
    } else {
      setShowBackToTop(false);
    }
  }, []);

  const scrollToTop = () => {
    const container = document.getElementById("scroll-container");
    container?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🌟 Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const categories = [
    "ทั้งหมด",
    "Shabu",
    "Cafe",
    "Japanese",
    "BBQ",
    "Thai",
    "Western",
    "Izakaya",
    "Dessert",
    "Street Food",
    "Fine Dining",
  ];

  // 🌟 Dynamic Error Modal State
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // 🌟 รวมปาร์ตี้ที่เราเป็น Leader และที่เรา Join อยู่จาก UserStore
  const myJoinedGroups = React.useMemo(() => {
    if (!isLogin || !user) return [];
    const led = user.partiesLed || [];
    const joined = (user.joinedParties || [])
      .map((jp) => jp.party)
      .filter((p) => !!p);

    // 🎯 กรองเอาเฉพาะกลุ่มที่ยังไม่จบ (OPEN, FULL หรือ PENDING_SETTLEMENT)
    const combined = [...led, ...joined].filter(
      (p) => p.status !== "COMPLETED" && p.status !== "CANCELLED",
    );

    const unique = combined.reduce((acc, curr) => {
      if (!acc.find((p) => p.id === curr.id)) acc.push(curr);
      return acc;
    }, []);
    return unique;
  }, [user, isLogin]);

  // 🌟 Filtered Parties Logic
  const filteredDiscovery = React.useMemo(() => {
    return parties
      .filter((p) => p.status === "OPEN" || p.status === "FULL") // กรองเอาเฉพาะกลุ่มที่เปิดรับคนอยู่จริงๆ
      .filter((p) => !myJoinedGroups.some((myP) => myP.id === p.id))
      .filter((p) => {
        const matchesSearch =
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.restaurant?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "ทั้งหมด" ||
          p.restaurant?.category === selectedCategory;

        return matchesSearch && matchesCategory;
      });
  }, [parties, myJoinedGroups, searchQuery, selectedCategory]);

  // 🌟 ปาร์ตี้ที่รอการปิดกลุ่ม (Leader Action Needed)
  const pendingSettlementParties = React.useMemo(() => {
    return myJoinedGroups.filter(
      (p) => p.status === "PENDING_SETTLEMENT" && p.leaderId === user?.id,
    );
  }, [myJoinedGroups, user?.id]);

  // 🌟 Auto open modal if navigated from Profile with state
  useEffect(() => {
    if (location.state?.openCreateModal) {
      // 🌟 2. เซฟข้อมูลร้านลง State ของเราก่อน!
      if (location.state?.restaurantData) {
        setIncomingRestaurant(location.state.restaurantData);
      }

      setIsModalOpen(true);
      // พอเซฟเสร็จ ค่อยปล่อยให้มันล้าง state ตามที่เพื่อนเขียนไว้
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {
        setLoading(false);
        loadData();
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [partiesRes] = await Promise.all([
        apiGetParties(),
        isLogin ? fetchMe() : Promise.resolve(),
      ]);

      const partiesList = partiesRes.data.data || [];

      const processedParties = partiesList
        .map((p) => ({
          ...p,
          dist: userLoc
            ? calculateDistance(
              userLoc.lat,
              userLoc.lng,
              p.restaurant?.lat,
              p.restaurant?.lng,
            )
            : null,
        }))
        .sort((a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity));

      setParties(processedParties);
    } catch (err) {
      console.error("Sync failed", err);
      toast.error("ซิงค์ข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [isLogin, userLoc, fetchMe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoin = (party) => {
    if (!isLogin) return toast.warning("กรุณาล็อกอินก่อนเข้าร่วม");
    setPartyToJoin(party);
    setIsJoinConfirmOpen(true);
  };

  const executeJoin = async () => {
    if (!partyToJoin) return;
    try {
      setIsJoining(true);
      await apiJoinParty(partyToJoin.id);
      toast.success("เข้าร่วมปาร์ตี้สำเร็จ!");
      setIsJoinConfirmOpen(false);
      setPartyToJoin(null);
      await loadData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message;

      if (errorMsg === "คุณกำลังอยู่ในปาร์ตี้ของร้านนี้ที่ยังไม่จบ") {
        setErrorModal({
          isOpen: true,
          title: "คุณมีตี้ที่นี่อยู่แล้ว! 🥘",
          message:
            "ดูเหมือนคุณจะมีปาร์ตี้ที่ร้านนี้ที่ยังไม่จบนะครับ ลองไปจัดการบิลของเดิมให้เสร็จก่อนนะ!",
        });
      } else if (errorMsg === "คุณมี party ที่มีระยะเวลาใกล้กันอยู่") {
        setErrorModal({
          isOpen: true,
          title: "เวลาทับซ้อนกัน! ⏰",
          message:
            "คุณมีนัดปาร์ตี้อื่นในช่วงเวลาใกล้เคียงกันอยู่แล้ว (ห่างกันไม่เกิน 1 ชม.) ลองเช็คตารางเวลาอีกครั้งนะครับ",
        });
      } else if (errorMsg === "Party is not open for joining") {
        setErrorModal({
          isOpen: true,
          title: "ปาร์ตี้นี้อาจเต็มหรือปิดรับแล้ว! 🚫",
          message: "ปาร์ตี้นี้อาจเต็มหรือปิดรับแล้ว ลองหากลุ่มอื่นดูนะครับ",
        });
      } else {
        toast.error(errorMsg || "Join failed");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async (partyId) => {
    try {
      await apiLeaveParty(partyId);
      toast.success("ออกจากปาร์ตี้แล้ว");
      await loadData();
    } catch (err) {
      toast.error("Leave failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FDF2ED] dark:bg-black overflow-hidden flex flex-col font-sans">
      {/* 1. MAIN SCROLL CONTAINER */}
      <div
        id="scroll-container"
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 pb-48 no-scrollbar scroll-smooth"
      >
        <div className="flex flex-col gap-2 max-w-md mx-auto pt-4">
          
          {/* 🌟 SECTION: ACTION REQUIRED (Leaders only) */}
          {pendingSettlementParties.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 mb-2">
              <h2 className="px-2 text-[10px] font-black tracking-[0.2em] text-orange-600 uppercase">
                Action Required ⚠️
              </h2>
              <div className="flex flex-col gap-2">
                {pendingSettlementParties.map(p => (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={`pending-${p.id}`}
                    onClick={() => navigate(`/party/${p.id}/split-bill`)}
                    className="bg-orange-50 border border-orange-200 p-4 rounded-3xl flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-200">
                      <Clock size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-orange-200 text-orange-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Settlement Required</span>
                      </div>
                      <h4 className="text-sm font-black text-orange-900 truncate">{p.name || "มื้ออาหารที่ผ่านมา"}</h4>
                      <p className="text-[10px] font-bold text-orange-700/60 uppercase">กดเพื่อสรุปยอดและรีวิวร้านอาหาร</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 📸 SECTION: YOUR CURRENT GROUPS (IG Stories Style) */}
          {myJoinedGroups.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 mb-4">
              <h2 className="px-2 text-[10px] font-black tracking-[0.2em] text-[#BC6C25] uppercase opacity-70">
                Your Current Groups
              </h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
                {myJoinedGroups.map((party) => {
                  const restaurant = party.restaurant || {};
                  const imageUrl =
                    restaurant.images?.find((img) => img.isCover)?.url ||
                    restaurant.images?.[0]?.url ||
                    "https://picsum.photos/seed/restaurant/400/300";

                  const unreadCount = unreadCounts[party.id] || 0;

                  return (
                    <div
                      key={`story-${party.id}`}
                      onClick={() => navigate(`/party/${party.id}/split-bill`)}
                      className="flex-none flex flex-col items-center gap-1.5 w-20 cursor-pointer active:scale-95 transition-transform relative"
                    >
                      {/* Unread Badge */}
                      {unreadCount > 0 && (
                        <div className="absolute top-0 right-1 z-10 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#FDF2ED] animate-bounce shadow-md">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </div>
                      )}

                      <div className={`relative p-[2.5px] rounded-full shadow-sm ${unreadCount > 0 ? "bg-red-500 animate-pulse" : "bg-gradient-to-tr from-[#BC6C25] via-[#F7EAD7] to-[#A65D2E]"}`}>
                        <div className="w-[60px] h-[60px] rounded-full border-2 border-[#FDF2ED] overflow-hidden bg-white">
                          <img
                            src={imageUrl}
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {party.leaderId === user?.id && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 p-1 rounded-full shadow-sm border-2 border-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-2.5 h-2.5 text-white"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-[#182806] px-1.5 py-0.5 rounded-full shadow-sm border-2 border-white flex items-center gap-0.5">
                          <Users
                            size={8}
                            className="text-[#F7EAD7] fill-current"
                          />
                          <span className="text-[7px] font-black text-white leading-none">
                            {party.members?.length || 0}/{party.maxParticipants}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#2B361B] dark:text-white truncate w-full text-center leading-tight">
                        {party.name?.split(" ")[0] || "Party"}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="h-px bg-[#BC6C25]/10 w-full mt-1" />
            </div>
          )}

          {/* SECTION: DISCOVER HEADER (Sticky) */}
          <header className="sticky top-0 z-40 bg-[#FDF2ED]/90 dark:bg-black/90 backdrop-blur-xl -mx-4 px-6 py-4 text-left border-b border-[#BC6C25]/5 mb-2">
            <h1 className="text-2xl font-black tracking-[0.2em] text-[#2B361B] dark:text-white uppercase mb-4">
              Discover Nearby
            </h1>

            {/* SEARCH & FILTER SECTION */}
            <div className="flex flex-col gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#BC6C25]">
                  <Search size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อกลุ่ม หรือชื่อร้าน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-[#BC6C25]/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-[#2B361B] dark:text-white placeholder:text-[#BC6C25]/40 focus:outline-none focus:ring-2 focus:ring-[#BC6C25]/20 transition-all shadow-sm"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-none px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${selectedCategory === cat
                      ? "bg-[#182806] text-white border-[#182806] shadow-md"
                      : "bg-white/50 dark:bg-zinc-900/50 text-[#BC6C25] border-[#BC6C25]/10 hover:bg-white dark:hover:bg-zinc-800"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* SECTION: NEARBY LIST */}
          <div key="discovery-list" className="flex flex-col gap-6 mt-2">
            {loading && parties.length === 0 ? (
              <div className="text-center py-20 opacity-20 font-black uppercase text-[10px]">
                Searching...
              </div>
            ) : (
              filteredDiscovery.map((p) => (
                <PartyCard
                  key={`discover-${p.id}`}
                  party={p}
                  onJoin={() => handleJoin(p)}
                  isJoined={false}
                />
              ))
            )}

            {!loading && filteredDiscovery.length === 0 && (
              <div className="text-center py-20 opacity-40">
                <Search className="w-10 h-10 mx-auto text-[#BC6C25] mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-loose">
                  ไม่พบปาร์ตี้ที่ตรงกับเงื่อนไข
                  <br />
                  ลองค้นหาด้วยคำอื่นดูนะ!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FLOATING UI LAYER */}
      <div className="absolute inset-0 pointer-events-none">
        {/* To the Top Button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              onClick={scrollToTop}
              className="absolute bottom-52 right-6 w-12 h-12 bg-white border border-[#EEE2D1] text-[#182806] rounded-full shadow-xl z-100 flex items-center justify-center active:scale-90 transition-transform pointer-events-auto"
            >
              <ArrowUp size={20} strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>

        <button
          className="absolute bottom-28 right-6 w-20 h-20 bg-[#BC6C25] text-[#F7EAD7] rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-[#FDF2ED] dark:border-zinc-900 z-50 active:scale-90 transition-all pointer-events-auto"
          onClick={() => setIsModalOpen(true)}
        >
          <UserPlus className="w-6 h-6 mb-1" />
          <span className="text-[8px] font-black uppercase">Create</span>
        </button>

        <NavBar />
      </div>

      <CreatePartyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIncomingRestaurant(null); // 🌟 เคลียร์ค่าทิ้งด้วยตอนปิด Modal จะได้ไม่ค้าง
        }}
        onSuccess={loadData}
        initialRestaurant={incomingRestaurant} // 🌟 3. ส่งข้อมูลร้านที่เราล็อคไว้ให้ Modal
      />

      {/* 🌟 Join Confirmation Modal */}
      <AnimatePresence>
        {isJoinConfirmOpen && partyToJoin && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isJoining && setIsJoinConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#EEE2D1]"
            >
              {/* Header Image/Banner */}
              <div className="relative h-40 bg-zinc-800">
                {/* 🌟 Background Image with fallback */}
                <img
                  src={
                    partyToJoin.restaurant?.images?.find(img => img.isCover)?.url ||
                    partyToJoin.restaurant?.images?.[0]?.url ||
                    "https://picsum.photos/seed/restaurant/800/400"
                  }
                  alt={partyToJoin.restaurant?.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                <button
                  onClick={() => setIsJoinConfirmOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"
                >
                  <CloseIcon size={20} />
                </button>
                
                <div className="absolute bottom-5 left-6 right-6">
                  <span className="bg-[#A65D2E] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest mb-2 inline-block shadow-sm">
                    {partyToJoin.restaurant?.category || "Restaurant"}
                  </span>
                  <h3 className="text-white font-black text-2xl truncate leading-tight drop-shadow-md">
                    {partyToJoin.restaurant?.name || "ร้านอาหาร"}
                  </h3>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                    {partyToJoin.name}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#8B837E] uppercase">เวลานัดหมาย</p>
                      <p className="text-sm font-bold text-[#2B361B]">
                        {new Date(partyToJoin.meetupTime).toLocaleString('th-TH', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-[#8B837E] uppercase">สมาชิกปัจจุบัน</p>
                        <p className="text-sm font-bold text-[#2B361B]">
                          {partyToJoin.members?.length || 0} / {partyToJoin.maxParticipants} คน
                        </p>
                      </div>
                      <div className="flex -space-x-2 overflow-hidden">
                        {partyToJoin.members?.slice(0, 5).map((member, idx) => (
                          <div
                            key={member.id}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200"
                          >
                            <img
                              className="h-full w-full object-cover"
                              src={member.user?.avatarUrl || `https://i.pravatar.cc/150?u=${member.userId}`}
                              alt={member.user?.name}
                            />
                          </div>
                        ))}
                        {(partyToJoin.members?.length || 0) > 5 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-[#F7EAD7] text-[#A65D2E] text-[10px] font-bold">
                            +{(partyToJoin.members?.length || 0) - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {partyToJoin.details && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                        <AlertCircle size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#8B837E] uppercase">หมายเหตุจากหัวหน้า</p>
                        <p className="text-xs text-[#5C5552] leading-relaxed italic">
                          "{partyToJoin.details}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={executeJoin}
                    disabled={isJoining}
                    className="w-full py-4 rounded-2xl font-black text-sm bg-[#182806] text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {isJoining ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <CheckCircle2 size={18} />
                    )}
                    ยืนยันเข้าร่วมปาร์ตี้
                  </button>
                  <button
                    onClick={() => setIsJoinConfirmOpen(false)}
                    disabled={isJoining}
                    className="w-full py-3 text-xs font-bold text-[#8B837E] hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    เปลี่ยนใจแล้ว
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌟 Dynamic Error Warning Modal */}
      <AnimatePresence>
        {errorModal.isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border border-[#EEE2D1]"
            >
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500">
                <AlertCircle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-[#2B361B] mb-2 tracking-tight">
                {errorModal.title}
              </h3>
              <p className="text-sm text-[#8B837E] mb-8 leading-relaxed px-2">
                {errorModal.message}
              </p>
              <button
                onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                className="w-full py-4 rounded-2xl font-black text-sm bg-[#182806] text-white shadow-lg active:scale-[0.98] transition-all"
              >
                เข้าใจแล้ว
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Party;

import React, { useEffect, useState, useCallback } from "react";
import NavBar from "../components/NavBar";
import PartyCard from "../components/PartyCard";
import { UserPlus, Search, Users, AlertCircle, ArrowUp, MapPin, Clock, CheckCircle2, X as CloseIcon, Receipt } from "lucide-react";
import { toast } from "sonner";
import { apiGetParties, apiJoinParty } from "../api/party";
import useUserStore from "../stores/userStore";
import useChatStore from "../stores/chatStore";
import calculateDistance from "../utils/distance.ustils";
import CreatePartyModal from "../components/Modals/CreatePartyModal";
import CreateQuickBillModal from "../components/Modals/CreateQuickBillModal";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router";
import PendingSettlement from "../components/party/PendingSettlement";
import MyJoinedGroups from "../components/party/MyJoinedGroups";
import ScrollToTop from "../components/ScrollToTop";
import ErrorModal from "../components/party/ErrorModal";
import SearchBarParty from "../components/party/SearchBarParty";
import PartyDetailModal from "../components/party/PartyDetailModal";

const Party = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLogin, fetchMe } = useUserStore();
  const unreadCounts = useChatStore((state) => state.unreadCounts);
  const [parties, setParties] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickBillModalOpen, setIsQuickBillModalOpen] = useState(false);
  const [incomingRestaurant, setIncomingRestaurant] = useState(null);

  // Join Confirmation State
  const [isJoinConfirmOpen, setIsJoinConfirmOpen] = useState(false);
  const [partyToJoin, setPartyToJoin] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  //  To Top Button State
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

  // Search & Filter States
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

  //  Dynamic Error Modal State
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  //  รวมปาร์ตี้ที่เราเป็น Leader และที่เรา Join อยู่จาก UserStore
  const myJoinedGroups = React.useMemo(() => {
    if (!isLogin || !user) return [];
    const led = user.partiesLed || [];
    const joined = (user.joinedParties || [])
      .map((jp) => jp.party)
      .filter((p) => !!p);

    // กรองเอาเฉพาะกลุ่มที่ยังไม่จบ (OPEN, FULL หรือ PENDING_SETTLEMENT)
    const combined = [...led, ...joined].filter(
      (p) => p.status !== "COMPLETED" && p.status !== "CANCELLED",
    );

    const unique = combined.reduce((acc, curr) => {
      if (!acc.find((p) => p.id === curr.id)) acc.push(curr);
      return acc;
    }, []);
    return unique;
  }, [user, isLogin]);

  //  Filtered Parties Logic
  const filteredDiscovery = React.useMemo(() => {
    return parties
      .filter((p) => p.status === "OPEN" || p.status === "FULL")
      .filter((p) => p.restaurantId !== null && p.restaurantId !== undefined) // ซ่อนบิลด่วนจากหน้าค้นหา
      .filter((p) => !myJoinedGroups.some((myP) => myP.id === p.id))
      .filter((p) => {
        const matchesSearch =
          !searchQuery ||
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.restaurant?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "ทั้งหมด" ||
          p.restaurant?.category === selectedCategory;

        return matchesSearch && matchesCategory;
      });
  }, [parties, myJoinedGroups, searchQuery, selectedCategory]);

  // ปาร์ตี้ที่รอการปิดกลุ่ม (Leader Action Needed)
  const pendingSettlementParties = React.useMemo(() => {
    return myJoinedGroups.filter(
      (p) => p.status === "PENDING_SETTLEMENT" && p.leaderId === user?.id,
    );
  }, [myJoinedGroups, user?.id]);

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
    if (location.state?.openCreateModal) {
      if (location.state?.restaurantData) {
        setIncomingRestaurant(location.state.restaurantData);
      }
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => {
        setLoading(false);
        loadData();
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

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
          message: "ดูเหมือนคุณจะมีปาร์ตี้ที่ร้านนี้ที่ยังไม่จบนะครับ ลองไปจัดการบิลของเดิมให้เสร็จก่อนนะ!",
        });
      } else if (errorMsg === "คุณมี party ที่มีระยะเวลาใกล้กันอยู่") {
        setErrorModal({
          isOpen: true,
          title: "เวลาทับซ้อนกัน! ⏰",
          message: "คุณมีนัดปาร์ตี้อื่นในช่วงเวลาใกล้เคียงกันอยู่แล้ว (ห่างกันไม่เกิน 1 ชม.) ลองเช็คตารางเวลาอีกครั้งนะครับ",
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

  return (
    <div className="fixed inset-0 bg-base-100 overflow-hidden flex flex-col font-sans">
      {/* 1. MAIN SCROLL CONTAINER */}

      <div
        id="scroll-container"
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 pb-48 no-scrollbar scroll-smooth"
      >
        <div className="flex flex-col gap-2 max-w-md mx-auto pt-4">

          <PendingSettlement user={user} pendingSettlementParties={pendingSettlementParties} />

          <MyJoinedGroups user={user} myJoinedGroups={myJoinedGroups} unreadCounts={unreadCounts} />

          <header className="sticky top-0 z-40 bg-base-100 rounded-2xl backdrop-blur-xl -mx-4 px-6 py-4 text-left border-b border-base-content/5 mb-2">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-black tracking-tight text-base-content uppercase">Discover</h1>
              {!userLoc && !loading && (
                <div className="flex items-center gap-1.5 bg-warning/10 text-warning px-3 py-1 rounded-full animate-pulse">
                  <AlertCircle size={12} strokeWidth={3} /><span className="text-[8px] font-black uppercase">Enable Location</span>
                </div>)}
            </div>

            {/* Search Bar */}
            <div className="flex flex-col gap-4">
              <SearchBarParty searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} categories={categories} />
            </div>

          </header>

          {/* Discovery List */}
          <div key="discovery-list" className="flex flex-col gap-6 mt-2">
            {loading && parties.length === 0 ?
              (<div className="text-center py-20 opacity-20 font-black uppercase text-[10px]">
                Searching...
              </div>)
              : (filteredDiscovery.map((p) => (
                <PartyCard key={`discover-${p.id}`} party={p} onJoin={() => handleJoin(p)} isJoined={false} />
              )))}
            {!loading && filteredDiscovery.length === 0 && (
              <div className="text-center py-20 opacity-40">
                <Search className="w-10 h-10 mx-auto text-primary mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-loose">ไม่พบปาร์ตี้ที่ตรงกับเงื่อนไข<br />ลองค้นหาด้วยคำอื่นดูนะ!</p>
              </div>)}
          </div>

        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <ScrollToTop showBackToTop={showBackToTop} scrollToTop={scrollToTop} />

        {/* Quick Create */}
        <div className="absolute bottom-28 right-6 flex flex-col items-center gap-4 pointer-events-auto z-[100]">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-14 h-14 bg-base-200 text-primary rounded-full shadow-lg flex flex-col items-center justify-center border-2 border-primary/10 active:bg-primary/5 transition-colors"
            onClick={() => setIsQuickBillModalOpen(true)}>
            <Receipt className="w-6 h-6" />
            <span className="text-[7px] font-black uppercase tracking-tighter">Quick</span>
          </motion.button>

          {/* Create Party */}
          <button className="w-20 h-20 bg-primary text-white rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-base-100 active:scale-90 transition-all"
            onClick={() => setIsModalOpen(true)}>
            <UserPlus className="w-6 h-6 mb-1" />
            <span className="text-[8px] font-black uppercase">Create</span>
          </button>
        </div>
      </div>

      <CreatePartyModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIncomingRestaurant(null); }} onSuccess={loadData} initialRestaurant={incomingRestaurant} />
      <CreateQuickBillModal isOpen={isQuickBillModalOpen} onClose={() => setIsQuickBillModalOpen(false)} onSuccess={loadData} />

      <AnimatePresence>
        {isJoinConfirmOpen && partyToJoin && (
          <PartyDetailModal isJoinConfirmOpen={isJoinConfirmOpen} setIsJoinConfirmOpen={setIsJoinConfirmOpen} partyToJoin={partyToJoin} isJoining={isJoining} executeJoin={executeJoin} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorModal.isOpen && (
          <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Party;

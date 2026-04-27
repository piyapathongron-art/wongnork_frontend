import React, { useState, useEffect } from "react";
import { Users, AlertCircle, CheckCircle2, X as CloseIcon } from "lucide-react";
import { toast } from "sonner";
import { apiGetParties, apiJoinParty } from "../../api/party";
import PartyCard from "../PartyCard";
import useUserStore from "../../stores/userStore";
import { motion, AnimatePresence } from "framer-motion";

const RestaurantPartySection = ({ restaurantId }) => {
  const { isLogin, fetchMe, user } = useUserStore();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Join logic states
  const [isJoinConfirmOpen, setIsJoinConfirmOpen] = useState(false);
  const [partyToJoin, setPartyToJoin] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const res = await apiGetParties();
      const allParties = res.data?.data || [];
      
      // console.log("Filtering parties for restaurant:", restaurantId);
      // console.log("All parties:", allParties);

      // Filter by restaurantId and status
      // Use loose equality (==) or String conversion to prevent type mismatch issues
      const restaurantParties = allParties.filter(
        (p) =>
          String(p.restaurantId) === String(restaurantId) &&
          (p.status === "OPEN" || p.status === "FULL"),
      );
      
      // console.log("Filtered restaurant parties:", restaurantParties);
      setParties(restaurantParties);
    } catch (error) {
      console.error("Error fetching restaurant parties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchParties();
    }
  }, [restaurantId]);

  const handleJoin = (party) => {
    if (!isLogin) return toast.warning("กรุณาล็อกอินก่อนเข้าร่วม");

    // Check if already joined
    const isJoined =
      user?.joinedParties?.some((jp) => String(jp.partyId) === String(party.id)) ||
      user?.partiesLed?.some((p) => String(p.id) === String(party.id));

    if (isJoined) {
      toast.info("คุณอยู่ในปาร์ตี้นี้อยู่แล้ว");
      return;
    }

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
      await fetchMe(); // Refresh user data to show joined status
      await fetchParties(); // Refresh local parties
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message;
      toast.error(errorMsg || "เข้าร่วมปาร์ตี้ไม่สำเร็จ");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-10 px-1">
        <div className="h-4 w-32 bg-base-300 rounded animate-pulse mb-4" />
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          <div className="min-w-[320px] h-40 bg-base-200 rounded-[32px] animate-pulse" />
          <div className="min-w-[320px] h-40 bg-base-200 rounded-[32px] animate-pulse" />
        </div>
      </div>
    );
  }

  // If there are no parties, show an inviting empty state
  if (parties.length === 0) {
    return (
      <div className="mb-10 px-1">
        <h3 className="text-[11px] font-bold text-base-content/40 uppercase tracking-widest mb-4">
          ปาร์ตี้ที่กำลังเปิดอยู่
        </h3>
        <div className="bg-base-200/30 rounded-[32px] p-10 flex flex-col items-center justify-center text-center border border-dashed border-base-content/10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Users size={24} className="text-base-content/20" />
          </div>
          <p className="text-sm font-bold text-base-content/60 mb-1">ยังไม่มีปาร์ตี้ที่ร้านนี้</p>
          <p className="text-[10px] font-medium text-base-content/40">
            มาเป็นคนแรกที่เริ่มปาร์ตี้และหาเพื่อนร่วมมื้อกัน!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[11px] font-bold text-base-content/40 uppercase tracking-widest">
          ปาร์ตี้ที่กำลังเปิดอยู่ ({parties.length})
        </h3>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
        {parties.map((party) => {
          const isJoined =
            user?.joinedParties?.some((jp) => String(jp.partyId) === String(party.id)) ||
            user?.partiesLed?.some((p) => String(p.id) === String(party.id));
          return (
            <div key={party.id} className="min-w-[320px] max-w-[340px] flex-shrink-0">
              <PartyCard
                party={{ ...party, dist: null }} 
                onJoin={() => handleJoin(party)}
                isJoined={isJoined}
              />
            </div>
          );
        })}
      </div>

      {/* Join Confirmation Modal */}
      <AnimatePresence>
        {isJoinConfirmOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJoinConfirmOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-base-100 rounded-[32px] p-8 w-full max-w-sm shadow-2xl border border-base-content/5"
            >
              <button
                onClick={() => setIsJoinConfirmOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-base-200 rounded-full transition-colors"
              >
                <CloseIcon size={20} className="text-base-content/40" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Users size={40} className="text-primary" />
                </div>

                <h3 className="text-2xl font-black text-base-content mb-2">
                  เข้าร่วมปาร์ตี้?
                </h3>
                <p className="text-sm font-medium text-base-content/50 mb-8 px-4">
                  คุณกำลังจะเข้าร่วมกลุ่ม{" "}
                  <span className="text-primary font-bold">
                    "{partyToJoin?.name}"
                  </span>{" "}
                  เพื่อไปทานอาหารด้วยกัน
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={executeJoin}
                    disabled={isJoining}
                    className="w-full bg-primary text-primary-content py-4 rounded-2xl font-black text-sm uppercase shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {isJoining ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        ยืนยันการเข้าร่วม
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsJoinConfirmOpen(false)}
                    className="w-full bg-base-200 text-base-content/60 py-4 rounded-2xl font-black text-sm uppercase active:scale-[0.98] transition-all"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RestaurantPartySection;

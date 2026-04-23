import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // 🌟 Import createPortal
import {
  MoreVertical,
  LogOut,
  Edit3,
  Trash2,
  X,
  Users,
  Clock,
  Hash,
  Check,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { apiLeaveParty, apiUpdatePartySettings } from "../api/party";
import { useNavigate } from "react-router";

const PartyControlMenu = ({ party, isLeader, isCompleted, onUpdate }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Modal confirmation states
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: party?.name || "",
    maxMembers: party?.maxMembers || 2,
    meetupTime: party?.meetupTime
      ? new Date(party.meetupTime).toISOString().slice(0, 16)
      : "",
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLeave = async () => {
    setIsLoading(true);
    try {
      await apiLeaveParty(party.id);
      toast.success("ออกจากปาร์ตี้เรียบร้อย");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "ไม่สามารถออกจากปาร์ตี้ได้");
    } finally {
      setIsLoading(false);
      setIsLeaveModalOpen(false);
    }
  };

  const handleCancelParty = async () => {
    setIsLoading(true);
    try {
      await apiUpdatePartySettings(party.id, { status: "CANCELLED" });
      toast.warn("ยกเลิกปาร์ตี้เรียบร้อยแล้ว");
      navigate("/");
    } catch (error) {
      toast.error("ไม่สามารถยกเลิกปาร์ตี้ได้");
    } finally {
      setIsLoading(false);
      setIsCancelModalOpen(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    const selectedTime = new Date(editForm.meetupTime);
    if (selectedTime < now)
      return toast.error("ไม่สามารถตั้งเวลานัดหมายย้อนหลังได้");
    if (editForm.maxMembers < party.members.length)
      return toast.error(
        `ไม่สามารถลดจำนวนคนเหลือน้อยกว่า ${party.members.length} คนได้`,
      );

    setIsLoading(true);
    try {
      await apiUpdatePartySettings(party.id, {
        name: editForm.name,
        maxMembers: parseInt(editForm.maxMembers),
        meetupTime: selectedTime.toISOString(),
      });
      toast.success("อัปเดตข้อมูลปาร์ตี้เรียบร้อย");
      setIsEditModalOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("อัปเดตข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 Helper component to render Modal via Portal
  const ModalPortal = ({ children }) => {
    return createPortal(children, document.body);
  };

  const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    desc,
    confirmText,
    type = "danger",
  }) => (
    <AnimatePresence>
      {isOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xs rounded-[2.5rem] p-8 text-center shadow-2xl"
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${type === "danger" ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"}`}
              >
                <AlertTriangle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-[#2B361B] mb-2">
                {title}
              </h3>
              <p className="text-sm text-[#8B837E] mb-8 leading-relaxed">
                {desc}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-black text-sm shadow-md transition-all active:scale-[0.98] ${type === "danger" ? "bg-red-500 text-white hover:bg-red-600" : "bg-orange-500 text-white hover:bg-orange-600"}`}
                >
                  {isLoading ? "กำลังดำเนินการ..." : confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm font-bold text-[#8B837E] hover:bg-gray-100 rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </div>
        </ModalPortal>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 rounded-full hover:bg-[#F7EAD7] transition-colors text-[#2B361B]"
      >
        <MoreVertical size={20} />
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#EEE2D1] overflow-hidden z-50"
          >
            <div className="py-2">
              {isLeader && !isCompleted && (
                <button
                  onClick={() => {
                    setIsEditModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-[#2B361B] hover:bg-[#FFF8F5] transition-colors"
                >
                  <Edit3 size={16} className="text-[#A65D2E]" />{" "}
                  แก้ไขข้อมูลปาร์ตี้
                </button>
              )}
              <button
                onClick={() => {
                  setIsLeaveModalOpen(true);
                  setIsMenuOpen(false);
                }}
                disabled={isCompleted}
                className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-[#2B361B] hover:bg-[#FFF8F5] transition-colors disabled:opacity-50"
              >
                <LogOut size={16} className="text-[#A65D2E]" /> ออกจากปาร์ตี้
              </button>
              {isLeader && !isCompleted && (
                <button
                  onClick={() => {
                    setIsCancelModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} /> ยกเลิกปาร์ตี้
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Modals Rendered via Portal --- */}
      <ConfirmModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleLeave}
        title="ออกจากปาร์ตี้?"
        desc="คุณแน่ใจหรือไม่ที่จะออกจากกลุ่มนี้? หากคุณเป็นหัวหน้า ระบบจะโอนสิทธิ์ให้สมาชิกคนถัดไป"
        confirmText="ใช่, ออกเลย"
        type="orange"
      />
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelParty}
        title="ยกเลิกปาร์ตี้?"
        desc="⚠️ การกระทำนี้จะลบปาร์ตี้นี้ถาวรและเอาสมาชิกทุกคนออก คุณแน่ใจใช่หรือไม่?"
        confirmText="ใช่, ยกเลิกถาวร"
        type="danger"
      />

      <AnimatePresence>
        {isEditModalOpen && (
          <ModalPortal>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6 pointer-events-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-[#FFF8F5] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-[#EEE2D1] overflow-hidden"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-[#2B361B]">
                    แก้ไขปาร์ตี้ ✨
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-[#F7EAD7] rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8B837E] uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Hash size={12} /> ชื่อกลุ่ม
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8B837E] uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Users size={12} /> จำนวนคนรับ (Max)
                    </label>
                    <input
                      type="number"
                      required
                      min={party.members.length}
                      value={editForm.maxMembers}
                      onChange={(e) =>
                        setEditForm({ ...editForm, maxMembers: e.target.value })
                      }
                      className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all text-sm font-bold"
                    />
                    <p className="text-[9px] text-[#A65D2E] font-medium ml-1">
                      * ห้ามน้อยกว่า {party.members.length} คนที่มีอยู่
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8B837E] uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Clock size={12} /> เวลานัดหมาย
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={editForm.meetupTime}
                      onChange={(e) =>
                        setEditForm({ ...editForm, meetupTime: e.target.value })
                      }
                      className="w-full bg-white border border-[#EEE2D1] rounded-xl py-3 px-4 outline-none focus:border-[#A65D2E] transition-all text-sm font-bold"
                    />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-3 text-sm font-bold text-[#8B837E] hover:bg-[#EAD9CF] rounded-xl transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-[#182806] hover:bg-[#2D3E1A] transition-colors text-white py-3 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        "กำลังบันทึก..."
                      ) : (
                        <>
                          <Check size={16} /> บันทึก
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartyControlMenu;

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Trash2 } from "lucide-react"; // 🌟 เปลี่ยนกลับเป็น X
import useUserStore from "../../stores/userStore";
import { apiDeleteMenu } from "../../api/menuApi";
import AddMenuModal from "../Modals/AddMenuModal";
import { toast } from "react-toastify";

const AllMenus = ({
  isOpen,
  onClose,
  menus = [],
  restaurant,
  onMenuUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);

  const user = useUserStore((state) => state.user);

  const loggedInUserId = user?.id || user?.user?.id;
  const userRole = user?.role || user?.user?.role;
  const isRealOwner =
    userRole === "OWNER" &&
    restaurant?.ownerId &&
    String(loggedInUserId) === String(restaurant.ownerId);

  const handleEdit = (menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  const handleDelete = async (menuId) => {
    if (window.confirm("Are you sure to delete?")) {
      try {
        await apiDeleteMenu(restaurant.id, menuId);
        if (onMenuUpdate) await onMenuUpdate();
      } catch (err) {
        console.log("Delete Function err", err);
        toast.error("Cannot Delete");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex justify-end pointer-events-none">
          {/* 🛡️ แผ่นกระจกใสกันผี */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          />

          {/* 🌟 แผ่นเมนู */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full h-full bg-base-100 flex flex-col pointer-events-auto shadow-2xl"
          >
            {/* --- Header --- */}
            <div className="flex items-center justify-between px-6 py-5 bg-base-100 border-b border-base-content/10 shrink-0">
              <h2 className="text-xl font-bold text-base-content">
                เมนูทั้งหมด ({menus.length})
              </h2>
              {/* 🌟 ย้ายปุ่มกลับมาขวา */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 text-base-content bg-base-200/50 rounded-full active:scale-90 transition-transform cursor-pointer"
              >
                <X size={20} className="text-accent" />
              </button>
            </div>

            {/* --- Content --- */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar pb-32">
              {menus.length > 0 ? (
                menus.map((menu, index) => (
                  <div
                    key={index}
                    className="flex gap-4 bg-base-100 p-4 rounded-3xl shadow-sm border border-base-content/10 relative group"
                  >
                    {isRealOwner && (
                      <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <button
                          onClick={() => handleEdit(menu)}
                          className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-full shadow-md transition-all"
                          title="แก้ไขเมนู"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(menu.id)}
                          className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-full shadow-md transition-all"
                          title="ลบเมนู"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    {/* รูปเมนู */}
                    <img
                      src={
                        menu.imageUrl ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop"
                      }
                      alt={menu.name}
                      className="w-24 h-24 object-cover rounded-2xl bg-base-300 shrink-0"
                    />
                    <div className="flex flex-col justify-between flex-1 py-1">
                      <div>
                        <h4 className="text-[15px] font-bold text-base-content leading-tight">
                          {menu.name || "ชื่อเมนู"}
                        </h4>
                        <p className="text-[12px] text-base-content/40 mt-1 line-clamp-2 leading-relaxed">
                          {menu.description || "ไม่มีคำอธิบายสำหรับเมนูนี้"}
                        </p>
                      </div>
                      <div className="text-[15px] font-bold text-accent mt-2">
                        ฿{menu.price || "0"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-base-content/40 font-medium">
                  ยังไม่มีเมนู
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      <AddMenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restaurantId={restaurant?.id}
        editData={selectedMenu}
        onSuccess={onMenuUpdate}
      />
    </AnimatePresence>
  );
};

export default AllMenus;

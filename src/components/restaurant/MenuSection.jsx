import React, { useState } from "react";
import AddMenuModal from "../Modals/AddMenuModal";
import useUserStore from "../../stores/userStore";
import { string } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { apiDeleteMenu } from "../../api/menuApi";
import { toast } from "sonner";
// import useRestaurantStore from "../../stores/restaurantStore";

const MenuSection = ({ menuItems, onViewAllClick, restaurant, onMenuUpdate }) => {
  // 🌟 จัดเรียงให้ Recommend ขึ้นหน้าสุดเสมอ (ลอจิกทำฝั่ง Front-end สบายใจกว่าไปแก้ดึงจาก Back)
  const sortedMenu = [...menuItems].sort((a, b) => {
    if (a.category === "Recommend" && b.category !== "Recommend") return -1;
    if (a.category !== "Recommend" && b.category === "Recommend") return 1;
    return 0;
  });
  const user = useUserStore((state) => state.user)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(null)
  console.log("Debug Restaurant:", restaurant);
  console.log("Debug User:", user);

  // เช็คว่าเป็นเจ้าของร้านนั้นไหม
  const loggedInUserId = user?.id || user?.user?.id
  const userRole = user?.role || user?.user?.role
  const isRealOwner = userRole === "OWNER" && restaurant?.ownerId && String(loggedInUserId) === String(restaurant.ownerId)

  const handleAddClick = () => {
    setSelectedMenu(null)
    setIsModalOpen(true)
  }
  const handleEditClick = (menu) => {
    setSelectedMenu(menu)
    setIsModalOpen(true)
  }
  const handleDelete = async (menuId) => {
    if (window.confirm("Are you sure to delete?")) {
      try {
        await apiDeleteMenu(restaurant.id, menuId)
        onMenuUpdate()
      } catch (err) {
        console.log("Delete Function err", err)
        toast.error("Cannot Delete")
      }
    }
  }
  return (
    <section className="mb-8">
      <div className="flex justify-between items-end mb-4 px-6">
        <div className="flex items-center">
          <h3 className="text-xl font-bold text-base-content">เมนู</h3>
        </div>
        <div className="flex items-center">
          {isRealOwner && (
            <button onClick={handleAddClick}
              className="text-[13px] font-bold text-accent hover:underline cursor-pointer transition-all mr-2">
              เพิ่มเมนูของคุณ
            </button>
          )}
          {sortedMenu.length > 0 && (
            <button
              onClick={onViewAllClick}
              className="text-[13px] font-bold text-accent hover:underline cursor-pointer"
            >
              ดูเมนูทั้งหมด
            </button>
          )}
        </div>
      </div>

      {sortedMenu.length > 0 ? (
        <div className="flex overflow-x-auto gap-4 px-6 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {sortedMenu.map((menu, index) => (
            <div
              key={menu.id || index}
              className="shrink-0 w-[240px] snap-center rounded-[2rem] overflow-hidden bg-base-200 p-4 flex flex-col shadow-sm border border-base-300 relative group shrink-0" 
            >
              {isRealOwner && (
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <button onClick={() => handleEditClick(menu)}
                    className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-full shadow-md transition-all"
                    title="แก้ไขเมนู">
                      <Pencil size={14}/>
                  </button>
                  <button onClick={() => handleDelete(menu.id)}
                    className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-full shadow-md transition-all"
                    title="ลบเมนู">
                      <Trash2 size={14}/>
                  </button>
                </div>
              )}
              <img
                src={
                  menu.imageUrl ||
                  `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop`
                }
                className="w-full h-36 object-cover rounded-[1.5rem] mb-4 shadow-sm bg-white/30"
                alt={menu.name}
              />
              <div className="flex flex-col flex-grow">
                <h4 className="font-bold text-[17px] mb-1.5 text-base-content leading-tight line-clamp-1">
                  {menu.name}
                </h4>
                <p className="text-[13px] mb-4 line-clamp-2 text-base-content/50 leading-relaxed">
                  {menu.description || "เมนูแสนอร่อยจากทางร้าน"}
                </p>
                <div className="mt-auto flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent/60 bg-white/40 px-2 py-1 rounded-lg">
                    {menu.category === "Recommend" ? "แนะนำ" : "ทั่วไป"}
                  </span>
                  <p className="font-black text-lg text-accent">
                    ฿
                    {menu.price ? Math.round(menu.price).toLocaleString() : "0"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6">
          <div className="bg-base-200/50 p-6 rounded-[2rem] text-center">
            <p className="text-base-content/50 font-medium">ยังไม่มีข้อมูลเมนู</p>
          </div>
        </div>
      )}
      <AddMenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restaurantId={restaurant?.id}
        editData={selectedMenu}
        onSuccess={onMenuUpdate} />
    </section>
  );
};

export default MenuSection;

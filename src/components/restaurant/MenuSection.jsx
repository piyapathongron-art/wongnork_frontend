import React, { useState } from "react";
import AddMenuModal from "../Modals/AddMenuModal";
import useUserStore from "../../stores/userStore";
import { string } from "zod";
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
  console.log("Debug Restaurant:", restaurant);
  console.log("Debug User:", user);
  
  // เช็คว่าเป็นเจ้าของร้านนั้นไหม
  const loggedInUserId = user?.id || user?.user?.id
  const userRole = user?.role || user?.user?.role
  const isRealOwner = userRole === "OWNER" && restaurant?.ownerId && String(loggedInUserId) === String(restaurant.ownerId)
  return (
    <section className="mb-8">
      <div className="flex justify-between items-end mb-4 px-6">
        <div className="flex items-center">
          <h3 className="text-xl font-bold text-[#2C241E]">เมนู</h3>
        </div>
        <div className="flex items-center">
          {isRealOwner && (
            <button onClick={() => setIsModalOpen(true)}
            className="text-[13px] font-bold text-[#A67045] hover:underline cursor-pointer transition-all mr-2">
              เพิ่มเมนูของคุณ
            </button>
          )}
          {sortedMenu.length > 0 && (
            <button
              onClick={onViewAllClick}
              className="text-[13px] font-bold text-[#A67045] hover:underline cursor-pointer"
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
              className="shrink-0 w-[240px] snap-center rounded-[2rem] overflow-hidden bg-[#F4E8DB] p-4 flex flex-col shadow-sm border border-[#EAD9CF]"
            >
              <img
                src={
                  menu.imageUrl ||
                  `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop`
                }
                className="w-full h-36 object-cover rounded-[1.5rem] mb-4 shadow-sm bg-white/30"
                alt={menu.name}
              />
              <div className="flex flex-col flex-grow">
                <h4 className="font-bold text-[17px] mb-1.5 text-[#2C241E] leading-tight line-clamp-1">
                  {menu.name}
                </h4>
                <p className="text-[13px] mb-4 line-clamp-2 text-[#7A6A5E] leading-relaxed">
                  {menu.description || "เมนูแสนอร่อยจากทางร้าน"}
                </p>
                <div className="mt-auto flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A67045]/60 bg-white/40 px-2 py-1 rounded-lg">
                    {menu.category === "Recommend" ? "แนะนำ" : "ทั่วไป"}
                  </span>
                  <p className="font-black text-lg text-[#A67045]">
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
          <div className="bg-[#F4E8DB]/50 p-6 rounded-[2rem] text-center">
            <p className="text-[#7A6A5E] font-medium">ยังไม่มีข้อมูลเมนู</p>
          </div>
        </div>
      )}
      <AddMenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restaurantId={restaurant?.id}
        onSuccess={onMenuUpdate} />
    </section>
  );
};

export default MenuSection;

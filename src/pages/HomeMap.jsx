import React, { useState } from "react";
import RestaurantDetailSheet from "../components/restaurant/RestaurantDetailSheet";

const HomeMap = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);

  // ฟังก์ชันนี้แหละที่ในอนาคตจะส่งไปให้เพื่อนใช้ในหน้า Map
  const handleMarkerClick = () => {
    setSelectedRes({
      name: "Cuisine Unplugged",
      rating: "4.5",
      address: "8/2 Rang Nam Alley, Phaya Thai, Bangkok",
    });
    setIsSheetOpen(true);
  };

  return (
    <div className="relative w-full h-screen bg-gray-100 overflow-hidden">
      {/* ส่วนของเพื่อน (Map) - ตอนนี้ทำเป็นกล่องเทาๆ รอไว้ก่อน */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-300">
        <div className="text-center">
          <p className="text-gray-600 font-bold mb-4 italic">
            [ พื้นที่แผนที่ของเพื่อนจะอยู่ตรงนี้ ]
          </p>
          <button
            onClick={handleMarkerClick}
            className="bg-[#A65D2E] text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-transform"
          >
            จำลองการกดหมุดบนแผนที่
          </button>
        </div>
      </div>

      {/* ของเรา (Slide-up Panel) */}
      <RestaurantDetailSheet
        isOpen={isSheetOpen}
        restaurant={selectedRes}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
};

export default HomeMap;

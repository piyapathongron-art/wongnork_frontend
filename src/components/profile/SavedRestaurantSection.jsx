import React from 'react';
import { useNavigate } from 'react-router';
import { Bookmark } from 'lucide-react';

// 🌟 สังเกตตรงปีกกา ({...}): นี่คือ "Props" ที่รอรับของจากไฟล์หลัก
const SavedRestaurantSection = ({ savedRestaurants, handleToggleSave, formatDate }) => {
    const navigate = useNavigate(); // ดึงมาใช้ในไฟล์ลูกได้เลย

    return (
        <section className="space-y-4">
            <h3 className="font-extrabold text-xl text-base-content">Saved Restaurants</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {savedRestaurants.length === 0 ? (
                    <p className="text-sm text-base-content/50 py-2">ยังไม่มีร้านที่บันทึกไว้</p>
                ) : (
                    savedRestaurants.map((saved, index) => {
                        const restaurant = saved.restaurant || {};
                        const imageUrl = restaurant.images?.find((img) => img.isCover)?.url ||
                            restaurant.images?.[0]?.url ||
                            'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=80';

                        return (

                            <div key={saved.id || index} className="flex-none w-64 bg-base-100 rounded-3xl overflow-hidden shadow-sm border border-base-content/10" onClick={() => navigate(`/restaurants/${restaurant.id}`)}>
                                <div className="w-full h-32 bg-base-300">
                                    <img alt={restaurant.name} className="w-full h-full object-cover" src={imageUrl} />
                                </div>
                                <div className="p-4 flex justify-between items-start">
                                    <div className="truncate pr-2">
                                        <h4 className="font-bold text-sm text-base-content truncate">{restaurant.name || 'ไม่ทราบชื่อร้าน'}</h4>
                                        <p className="text-[10px] text-[#A8A29F] mt-0.5">Saved: {formatDate(saved.savedAt)}</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggleSave(restaurant.id)}
                                        className="text-base-content p-1.5 rounded-full hover:bg-base-200 transition-all active:scale-90"
                                        title="ถอนการบันทึก"
                                    >
                                        <Bookmark size={20} fill="currentColor" />
                                    </button>
                                </div>
                            </div>

                        );
                    })
                )}
            </div>
        </section>
    );
};

export default SavedRestaurantSection;
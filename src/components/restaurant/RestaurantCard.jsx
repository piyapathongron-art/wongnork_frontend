import React from "react";
import { Star, MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  // จัดการรูปภาพ
  const coverImage =
    restaurant.images?.find((img) => img.isCover)?.url ||
    restaurant.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80";

  // จัดการคะแนนรีวิว
  const reviewCount = restaurant.reviews?.length || 0;
  const avgRating =
    reviewCount > 0
      ? (
          restaurant.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        ).toFixed(1)
      : "New";

  return (
    <div
      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
      className="bg-base-300 rounded-3xl p-4 flex gap-4 shadow-sm border border-[#EEE2D1]/50 active:scale-95 transition-transform cursor-pointer"
    >
      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-[#EAD9CF]">
        <img
          src={coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-[#2B361B] text-[15px] line-clamp-1">
            {restaurant.name}
          </h3>
          <ChevronRight size={16} className="text-[#A8A29F] shrink-0" />
        </div>
        <p className="text-[11px] text-[#A65D2E] font-bold uppercase tracking-wider mb-2">
          {restaurant.category || "ทั่วไป"}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-[#8B837E] font-medium mt-auto">
          <div className="flex items-center gap-1">
            <Star size={12} fill="#F59E0B" className="text-[#F59E0B]" />
            <span className="text-[#2B361B] font-bold">{avgRating}</span>
            {reviewCount > 0 && <span>({reviewCount})</span>}
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-[#A65D2E]" />
            <span>2.5 km</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;

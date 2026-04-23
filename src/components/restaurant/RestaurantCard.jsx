import React, {useState, useEffect} from "react";
import { Star, MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import calculateDistance from "../../utils/distance.ustils";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  const [userLocation, setUserlocation] = useState(null)

  useEffect(() => {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {setUserlocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })},
        (error) => console.log("Location access denied")
      )
    }
  }, [])

  const distance = userLocation ? calculateDistance(
    userLocation.lat,
    userLocation.lng,
    restaurant.lat,
    restaurant.lng
  ) : null

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
      className="bg-base-100 rounded-3xl p-4 flex gap-4 shadow-sm border border-base-content/10 active:scale-95 transition-transform cursor-pointer"
    >
      <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-base-300">
        <img
          src={coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-base-content text-[15px] line-clamp-1">
            {restaurant.name}
          </h3>
          <ChevronRight size={16} className="text-[#A8A29F] shrink-0" />
        </div>
        <p className="text-[11px] text-accent font-bold uppercase tracking-wider mb-2">
          {restaurant.category || "ทั่วไป"}
        </p>
        <div className="flex items-center gap-3 text-[11px] text-base-content/50 font-medium mt-auto">
          <div className="flex items-center gap-1">
            <Star size={12} fill="#F59E0B" className="text-[#F59E0B]" />
            <span className="text-base-content font-bold">{avgRating}</span>
            {reviewCount > 0 && <span>({reviewCount})</span>}
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-accent" />
            <span>{distance !== null ? `${distance.toFixed(1)} km` : "Calculating ..."}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;

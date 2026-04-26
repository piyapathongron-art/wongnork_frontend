import React from 'react';

const MyRestaurantsSection = ({ ownedRestaurants, navigate }) => {
    return (
        <section className="space-y-4 pt-4">
            <h3 className="font-extrabold text-xl text-base-content">My Restaurants</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                {ownedRestaurants.length === 0 ? (
                    <p className="text-sm text-base-content/50 py-2">คุณยังไม่มีร้านอาหารในระบบ</p>
                ) : (
                    ownedRestaurants.map((restaurant, index) => {
                        const imageUrl =
                            restaurant.images?.find((img) => img.isCover)?.url ||
                            restaurant.images?.[0]?.url ||
                            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80';

                        return (
                            <div
                                key={restaurant.id || index}
                                onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                                className="flex-none w-64 bg-base-100 rounded-3xl overflow-hidden shadow-sm border border-base-content/10 cursor-pointer active:scale-95 transition-transform group hover:border-accent/30"
                            >
                                <div className="w-full h-32 bg-base-300 overflow-hidden">
                                    <img
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        src={imageUrl}
                                    />
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-sm text-base-content truncate">
                                        {restaurant.name || 'ไม่ทราบชื่อร้าน'}
                                    </h4>
                                    <p className="text-[10px] text-base-content/50 mt-0.5 truncate">
                                        {restaurant.address || 'คลิกเพื่อดูรายละเอียด'}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default MyRestaurantsSection;
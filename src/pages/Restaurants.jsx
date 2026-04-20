import React, { useState } from 'react';
import { Search, MapPin, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

const Restaurants = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const categories = ["ทั้งหมด", "Shabu", "Cafe", "Japanese", "BBQ", "Thai", "Western"];
    const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

    const mockRestaurants = [
        {
            id: '1',
            name: 'Shabu ชาบู ชิลล์ๆ',
            category: 'Shabu',
            rating: 4.8,
            reviews: 124,
            distance: '1.2 km',
            imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'
        },
        {
            id: '2',
            name: 'Café de น่านนั้ง',
            category: 'Cafe',
            rating: 4.5,
            reviews: 89,
            distance: '2.5 km',
            imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
        },
        {
            id: '3',
            name: 'Sushi ขั้นเทพ',
            category: 'Japanese',
            rating: 4.9,
            reviews: 210,
            distance: '3.0 km',
            imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=80'
        },
        {
            id: '4',
            name: 'เนื้อย่างพรีเมียม',
            category: 'BBQ',
            rating: 4.7,
            reviews: 156,
            distance: '4.1 km',
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
        }
    ];

    return (
        <div className="w-full min-h-screen bg-[#FFF8F5] text-[#2B361B] pb-32 font-sans overflow-y-auto">
            {/* Header & Search */}
            <div className="sticky top-0 z-40 bg-[#FFF8F5]/90 backdrop-blur-md px-6 pt-6 pb-4 shadow-sm">
                <h1 className="text-2xl font-extrabold text-[#A65D2E] mb-4">Restaurants</h1>

                <div className="flex items-center bg-white rounded-full px-4 py-3 shadow-sm border border-[#EEE2D1]">
                    <Search size={18} className="text-[#A8A29F]" />
                    <input
                        type="text"
                        placeholder="ค้นหาร้านอาหาร..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-[#2B361B] placeholder:text-[#A8A29F]"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${activeCategory === cat
                                ? 'bg-[#A65D2E] text-white'
                                : 'bg-white text-[#8B837E] border border-[#EEE2D1]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Restaurant List */}
            <div className="px-6 mt-6 flex flex-col gap-5">
                {mockRestaurants.map(rest => (
                    <div
                        key={rest.id}
                        onClick={() => navigate(`/restaurant/${rest.id}`)}
                        className="bg-white rounded-[2rem] p-4 flex gap-4 shadow-sm border border-[#EEE2D1]/50 active:scale-95 transition-transform cursor-pointer"
                    >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-200">
                            <img src={rest.imageUrl} alt={rest.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-[#2B361B] text-[15px] line-clamp-1">{rest.name}</h3>
                                <ChevronRight size={16} className="text-[#A8A29F]" />
                            </div>
                            <p className="text-[11px] text-[#A65D2E] font-bold uppercase tracking-wider mb-2">{rest.category}</p>
                            <div className="flex items-center gap-3 text-[11px] text-[#8B837E] font-medium mt-auto">
                                <div className="flex items-center gap-1">
                                    <Star size={12} fill="#F59E0B" className="text-[#F59E0B]" />
                                    <span className="text-[#2B361B] font-bold">{rest.rating}</span>
                                    <span>({rest.reviews})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={12} className="text-[#A65D2E]" />
                                    <span>{rest.distance}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Restaurants;
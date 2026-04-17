import React from 'react';
import useRestaurantStore from '../stores/restaurantStore';

const SearchBar = () => {
    // Categories from our system
    const categories = ["ทั้งหมด", "Shabu", "Cafe", "Japanese", "BBQ", "Thai", "Western", "Izakaya", "Dessert", "Street Food", "Fine Dining"];
    
    const selectedCategory = useRestaurantStore(state => state.selectedCategory);
    const setSelectedCategory = useRestaurantStore(state => state.setSelectedCategory);

    return (
        <div className="w-full max-w-[402px] flex flex-col items-center gap-3">

            {/* Search Bar Container */}
            <div className="w-full h-[64px] bg-[#F7EAD7] rounded-full flex items-center px-6 shadow-md border border-[#EEE2D1]/40">

                {/* Raw SVG Menu Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#2B361B] cursor-pointer">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>

                <input
                    type="text"
                    placeholder="ค้นหาที่นี่"
                    className="flex-1 bg-transparent px-4 text-[#2B361B] placeholder:text-[#A8A29F] outline-none text-lg font-medium"
                />

                {/* Raw SVG Search Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#2B361B] cursor-pointer">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </div>

            {/* Categories */}
            <div className="flex gap-2 w-full overflow-x-auto no-scrollbar py-1">
                {categories.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedCategory(item)}
                        className={`whitespace-nowrap px-6 py-2 rounded-full text-[14px] font-bold shadow-sm border border-[#EEE2D1]/30 active:scale-95 transition-all ${
                            selectedCategory === item 
                            ? 'bg-[#182806] text-[#FFF8EF]' 
                            : 'bg-[#F7EAD7] text-[#2B361B]'
                        }`}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchBar;

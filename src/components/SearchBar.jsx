import React, { useState, useEffect, useRef } from 'react';
import useRestaurantStore from '../stores/restaurantStore';
import calculateDistance from '../utils/distance.ustils';

// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     if (!lat1 || !lon1 || !lat2 || !lon2) return null;
//     const R = 6371; // Radius of the earth in km
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = 
//         Math.sin(dLat/2) * Math.sin(dLat/2) +
//         Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
//         Math.sin(dLon/2) * Math.sin(dLon/2); 
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
//     return R * c; // Distance in km
// };

const SearchBar = ({ onSearchResultClick }) => {
    // Categories from our system
    const categories = ["ทั้งหมด", "Shabu", "Cafe", "Japanese", "BBQ", "Thai", "Western", "Izakaya", "Dessert", "Street Food", "Fine Dining"];
    
    const selectedCategory = useRestaurantStore(state => state.selectedCategory);
    const setSelectedCategory = useRestaurantStore(state => state.setSelectedCategory);
    const restaurants = useRestaurantStore(state => state.restaurants);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const dropdownRef = useRef(null);

    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn('Geolocation not allowed or failed:', error);
                }
            );
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter restaurants based on search query and calculate distance
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setIsDropdownOpen(false);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            let results = restaurants.filter(r => 
                r.name.toLowerCase().includes(lowerQuery)
            );
            
            // Calculate distance and sort if user location is available
            results = results.map(r => {
                const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, r.lat, r.lng) : null;
                return { ...r, distance };
            });

            results.sort((a, b) => {
                if (a.distance === null && b.distance === null) return 0;
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });

            setSearchResults(results);
            setIsDropdownOpen(true);
        }
    }, [searchQuery, restaurants, userLocation]);

    const handleResultClick = (restaurant) => {
        setSearchQuery('');
        setIsDropdownOpen(false);
        if (onSearchResultClick) {
            onSearchResultClick(restaurant);
        }
    };

    return (
        <div className="w-full max-w-[402px] flex flex-col items-center gap-3 relative" ref={dropdownRef}>

            {/* Search Bar Container */}
            <div className="w-full h-[64px] bg-[#F7EAD7]/90 backdrop-blur-md rounded-full flex items-center px-6 shadow-md border border-[#EEE2D1]/40 relative z-50">

                {/* Raw SVG Menu Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#2B361B] cursor-pointer">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>

                <input
                    type="text"
                    placeholder="ค้นหาที่นี่"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchQuery.trim() !== '') setIsDropdownOpen(true); }}
                    className="flex-1 bg-transparent px-4 text-[#2B361B] placeholder:text-[#A8A29F] outline-none text-lg font-medium"
                />

                {/* Raw SVG Search Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#2B361B] cursor-pointer">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </div>

            {/* Search Results Dropdown */}
            {isDropdownOpen && searchResults.length > 0 && (
                <div className="absolute top-[72px] left-0 right-0 bg-[#FFF8F5]/60 backdrop-blur-2xl rounded-2xl shadow-lg border border-[#EEE2D1]/30 overflow-hidden z-40 max-h-[300px] overflow-y-auto">
                    {searchResults.map((result) => (
                        <div 
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className="px-6 py-4 hover:bg-[#F7EAD7]/70 cursor-pointer border-b border-[#EEE2D1]/30 last:border-0 transition-colors flex items-center justify-between"
                        >
                            <div>
                                <h4 className="text-[#2B361B] font-bold text-[15px]">{result.name}</h4>
                                <span className="text-[11px] text-[#A8A29F] font-medium block mt-0.5">
                                    {result.category || 'ร้านอาหาร'}
                                    {result.distance !== null && (
                                        <span className="ml-2 text-[#A65D2E]">
                                            • ห่างออกไป {result.distance.toFixed(1)} km
                                        </span>
                                    )}
                                </span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#A65D2E]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </div>
                    ))}
                </div>
            )}
            
            {isDropdownOpen && searchResults.length === 0 && searchQuery.trim() !== '' && (
                <div className="absolute top-[72px] left-0 right-0 bg-[#FFF8F5]/60 backdrop-blur-2xl rounded-2xl shadow-lg border border-[#EEE2D1]/30 p-6 text-center z-40">
                    <p className="text-[#8B837E] font-medium text-sm">ไม่พบร้านอาหารที่ค้นหา</p>
                </div>
            )}

            {/* Categories */}
            <div className="flex gap-2 w-full overflow-x-auto no-scrollbar py-1 relative z-30">
                {categories.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedCategory(item)}
                        className={`whitespace-nowrap px-6 py-2 rounded-full text-[14px] font-bold shadow-sm border border-[#EEE2D1]/30 active:scale-95 transition-all ${
                            selectedCategory === item 
                            ? 'bg-[#182806] text-[#FFF8EF]' 
                            : 'bg-[#F7EAD7]/90 backdrop-blur-sm text-[#2B361B]'
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
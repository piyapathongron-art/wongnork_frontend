import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiGetme } from '../api/mainApi';
import useUserStore from '../stores/userStore';

// Helper functions for dates
const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // เรียกฟังก์ชัน logout จาก Store
    const logout = useUserStore((state) => state.logout);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await apiGetme();
                const userObj = response.data.data;
                setUserData(userObj);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        if (logout) {
            await logout();
        }
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center bg-[#FFF8F5]">
                <span className="text-[#A65D2E] font-bold animate-pulse tracking-widest">LOADING...</span>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="w-full min-h-screen flex flex-col justify-center items-center bg-[#FFF8F5] px-6">
                <span className="text-red-500 font-bold mb-4">{error || 'ไม่พบข้อมูลผู้ใช้'}</span>
                <button onClick={handleLogout} className="bg-[#A65D2E] text-white px-6 py-2 rounded-full text-sm">
                    ออกจากระบบ
                </button>
            </div>
        );
    }

    // ดึงข้อมูล Array มาเตรียมไว้
    const reviews = userData.reviews || [];
    const joinedParties = userData.joinedParties || [];
    const savedRestaurants = userData.savedRestaurants || [];

    // ลอจิกจัดการ Role: OWNER vs USER/ADMIN
    const isOwner = userData.role === 'OWNER';
    
    // ดึงชื่อที่จะแสดงหลัก ถ้าเป็น OWNER ให้ดึงชื่อร้าน (ถ้าไม่มีร้านก็ fallback ไว้) ถ้าไม่ใช่ดึงชื่อ User
    const mainTitle = isOwner 
        ? (userData.ownedRestaurants?.[0]?.name || 'ยังไม่ได้ตั้งชื่อร้าน') 
        : userData.name;

    return (
        // 🌟 แก้ตรงนี้: เปลี่ยนเป็น h-screen และเพิ่ม overflow-y-auto ให้เลื่อนได้
        <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-[#FFF8F5] text-[#2B361B] pb-32 font-sans">
            
            {/* TopAppBar 🌟 แก้ตรงนี้: เปลี่ยน fixed เป็น sticky จะได้ไม่บังเนื้อหา */}
            <header className="sticky top-0 w-full z-40 flex justify-between items-center px-6 py-4 bg-[#FFF8F5]/90 backdrop-blur-md">
                <h1 className="text-xl font-extrabold text-[#A65D2E]">My Profile</h1>
                
                {/* Logout Icon */}
                <button onClick={handleLogout} className="text-[#A65D2E] hover:bg-[#F7EAD7] p-2 rounded-full transition-colors cursor-pointer" title="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                </button>
            </header>

            {/* 🌟 เอา pt-20 ออก เพราะ Header เป็น sticky แล้วไม่ทับเนื้อหา */}
            <main className="px-6 space-y-8 pt-4">
                {/* 1. Hero Profile Section */}
                <section className="flex flex-col items-center text-center space-y-3">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#2D3E25]">
                            <img 
                                alt="Profile Avatar"
                                className="w-full h-full object-cover" 
                                src={userData.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'} 
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#A65D2E] p-1.5 rounded-full text-white shadow-sm border border-white cursor-pointer hover:bg-[#8e4f27]">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                              <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.158 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.713ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* ส่วนแสดงชื่อ (มีลอจิกแบ่ง Role) */}
                    <div className="text-center mt-2">
                        <h2 className="text-xl font-extrabold text-[#2B361B]">{mainTitle}</h2>
                        {/* ถ้าเป็น OWNER ให้เอาชื่อ User มาห้อยท้ายเป็น Owner */}
                        {isOwner && (
                            <p className="text-sm font-semibold text-[#8B837E] mt-1">Owner: {userData.name}</p>
                        )}
                    </div>

                    {/* Stats Section */}
                    <div className="flex justify-center gap-12 w-full pt-2">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-extrabold text-[#A65D2E]">{reviews.length}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B837E]">Reviews</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-extrabold text-[#A65D2E]">{joinedParties.length}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B837E]">Parties</span>
                        </div>
                    </div>

                    <button className="bg-[#A65D2E] text-white px-8 py-2 rounded-full font-semibold text-sm shadow-sm transition-transform active:scale-95 cursor-pointer mt-4">
                        Edit Profile
                    </button>
                </section>

                {/* 2. My Parties Section */}
                <section className="space-y-4 pt-4">
                    <div className="flex justify-between items-end">
                        <h3 className="font-extrabold text-xl text-[#2B361B]">My Parties</h3>
                        <span className="text-[#A65D2E] text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:underline pb-1">View Map</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {joinedParties.map((jp, index) => {
                            const party = jp.party || {};
                            const restaurant = party.restaurant || {};
                            const imageUrl = restaurant.images?.[0]?.url || 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80';
                            const memberCount = party.members?.length || 1;

                            return (
                                <div key={jp.id || index} className="flex-none w-[160px] bg-white rounded-3xl p-3 shadow-sm border border-[#EEE2D1]/30 space-y-3 relative overflow-hidden">
                                    <div className="w-full h-24 rounded-2xl overflow-hidden bg-[#2D3E25]">
                                        <img alt={party.name} className="w-full h-full object-cover" src={imageUrl} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-[#A65D2E] uppercase tracking-wide">
                                            {formatDate(party.meetupTime)} • {formatTime(party.meetupTime)}
                                        </p>
                                        <h4 className="font-bold text-sm truncate text-[#2B361B]">{party.name || 'Party'}</h4>
                                    </div>
                                    <div className="flex -space-x-2 pt-1">
                                        <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>
                                        <div className="w-6 h-6 rounded-full border-2 border-white bg-[#F7EAD7] flex items-center justify-center text-[10px] font-bold text-[#A65D2E]">+{memberCount}</div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Host a new party Card */}
                        <div className="flex-none w-[160px] bg-[#FAF5F0] rounded-3xl p-3 border border-[#EEE2D1]/50 flex flex-col justify-center items-center text-center space-y-2 cursor-pointer hover:bg-[#F2E8DF] transition-colors">
                            <div className="w-10 h-10 rounded-full border border-[#8B837E] flex items-center justify-center text-[#8B837E]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <p className="text-xs font-medium text-[#8B837E]">Host a new party</p>
                        </div>
                    </div>
                </section>

                {/* 3. Saved Restaurants Section */}
                <section className="space-y-4">
                    <h3 className="font-extrabold text-xl text-[#2B361B]">Saved Restaurants</h3>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                        {savedRestaurants.length === 0 ? (
                            <p className="text-sm text-gray-400 py-2">ยังไม่มีร้านที่บันทึกไว้</p>
                        ) : (
                            savedRestaurants.map((saved, index) => {
                                const restaurant = saved.restaurant || {};
                                const imageUrl = restaurant.images?.[0]?.url || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=80';
                                
                                return (
                                    <div key={saved.id || index} className="flex-none w-64 bg-white rounded-3xl overflow-hidden shadow-sm border border-[#EEE2D1]/30">
                                        <div className="w-full h-32 bg-[#2D3E25]">
                                            <img alt={restaurant.name} className="w-full h-full object-cover" src={imageUrl} />
                                        </div>
                                        <div className="p-4 flex justify-between items-start">
                                            <div className="truncate pr-2">
                                                <h4 className="font-bold text-sm text-[#2B361B] truncate">{restaurant.name || 'ไม่ทราบชื่อร้าน'}</h4>
                                                <p className="text-[10px] text-[#A8A29F] mt-0.5">Saved: {formatDate(saved.savedAt)}</p>
                                            </div>
                                            {/* Bookmark Icon */}
                                            <span className="text-[#A65D2E]">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                    <path fillRule="evenodd" d="M6.32 2.577a4.901 4.901 0 0 1 5.684 0l4.978 3.39c.673.458 1.018 1.25.962 2.062l-1.074 15.656a.75.75 0 0 1-1.341.348L12 18.337l-3.53 5.696a.75.75 0 0 1-1.342-.348L6.054 8.03A2.25 2.25 0 0 1 7.016 5.968l4.978-3.391ZM12 4.41l-4.978 3.391a.75.75 0 0 0-.322.688l.966 14.072 2.695-4.348a.75.75 0 0 1 1.278 0l2.695 4.348.966-14.072a.75.75 0 0 0-.322-.688L12 4.41Z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* 4. My Reviews Section */}
                <section className="space-y-4">
                    <h3 className="font-extrabold text-xl text-[#2B361B]">My Reviews</h3>
                    <div className="space-y-5">
                        {reviews.length === 0 ? (
                            <p className="text-sm text-center text-gray-400 py-4">ยังไม่มีข้อมูลรีวิว</p>
                        ) : (
                            reviews.map((review, index) => {
                                const restaurant = review.restaurant || {};
                                const imageUrl = restaurant.images?.[0]?.url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';

                                return (
                                    <div key={review.id || index} className="flex gap-4 items-start">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-none bg-[#2D3E25]">
                                            <img alt={restaurant.name} className="w-full h-full object-cover" src={imageUrl} />
                                        </div>
                                        <div className="space-y-1 w-full">
                                            <div className="flex justify-between items-center w-full">
                                                <h4 className="font-bold text-[13px] text-[#2B361B]">{restaurant.name || 'ร้านอาหาร'}</h4>
                                                <span className="text-[10px] text-[#A8A29F] font-medium">{formatDate(review.createdAt)}</span>
                                            </div>
                                            <div className="flex text-[#A65D2E]">
                                                {[...Array(5)].map((_, starIndex) => (
                                                    <svg key={starIndex} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={starIndex < review.rating ? "currentColor" : "none"} stroke={starIndex < review.rating ? "none" : "currentColor"} strokeWidth={2} className="w-3 h-3">
                                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <p className="text-[11px] text-[#7A7571] line-clamp-2 leading-relaxed pr-2">
                                                {review.comment}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Profile;
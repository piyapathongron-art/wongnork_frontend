import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { apiGetme, apiUpdateProfile, apiToggleSaveRestaurant } from '../api/mainApi';
import uploadCloudinary from '../utils/cloudinary';
import useUserStore from '../stores/userStore';
import { toast } from 'react-toastify';
import { LucideChefHat } from 'lucide-react';
import SavedRestaurantSection from '../components/profile/SavedRestaurantSection';
import ReviewSection from '../components/profile/ReviewSection';
import MyRestaurantsSection from '../components/profile/MyRestaurantsSection';
import PartySection from '../components/profile/PartySection';
import HistoryModal from '../components/profile/HistoryModal';

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

    const logout = useUserStore((state) => state.logout);

    // 🌟 State สำหรับโหมดแก้ไข
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', avatarUrl: '' });

    // 🌟 State สำหรับ Modal ประวัติ
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // 🌟 สำหรับจัดการอัปโหลดรูปภาพ
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    //  ดึงข้อมูลโปรไฟล์เมื่อเข้ามาที่หน้า
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await apiGetme();
                const userObj = response.data.data;
                setUserData(userObj);
                console.log(userData);

                setEditForm({ name: userObj.name || '', avatarUrl: userObj.avatarUrl || '' });
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

    // 🌟 ฟังก์ชันจัดการเมื่อเลือกไฟล์รูปใหม่
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 🌟 ฟังก์ชันกด Save Profile
    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            let finalAvatarUrl = editForm.avatarUrl;

            if (selectedFile) {
                finalAvatarUrl = await uploadCloudinary(selectedFile, "toast-container");
            }

            const updateData = {
                name: editForm.name,
                avatarUrl: finalAvatarUrl
            };

            await apiUpdateProfile(updateData);

            setUserData(prev => ({ ...prev, name: updateData.name, avatarUrl: updateData.avatarUrl }));
            setIsEditing(false);
            setSelectedFile(null);
            toast.success("อัปเดตโปรไฟล์เรียบร้อย!");

        } catch (err) {
            console.error("Error saving profile:", err);
            toast.error("เกิดข้อผิดพลาดในการบันทึก");
        } finally {
            setIsSaving(false);
        }
    };

    // 🌟 ฟังก์ชันจัดการการกดเอา Save ออก (Unsave)
    const handleToggleSave = async (restaurantId) => {
        try {
            // ยิง API ไปเอาออกหลังบ้าน
            await apiToggleSaveRestaurant(restaurantId);

            // อัปเดตหน้าจอทันทีโดยกรองร้านนี้ออกไปจาก Array
            setUserData(prev => ({
                ...prev,
                savedRestaurants: prev.savedRestaurants.filter(item => item.restaurantId !== restaurantId)
            }));

            toast.success("นำออกจากรายการที่บันทึกแล้ว");
        } catch (err) {
            console.error("Error toggling save:", err);
            toast.error("เกิดข้อผิดพลาด ไม่สามารถนำออกได้");
        }
    };

    const handleCancelEdit = () => {
        setEditForm({ name: userData.name, avatarUrl: userData.avatarUrl || '' });
        setPreviewUrl('');
        setSelectedFile(null);
        setIsEditing(false);
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

    const reviews = userData.reviews || [];
    const joinedParties = userData.joinedParties || [];
    const partiesLed = userData.partiesLed || [];
    const savedRestaurants = userData.savedRestaurants || [];
    const isOwner = userData.role === 'OWNER';

    // 🌟 เติมบรรทัดนี้ลงไปเพื่อดึงร้านของ Owner
    const ownedRestaurants = userData.ownedRestaurants || [];

    const combinedParties = [
        ...joinedParties.map(jp => ({ ...jp.party, isLeader: false, relationId: jp.id })),
        ...partiesLed.map(party => ({ ...party, isLeader: true, relationId: party.id }))
    ];

    const uniquePartiesMap = new Map();
    combinedParties.forEach(p => {
        if (!uniquePartiesMap.has(p.id) || p.isLeader) {
            uniquePartiesMap.set(p.id, p);
        }
    });

    const allMyParties = Array.from(uniquePartiesMap.values());

    // 🌟 แยกประเภทปาร์ตี้
    const activeParties = allMyParties.filter(p => p.status === 'OPEN' || p.status === 'FULL');
    const pastParties = allMyParties.filter(p => p.status === 'COMPLETED');

    activeParties.sort((a, b) => new Date(b.meetupTime) - new Date(a.meetupTime));
    pastParties.sort((a, b) => new Date(b.meetupTime) - new Date(a.meetupTime));

    //  เปลี่ยนข้อความสำหรับคนที่เป็นเจ้าของร้าน
    const mainTitle = isOwner ? 'Restaurant Owner' : userData.name;

    return (
        <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-[#FFF8F5] text-[#2B361B] pb-32 font-sans">

            <header className="sticky top-0 w-full z-40 flex justify-between items-center px-6 py-4 bg-[#FFF8F5]/90 backdrop-blur-md">
                <h1 className="text-xl font-extrabold text-[#A65D2E]">My Profile</h1>
                <button onClick={handleLogout} className="text-[#A65D2E] hover:bg-[#F7EAD7] p-2 rounded-full transition-colors cursor-pointer" title="Logout">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                </button>
            </header>

            <main className="px-6 space-y-8 pt-4">
                <section className="flex flex-col items-center text-center space-y-3">

                    <div className={`relative group ${isEditing ? 'cursor-pointer' : ''}`} onClick={() => isEditing && fileInputRef.current.click()}>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#2D3E25]">
                            <img
                                alt="Profile Avatar"
                                className="w-full h-full object-cover"
                                src={previewUrl || editForm.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'}
                            />
                        </div>

                        {isEditing && (
                            <div className="absolute bottom-0 right-0 bg-[#A65D2E] p-1.5 rounded-full text-white shadow-sm border border-white hover:bg-[#8e4f27]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                </svg>
                            </div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="text-center mt-2 w-full">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="ใส่ชื่อของคุณ"
                                className="text-xl font-extrabold text-[#2B361B] bg-white border-b-2 border-[#A65D2E] focus:outline-none text-center px-2 py-1 w-full max-w-[250px] rounded-lg shadow-sm"
                            />
                        ) : (
                            <>
                                {isOwner && (
                                    <div className='flex justify-center'>
                                        <h2 className="text-xl font-extrabold text-[#2B361B]">{userData.name}</h2>
                                        <LucideChefHat />
                                    </div>
                                )}
                                {!isOwner && (
                                    <h2 className="text-xl font-extrabold text-[#2B361B]">{mainTitle}</h2>)}
                                {isOwner && <h2 className="text-[10px] text-[#A8A29F] mt-0.5 truncate">{mainTitle}</h2>}
                            </>
                        )}
                    </div>

                    {/*  1. ปรับ Stats ให้แสดงจำนวนร้านที่เซฟไว้ด้วย */}
                    <div className="flex justify-center gap-8 sm:gap-12 w-full pt-2">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-extrabold text-[#A65D2E]">{reviews.length}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B837E]">Reviews</span>
                        </div>
                        <div className="flex flex-col items-center border-x border-[#EEE2D1] px-6 sm:px-10">
                            <span className="text-lg font-extrabold text-[#A65D2E]">
                                {allMyParties.filter(p => p.status === 'COMPLETED').length}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B837E]">Past Parties</span>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-lg font-extrabold text-[#A65D2E]">{savedRestaurants.length}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B837E]">Saved</span>
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="flex gap-3 mt-4">
                            <button onClick={handleCancelEdit} disabled={isSaving} className="bg-[#EBE5E0] text-[#8B837E] px-6 py-2 rounded-full font-semibold text-sm shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={handleSaveProfile} disabled={isSaving} className="bg-[#A65D2E] text-white px-6 py-2 rounded-full font-semibold text-sm shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50">
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-[#A65D2E] text-white px-8 py-2 rounded-full font-semibold text-sm shadow-sm transition-transform active:scale-95 cursor-pointer mt-4">
                            Edit Profile
                        </button>
                    )}
                </section>

                {/* 2. My Parties Section */}
                <PartySection
                    activeParties={activeParties}
                    hasPastParties={pastParties.length > 0}
                    setIsHistoryOpen={setIsHistoryOpen}
                    navigate={navigate}
                    formatDate={formatDate}
                    formatTime={formatTime}
                />

                {/* เพิ่ม Section: My Restaurants (แสดงเฉพาะ OWNER) */}
                {isOwner && <MyRestaurantsSection ownedRestaurants={ownedRestaurants} navigate={navigate} />}

                <SavedRestaurantSection
                    savedRestaurants={savedRestaurants}
                    handleToggleSave={handleToggleSave}
                    formatDate={formatDate}
                />
                <ReviewSection reviews={reviews} formatDate={formatDate} />

            </main>

            {/* 🌟 History Bottom Sheet Modal */}
            <HistoryModal
                isHistoryOpen={isHistoryOpen}
                setIsHistoryOpen={setIsHistoryOpen}
                pastParties={pastParties}
                navigate={navigate}
                formatDate={formatDate}
            />

        </div>
    );
};

export default Profile;
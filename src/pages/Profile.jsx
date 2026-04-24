import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { apiGetme, apiUpdateProfile, apiToggleSaveRestaurant, apiGetPublicProfile } from '../api/mainApi';
import uploadCloudinary from '../utils/cloudinary';
import useUserStore from '../stores/userStore';
import { toast } from 'sonner';
import { LucideChefHat, AlertCircle, ArrowLeft, Settings, LogOut, Landmark, User, Camera, X, SunIcon, MoonIcon } from 'lucide-react';
import SavedRestaurantSection from '../components/profile/SavedRestaurantSection';
import ReviewSection from '../components/profile/ReviewSection';
import MyRestaurantsSection from '../components/profile/MyRestaurantsSection';
import PartySection from '../components/profile/PartySection';
import HistoryModal from '../components/profile/HistoryModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useThemeStore } from '../stores/themeStore';
import EditProfileModal from '../components/Modals/EditProfileModal';
import AccessDeniedModal from '../components/Modals/AlertModals/AccessDeniedModal';
import SettingButton from '../components/profile/SettingButton';
import useFetchProfile from '../hooks/useFetchProfile';
import useEditProfile from '../hooks/useEditProfile';
import formatDate from '../utils/formatDate';
import formatTime from '../utils/formatTime';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = useUserStore((state) => state.user);

    const isMe = !id || id === currentUser?.id;

    const {
        userData,
        setUserData,
        loading,
        setLoading,
        error,
        setError,
        editForm,
        setEditForm,
    } = useFetchProfile(id, isMe);

    const {
        isEditModalOpen,
        setIsEditModalOpen,
        isSaving,
        previewUrl,
        handleFileChange,
        handleSaveProfile,
        handleCancelEdit
    } = useEditProfile({ userData, setUserData, editForm, setEditForm });

    // สำหรับ Modal ประวัติ
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // สำหรับแจ้งเตือนเข้าปาร์ตี้คนอื่นไม่ได้
    const [isAccessDeniedModalOpen, setIsAccessDeniedModalOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("ออกจากระบบสำเร็จ");
            navigate("/");
        } catch (err) {
            toast.error("เกิดข้อผิดพลาด");
        }
    }

    // สำหรับจัดการเมื่อคลิกที่ปาร์ตี้
    const handlePartyClick = (party) => {
        // เช็คว่าเป็นเจ้าของโปรไฟล์ หรือ เป็นสมาชิกในปาร์ตี้นั้นไหม
        const isMember = party.members?.some(m => m.user.id === currentUser?.id);

        if (isMe || isMember) {
            setIsHistoryOpen(false); // ปิด modal ประวัติถ้าเปิดอยู่
            navigate(`/party/${party.id}/split-bill`);
        } else {
            setIsAccessDeniedModalOpen(true);
        }
    };


    // สำหรับจัดการการกดเอา Save ออก (Unsave)
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

    // สำหรับจัดการ loading
    if (loading) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center bg-base-100">
                <span className="text-accent font-bold animate-pulse tracking-widest">LOADING...</span>
            </div>
        );
    }

    // สำหรับจัดการ error
    if (error || !userData) {
        return (
            <div className="w-full min-h-screen flex flex-col justify-center items-center bg-base-100 px-6">
                <span className="text-red-500 font-bold mb-4">{error || 'ไม่พบข้อมูลผู้ใช้'}</span>
                <button onClick={handleLogout} className="bg-accent text-white px-6 py-2 rounded-full text-sm">
                    ออกจากระบบ
                </button>
            </div>
        );
    }

    // สำหรับดึงข้อมูล
    const reviews = userData.reviews || [];
    const joinedParties = userData.joinedParties || [];
    const partiesLed = userData.partiesLed || [];
    const savedRestaurants = userData.savedRestaurants || [];
    const isOwner = userData.role === 'OWNER';
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
    const activeParties = allMyParties.filter(p => p.status === 'OPEN' || p.status === 'FULL');
    const pastParties = allMyParties.filter(p => p.status === 'COMPLETED');

    activeParties.sort((a, b) => new Date(b.meetupTime) - new Date(a.meetupTime));
    pastParties.sort((a, b) => new Date(b.meetupTime) - new Date(a.meetupTime));

    return (
        <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-base-100 text-base-content pb-32 font-sans no-scrollbar">

            <header className="sticky top-0 w-full z-40 flex items-center px-6 py-4 bg-base-100/90 backdrop-blur-md border-b border-base-content/5">
                {!isMe && (
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 mr-2 rounded-full hover:bg-base-200 transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={24} className="text-base-content" />
                    </button>
                )}
                <h1 className="text-xl font-black text-primary flex-1">{isMe ? 'My Profile' : 'Profile'}</h1>
                {isMe && (
                    <SettingButton
                        setIsEditModalOpen={setIsEditModalOpen}
                    />
                )}
            </header>

            <main className="px-6 space-y-8 pt-8">
                <section className="flex flex-col items-center text-center space-y-5">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-base-100 shadow-xl bg-base-300 ring-4 ring-primary/5">
                            <img
                                alt="Profile Avatar"
                                className="w-full h-full object-cover"
                                src={userData.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        {isOwner ? (
                            <div className='flex justify-center items-center gap-2'>
                                <h2 className="text-2xl font-black text-base-content">{userData.name}</h2>
                                <LucideChefHat className="text-primary" />
                            </div>
                        ) : (
                            <h2 className="text-2xl font-black text-base-content">{userData.name}</h2>
                        )}
                        {isOwner && <p className="text-[10px] text-base-content/40 uppercase tracking-[0.2em] font-black">Restaurant Owner</p>}
                    </div>

                    <div className="flex justify-center gap-10 w-full pt-2">
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-black text-primary">{reviews.length}</span>
                            <span className="text-[10px] uppercase tracking-widest font-black text-base-content/30">Reviews</span>
                        </div>
                        <div className="w-px h-10 bg-base-content/5" />
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-black text-primary">
                                {allMyParties.filter(p => p.status === 'COMPLETED').length}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest font-black text-base-content/30">History</span>
                        </div>
                        <div className="w-px h-10 bg-base-content/5" />
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-black text-primary">{savedRestaurants.length}</span>
                            <span className="text-[10px] uppercase tracking-widest font-black text-base-content/30">Saved</span>
                        </div>
                    </div>
                </section>

                <PartySection
                    activeParties={activeParties}
                    hasPastParties={pastParties.length > 0}
                    setIsHistoryOpen={setIsHistoryOpen}
                    onPartyClick={handlePartyClick}
                    navigate={navigate}
                    formatDate={formatDate}
                    formatTime={formatTime}
                />

                {isOwner && isMe && <MyRestaurantsSection ownedRestaurants={ownedRestaurants} navigate={navigate} />}

                <SavedRestaurantSection
                    savedRestaurants={savedRestaurants}
                    handleToggleSave={isMe ? handleToggleSave : null}
                    formatDate={formatDate}
                />
                <ReviewSection reviews={reviews} formatDate={formatDate} />

            </main>

            <AnimatePresence>
                {isEditModalOpen && (
                    <EditProfileModal
                        editForm={editForm}
                        setEditForm={setEditForm}
                        previewUrl={previewUrl}
                        handleFileChange={handleFileChange}
                        handleSaveProfile={handleSaveProfile}
                        isSaving={isSaving}
                        handleCancelEdit={handleCancelEdit}
                    />
                )}
            </AnimatePresence>

            <HistoryModal
                isHistoryOpen={isHistoryOpen}
                setIsHistoryOpen={setIsHistoryOpen}
                pastParties={pastParties}
                onPartyClick={handlePartyClick}
                navigate={navigate}
                formatDate={formatDate}
            />

            <AnimatePresence>
                {isAccessDeniedModalOpen && (
                    <AccessDeniedModal
                        isAccessDeniedModalOpen={isAccessDeniedModalOpen}
                        setIsAccessDeniedModalOpen={setIsAccessDeniedModalOpen}
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

export default Profile;

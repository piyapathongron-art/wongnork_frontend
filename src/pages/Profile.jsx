import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { apiGetme, apiUpdateProfile, apiToggleSaveRestaurant, apiGetPublicProfile } from '../api/mainApi';
import uploadCloudinary from '../utils/cloudinary';
import useUserStore from '../stores/userStore';
import { toast } from 'react-toastify';
import { LucideChefHat, AlertCircle, ArrowLeft, Settings, LogOut, Landmark, User, Camera, X, SunIcon, MoonIcon } from 'lucide-react';
import SavedRestaurantSection from '../components/profile/SavedRestaurantSection';
import ReviewSection from '../components/profile/ReviewSection';
import MyRestaurantsSection from '../components/profile/MyRestaurantsSection';
import PartySection from '../components/profile/PartySection';
import HistoryModal from '../components/profile/HistoryModal';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeToggleButton from '../components/ThemeToggleButton';
import { useThemeStore } from '../stores/themeStore';

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
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const currentUser = useUserStore((state) => state.user);
    const logout = useUserStore((state) => state.logout);

    // Determine if this is my own profile
    const isMe = !id || id === currentUser?.id;

    // 🌟 State สำหรับ Modal แก้ไข
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        avatarUrl: '',
        promptPayNumber: '',
        promptPayName: ''
    });

    // 🌟 State สำหรับ Modal ประวัติ
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // 🌟 State สำหรับแจ้งเตือนเข้าปาร์ตี้คนอื่นไม่ได้
    const [isAccessDeniedModalOpen, setIsAccessDeniedModalOpen] = useState(false);

    // 🌟 สำหรับจัดการอัปโหลดรูปภาพ
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const toggleTheme = useThemeStore((state) => state.toggleTheme)
    const isDark = useThemeStore((state) => state.isDark)



    //  ดึงข้อมูลโปรไฟล์เมื่อเข้ามาที่หน้า
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = isMe ? await apiGetme() : await apiGetPublicProfile(id);
                const userObj = response.data.data;
                setUserData(userObj);

                setEditForm({
                    name: userObj.name || '',
                    avatarUrl: userObj.avatarUrl || '',
                    promptPayNumber: userObj.promptPayNumber || '',
                    promptPayName: userObj.promptPayName || ''
                });
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [id, isMe]);

    const handleLogout = async () => {
        if (logout) {
            await logout();
        }
        localStorage.removeItem('token');
        navigate('/login');
    };

    // 🌟 ฟังก์ชันจัดการเมื่อคลิกที่ปาร์ตี้
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
                avatarUrl: finalAvatarUrl,
                promptPayNumber: editForm.promptPayNumber,
                promptPayName: editForm.promptPayName
            };

            await apiUpdateProfile(updateData);

            setUserData(prev => ({
                ...prev,
                name: updateData.name,
                avatarUrl: updateData.avatarUrl,
                promptPayNumber: updateData.promptPayNumber,
                promptPayName: updateData.promptPayName
            }));
            setIsEditModalOpen(false);
            setSelectedFile(null);
            setPreviewUrl('');
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
        setEditForm({
            name: userData.name,
            avatarUrl: userData.avatarUrl || '',
            promptPayNumber: userData.promptPayNumber || '',
            promptPayName: userData.promptPayName || ''
        });
        setPreviewUrl('');
        setSelectedFile(null);
        setIsEditModalOpen(false);
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center bg-base-100">
                <span className="text-accent font-bold animate-pulse tracking-widest">LOADING...</span>
            </div>
        );
    }

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
                    <div className='dropdown dropdown-end'>
                        <div tabIndex={0} role='button' className='p-2 rounded-full hover:bg-base-200 text-accent transition-colors'>
                            <Settings size={24} />
                        </div>
                        <ul tabIndex={0} className='dropdown-content menu bg-base-100 rounded-[2.5rem] z-50 shadow-2xl w-64 p-3 mt-4 border border-base-content/10 ring-1 ring-black/5'>
                            <div className='px-4 py-2 mb-1'>
                                <span className='text-[10px] font-black uppercase tracking-widest text-base-content/40'>Settings</span>
                            </div>

                            <li>
                                <button onClick={() => setIsEditModalOpen(true)} className='flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/10 text-base-content font-bold transition-all active:scale-95'>
                                    <div className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                                        <User size={18} />
                                    </div>
                                    <span>Edit Profile</span>
                                </button>
                            </li>

                            <li onClick={toggleTheme}>
                                <div className='flex justify-between items-center p-3 rounded-2xl hover:bg-base-200 active:bg-transparent group transition-all'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-9 h-9 rounded-full bg-base-200 group-hover:bg-primary/10 flex items-center justify-center transition-colors'>
                                            {isDark ? <MoonIcon className="w-4 h-4 text-primary transition-colors" /> : <SunIcon className="w-4 h-4 text-primary transition-colors" />}
                                        </div>
                                        <span className='font-bold'>Appearance</span>
                                    </div>
                                </div>
                            </li>

                            <div className='h-px bg-base-content/10 my-2 mx-3' />

                            <li>
                                <button onClick={handleLogout} className='flex items-center gap-3 p-3 rounded-2xl hover:bg-red-500/10 text-red-500 font-bold transition-all active:scale-95'>
                                    <div className='w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-500'>
                                        <LogOut size={18} />
                                    </div>
                                    <span>Sign Out</span>
                                </button>
                            </li>
                        </ul>
                    </div>
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
                    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCancelEdit}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative bg-base-100 w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl border-t sm:border border-base-content/10 max-h-[90vh] overflow-y-auto no-scrollbar"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-primary tracking-tight">Edit Profile</h2>
                                <button onClick={handleCancelEdit} className="p-2 bg-base-200 rounded-full hover:bg-base-300 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="flex flex-col items-center">
                                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-base-100 shadow-xl bg-base-300 ring-4 ring-primary/10 transition-all group-hover:ring-primary/20">
                                            <img
                                                src={previewUrl || editForm.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'}
                                                alt="Avatar Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-lg border-2 border-base-100 group-hover:scale-110 transition-transform">
                                            <Camera size={20} />
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </div>
                                    <p className="text-[10px] font-black text-base-content/30 uppercase mt-4 tracking-widest">Tap to change photo</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary uppercase ml-2 tracking-widest">Display Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                                            placeholder="Your Display Name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-primary uppercase ml-2 tracking-widest flex items-center gap-2">
                                                <Landmark size={12} /> PromptPay Number
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.promptPayNumber}
                                                onChange={(e) => setEditForm({ ...editForm, promptPayNumber: e.target.value })}
                                                className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                                                placeholder="08x-xxx-xxxx"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-base-content/30 uppercase ml-2 tracking-widest">Account Holder Name</label>
                                            <input
                                                type="text"
                                                value={editForm.promptPayName}
                                                onChange={(e) => setEditForm({ ...editForm, promptPayName: e.target.value })}
                                                className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                                                placeholder="Firstname Lastname"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex-1 py-4 rounded-2xl font-black text-sm bg-base-200 text-base-content hover:bg-base-300 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="flex-[2] py-4 rounded-2xl font-black text-sm bg-primary text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
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
                    <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsAccessDeniedModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-base-100 w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border border-base-content/10"
                        >
                            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 text-error">
                                <AlertCircle size={40} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-base-content mb-2 tracking-tight">Access Denied ⚠️</h3>
                            <p className="text-sm text-base-content/50 mb-8 leading-relaxed">
                                This party is private. <br /> Only table members can access the bill.
                            </p>
                            <button
                                onClick={() => setIsAccessDeniedModalOpen(false)}
                                className="w-full py-4 rounded-2xl font-black text-sm bg-base-content text-base-100 shadow-lg active:scale-[0.98] transition-all"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Profile;

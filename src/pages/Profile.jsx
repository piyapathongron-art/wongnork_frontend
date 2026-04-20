import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { apiGetme, apiUpdateProfile } from '../api/mainApi';
import uploadCloudinary from '../utils/cloudinary';
import useUserStore from '../stores/userStore';
import { toast } from 'react-toastify';

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

    // 🌟 สำหรับจัดการอัปโหลดรูปภาพ
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

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

    // 🌟 ฟังก์ชันกด Save
    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            let finalAvatarUrl = editForm.avatarUrl;

            // ถ้ามีการเลือกรูปใหม่ ให้โยนขึ้น Cloudinary
            if (selectedFile) {
                finalAvatarUrl = await uploadCloudinary(selectedFile, "toast-container");
            }

            const updateData = {
                name: editForm.name,
                avatarUrl: finalAvatarUrl
            };

            // ส่งข้อมูลไป Backend
            await apiUpdateProfile(updateData);

            // อัปเดตข้อมูลบนหน้าจอ
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

    // 🌟 ฟังก์ชันกดยกเลิก
    const handleCancelEdit = () => {
        // คืนค่าเดิม
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

    // รวมปาร์ตี้ที่ join และปาร์ตี้ที่ตัวเองเป็น leader เข้าด้วยกัน
    // (โดยเช็คว่า party ที่ได้จาก joinedParties จะอยู่ในรูปแบบ jp.party 
    // ส่วน partiesLed จะเป็น object ของ party เลย เราจึงต้อง normalize ข้อมูลให้หน้าตาเหมือนกัน)
    const allMyParties = [
        ...joinedParties.map(jp => ({ ...jp.party, isLeader: false, relationId: jp.id })),
        ...partiesLed.map(party => ({ ...party, isLeader: true, relationId: party.id }))
    ];

    // เรียงตามเวลาล่าสุด
    allMyParties.sort((a, b) => new Date(b.meetupTime) - new Date(a.meetupTime));

    const mainTitle = isOwner
        ? (userData.ownedRestaurants?.[0]?.name || 'ยังไม่ได้ตั้งชื่อร้าน')
        : userData.name;

    console.log(allMyParties)

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

                    {/* 🌟 แสดงรููปภาพ และเปิดให้คลิกอัปโหลดถ้าอยู่ในโหมด Edit */}
                    <div className={`relative group ${isEditing ? 'cursor-pointer' : ''}`} onClick={() => isEditing && fileInputRef.current.click()}>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#2D3E25]">
                            <img
                                alt="Profile Avatar"
                                className="w-full h-full object-cover"
                                src={previewUrl || editForm.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'}
                            />
                        </div>

                        {/* ไอคอนกล้องจะโชว์เฉพาะตอนกด Edit */}
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
                        {/* 🌟 สลับระหว่าง Text ธรรมดา กับ Input Field */}
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
                                <h2 className="text-xl font-extrabold text-[#2B361B]">{mainTitle}</h2>
                                {isOwner && (
                                    <p className="text-sm font-semibold text-[#8B837E] mt-1">Owner: {userData.name}</p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex justify-center gap-12 w-full pt-2">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-extrabold text-[#A65D2E]">{reviews.length}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B837E]">Reviews</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-extrabold text-[#A65D2E]">{allMyParties.length}</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8B837E]">Parties</span>
                        </div>
                    </div>

                    {/* 🌟 เปลี่ยนปุ่มตามโหมด */}
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

                {/* ส่วนล่างเหมือนเดิมเป๊ะครับ 🌟 */}
                {/* 2. My Parties Section */}
                <section className="space-y-4 pt-4">
                    <div className="flex justify-between items-end">
                        <h3 className="font-extrabold text-xl text-[#2B361B]">My Parties</h3>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {allMyParties.map((party, index) => {
                            const restaurant = party.restaurant || {};
                            const imageUrl = restaurant.images?.[0]?.url || 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80';
                            const memberCount = party.members?.length || 1;

                            return (
                                <div key={party.relationId || index} className="flex-none w-[160px] bg-white rounded-3xl p-3 shadow-sm border border-[#EEE2D1]/30 space-y-3 relative overflow-hidden">
                                    {party.isLeader && (
                                        <div className="absolute top-2 right-2 z-10 bg-[#FFF8F5]/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-[#F7EAD7]">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#A65D2E]">
                                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="w-full h-24 rounded-2xl overflow-hidden bg-[#2D3E25] relative">
                                        <img alt={party.name} className="w-full h-full object-cover" src={imageUrl} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-[#A65D2E] uppercase tracking-wide">
                                            {formatDate(party.meetupTime)} • {formatTime(party.meetupTime)}
                                        </p>
                                        <h4 className="font-bold text-sm truncate text-[#2B361B]">{party.name || 'Party'}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 pt-1">
                                        <div className="flex -space-x-2">
                                            {/* โชว์รูปโปรไฟล์คนในตี้ (สูงสุด 3 คน) */}
                                            {party.members?.slice(0, 3).map((member, mIdx) => (
                                                <div key={mIdx} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative z-10 shadow-sm">
                                                    <img
                                                        src={member.user?.avatarUrl || `https://i.pravatar.cc/150?u=${member.user?.id || mIdx}`}
                                                        alt={member.user?.name || "Member"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {/* <div className="w-6 h-6 rounded-full border-2 border-white bg-[#F7EAD7] flex items-center justify-center text-[10px] font-bold text-[#A65D2E] shadow-sm">
                                            +{Math.max(memberCount - 3, 0)}
                                        </div> */}
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
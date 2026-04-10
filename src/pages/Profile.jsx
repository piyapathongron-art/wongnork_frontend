import React from 'react';

const Profile = () => {
    return (
        <div className="w-full min-h-screen bg-[#FFF8F5] text-[#2B361B] pb-32 font-sans">
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-40 flex justify-between items-center px-6 py-4 bg-[#FFF8F5]/90 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button className="text-[#A65D2E] hover:bg-[#F7EAD7] p-2 rounded-full transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-extrabold text-[#A65D2E]">My Profile</h1>
                </div>
                <button className="text-[#A65D2E] hover:bg-[#F7EAD7] p-2 rounded-full transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.004.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </button>
            </header>

            <main className="pt-24 px-6 space-y-8">
                {/* Hero Profile Section */}
                <section className="flex flex-col items-center text-center space-y-4">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-[3px] border-[#FFF8F5] shadow-lg bg-gray-200">
                            {/* รูปโปรไฟล์ ตรงนี้เปลี่ยน src เอาได้เลยครับ */}
                            <img alt="Wongnork User" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#A65D2E] p-1.5 rounded-full text-white shadow-md border-2 border-[#FFF8F5] cursor-pointer hover:bg-[#8e4f27] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.158 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.713ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                            </svg>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-extrabold text-[#2B361B]">Wongnork User</h2>
                        <p className="text-[#A8A29F] text-[13px] max-w-[280px] mx-auto leading-relaxed">
                            Culinary explorer based in the coastal hills. Seeking the perfect sourdough and community table vibes. 🌊🥖
                        </p>
                    </div>
                    <button className="bg-[#A65D2E] text-white px-8 py-2.5 rounded-full font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer hover:bg-[#8e4f27]">
                        Edit Profile
                    </button>
                </section>

                {/* Stats Section */}
                <section className="flex justify-center bg-[#FDF4EB] py-4 rounded-3xl mx-2 shadow-sm border border-[#EEE2D1]/40">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl font-extrabold text-[#A65D2E]">24</span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#A8A29F] mt-1">Reviews</span>
                    </div>
                    {/* เส้นคั่นกลาง */}
                    <div className="w-[1px] bg-[#EEE2D1]/60 my-1"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-xl font-extrabold text-[#A65D2E]">12</span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-[#A8A29F] mt-1">Parties</span>
                    </div>
                </section>

                {/* My Parties Section */}
                <section className="space-y-4">
                    <div className="flex justify-between items-end">
                        <h3 className="font-extrabold text-[1.35rem] text-[#2B361B]">My Parties</h3>
                        <span className="text-[#A65D2E] text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:underline pb-1">View Map</span>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {/* Party Card */}
                        <div className="flex-none w-[170px] bg-white rounded-[1.5rem] p-3 shadow-sm border border-[#EEE2D1]/30 space-y-3 relative overflow-hidden">
                            <div className="w-full h-24 rounded-2xl overflow-hidden bg-[#2D3E25] relative">
                                <img alt="Pasta Party" className="w-full h-full object-cover opacity-90" src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-[#A65D2E] uppercase tracking-wider">Tonight • 19:00</p>
                                <h4 className="font-bold text-[13px] truncate text-[#2B361B]">Artisan Pasta Night</h4>
                            </div>
                            <div className="flex -space-x-1.5">
                                <div className="w-6 h-6 rounded-full border-[1.5px] border-white bg-gray-200"></div>
                                <div className="w-6 h-6 rounded-full border-[1.5px] border-white bg-gray-300"></div>
                                <div className="w-6 h-6 rounded-full border-[1.5px] border-white bg-gray-400"></div>
                                <div className="w-6 h-6 rounded-full border-[1.5px] border-white bg-[#F7EAD7] flex items-center justify-center text-[9px] font-bold text-[#A65D2E]">+2</div>
                            </div>
                        </div>

                        {/* Host a new party Card */}
                        <div className="flex-none w-[170px] bg-[#FDF4EB] rounded-[1.5rem] p-3 border border-[#EEE2D1]/50 flex flex-col justify-center items-center text-center space-y-3 cursor-pointer hover:bg-[#F7EAD7] transition-colors">
                            <div className="w-8 h-8 rounded-full border-[1.5px] border-[#A8A29F] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#A8A29F" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                            <p className="text-[11px] font-medium text-[#A8A29F]">Host a new party</p>
                        </div>
                    </div>
                </section>

                {/* My Reviews Section */}
                <section className="space-y-4">
                    <h3 className="font-extrabold text-[1.35rem] text-[#2B361B]">My Reviews</h3>
                    <div className="space-y-5">
                        {/* Review Item 1 */}
                        <div className="flex gap-4 items-start">
                            <div className="w-20 h-20 rounded-[1.2rem] overflow-hidden flex-none bg-[#2D3E25]">
                                <img alt="Review Image" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80" />
                            </div>
                            <div className="space-y-1.5 py-1 w-full">
                                <div className="flex justify-between items-center w-full">
                                    <h4 className="font-bold text-[13px] text-[#2B361B]">The Terracotta Hearth</h4>
                                    <span className="text-[9px] text-[#A8A29F] font-medium">2 days ago</span>
                                </div>
                                <div className="flex text-[#A65D2E]">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]">
                                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-[11px] text-[#7A7571] line-clamp-2 leading-snug">
                                    The smoky flavor from the wood-fire oven is incomparable. Must try the roasted beets...
                                </p>
                            </div>
                        </div>

                        {/* Review Item 2 */}
                        <div className="flex gap-4 items-start">
                            <div className="w-20 h-20 rounded-[1.2rem] overflow-hidden flex-none bg-[#A65D2E]">
                                <img alt="Coffee Review" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=80" />
                            </div>
                            <div className="space-y-1.5 py-1 w-full">
                                <div className="flex justify-between items-center w-full">
                                    <h4 className="font-bold text-[13px] text-[#2B361B]">Coastal Brews</h4>
                                    <span className="text-[9px] text-[#A8A29F] font-medium">1 week ago</span>
                                </div>
                                <div className="flex text-[#A65D2E]">
                                    {[1, 2, 3, 4].map((star) => (
                                        <svg key={star} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]">
                                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                        </svg>
                                    ))}
                                    {/* ดาวครึ่งดวง / ดาวเปล่า สำหรับคะแนนที่เหลือ */}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[14px] h-[14px] text-[#A65D2E]">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                    </svg>
                                </div>
                                <p className="text-[11px] text-[#7A7571] line-clamp-2 leading-snug">
                                    Perfect spot for morning reads. The flat white was creamy and well-balanced.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Profile;
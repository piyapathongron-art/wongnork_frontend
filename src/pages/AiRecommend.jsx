import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Sparkles,
    User,
    MapPin,
    Utensils,
    ArrowRight,
    Star,
    Coffee,
    Pizza,
    Flame,
    Trash2,
    MoreVertical,
    ChevronRight
} from 'lucide-react';
import { apiAiRecommend } from '../api/features.js';
import { toast } from 'react-toastify';
import useUserStore from '../stores/userStore.js';
import useAiStore from '../stores/aiStore.js';
import { useNavigate } from 'react-router';
import AuthModal from '../components/AuthModal';

const AiRecommend = () => {
    const { messages, addMessage, clearMessages } = useAiStore();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const scrollRef = useRef(null);
    const menuRef = useRef(null);
    const user = useUserStore((state) => state.user);
    const isLogin = useUserStore((state) => state.isLogin);
    const navigate = useNavigate();

    // Get location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    console.warn('Geolocation not allowed');
                }
            );
        }
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Check login on mount
    useEffect(() => {
        if (!isLogin) {
            setIsAuthModalOpen(true);
        }
    }, [isLogin]);

    const handleSend = async (customInput = null) => {
        if (!isLogin) {
            setIsAuthModalOpen(true);
            return;
        }

        const textToSend = customInput || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            text: textToSend
        };

        addMessage(userMessage);
        setInput('');
        setIsLoading(true);

        try {
            const response = await apiAiRecommend({
                prompt: textToSend,
                lat: location?.lat,
                lng: location?.lng
            });

            const aiResponse = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                ...response.data
            };

            addMessage(aiResponse);
        } catch (error) {
            console.error('AI Error:', error);
            toast.error('ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว');
            addMessage({
                id: (Date.now() + 1).toString(),
                type: 'ai',
                aiMessage: 'ขออภัยครับ ดูเหมือนผมจะเชื่อมต่อระบบขัดข้อง รบกวนลองใหม่อีกครั้งนะครับ',
                recommendations: []
            });
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="relative h-screen bg-[#FFF8EF] text-[#232415] font-sans overflow-hidden">
            {/* Glass Header Background */}
            <div className="absolute top-0 left-0 right-0 h-32 z-30 pointer-events-none">
                <div className="absolute inset-0 bg-[#FFF8EF]/80 backdrop-blur-xl" style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}></div>
            </div>

            {/* Header - Compact Single Line */}
            <header className="absolute top-0 left-0 right-0 px-6 pt-8 pb-4 flex items-center gap-4 z-40">
                <div className="flex flex-1 items-baseline gap-2 overflow-hidden">
                    <h1 className="text-xl font-bold text-[#182806] whitespace-nowrap drop-shadow-sm">Wongnork</h1>
                    <span className="text-sm font-light italic text-[#B86B25] whitespace-nowrap drop-shadow-sm">Bon Appétit</span>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 bg-white/50 backdrop-blur-md hover:bg-[#F2E8D9] rounded-full transition-colors text-[#182806] shadow-sm border border-[#F2E8D9]/50"
                    >
                        <MoreVertical size={20} />
                    </button>

                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: -10, y: 10 }}
                                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: -10, y: 10 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#F2E8D1] overflow-hidden z-50"
                            >
                                <button
                                    onClick={() => {
                                        clearMessages();
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-bold text-[#182806] hover:bg-[#FFF8EF] transition-colors"
                                >
                                    <Trash2 size={16} className="text-[#B86B25]" />
                                    ล้างประวัติการคุย
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* Chat History Container */}
            <div
                ref={scrollRef}
                className="absolute inset-0 overflow-y-auto px-6 pb-[260px] pt-28 space-y-8 no-scrollbar scroll-smooth"
            >
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, msgIdx) => (
                        <motion.div
                            key={msg.id}
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            {/* Message Bubble */}
                            <motion.div
                                variants={itemVariants}
                                className={`max-w-[90%] px-5 py-4 shadow-sm relative group ${msg.type === 'user'
                                    ? 'bg-[#ffffff] text-[#232415] rounded-[1.5rem] rounded-br-[0.5rem]'
                                    : 'bg-[#F2E8D9] text-[#182806] rounded-[1.5rem] rounded-bl-[0.5rem]'
                                    }`}
                            >
                                {msg.type === 'ai' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 bg-white rounded-full text-[#B86B25] shadow-sm">
                                            <Sparkles size={12} fill="currentColor" className='animate-pulse' />
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#B86B25]">Wongnork AI</span>
                                    </div>
                                )}

                                <p className={`text-[1rem] leading-relaxed ${msg.type === 'ai' ? 'font-medium' : ''}`}>
                                    {msg.type === 'user' ? msg.text : msg.aiMessage}
                                </p>
                            </motion.div>

                            {/* AI Recommendations */}
                            {msg.type === 'ai' && msg.recommendations && msg.recommendations.length > 0 && (
                                <div className="mt-6 w-full space-y-6">
                                    {msg.recommendations.map((rec, idx) => (
                                        <motion.div
                                            key={`${msg.id}-rec-${idx}`}
                                            variants={itemVariants}
                                            whileHover={{ y: -4 }}
                                            className="bg-white rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(24,40,6,0.06)] border border-[#F2E8D9]/40"
                                        >
                                            {/* Restaurant Hero Image */}
                                            {rec.recommendedMenus && rec.recommendedMenus[0]?.imageUrl && (
                                                <div className="relative h-40 w-full overflow-hidden">
                                                    <img
                                                        src={rec.recommendedMenus[0].imageUrl}
                                                        alt={rec.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                                                        <Star size={12} fill="#B86B25" className="text-[#B86B25]" />
                                                        <span className="text-[10px] font-bold text-[#182806]">Featured</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-[#182806] mb-0.5">
                                                            {rec.name}
                                                        </h3>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B86B25]">Recommended</span>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/restaurants/${rec.restaurantId}`)}
                                                        className="p-2.5 bg-[#182806] text-white rounded-full hover:bg-[#B86B25] transition-colors"
                                                    >
                                                        <ArrowRight size={18} />
                                                    </button>
                                                </div>

                                                <p className="text-[#2D3E1A] text-sm leading-relaxed italic opacity-80 mb-6">
                                                    "{rec.reason}"
                                                </p>

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#B86B25]">Signature Menus</h4>
                                                        <div className="h-[1px] flex-1 bg-[#F2E8D9]" />
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3">
                                                        {rec.recommendedMenus && rec.recommendedMenus.map((menu, mIdx) => (
                                                            <div
                                                                key={mIdx}
                                                                className="flex items-center gap-3 p-2.5 rounded-[1.2rem] bg-[#FFF8EF] border border-[#F2E8D9]"
                                                            >
                                                                {menu.imageUrl && (
                                                                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                                                                        <img
                                                                            src={menu.imageUrl}
                                                                            alt={menu.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <p className="text-xs font-bold text-[#182806]">{menu.name}</p>
                                                                    <p className="text-[10px] text-[#B86B25] font-black">
                                                                        ฿{menu.price.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 bg-[#F2E8D9] px-5 py-3 rounded-full w-fit shadow-sm"
                        >
                            <div className="flex gap-1">
                                {[0, 0.2, 0.4].map((d) => (
                                    <motion.div
                                        key={d}
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 1, delay: d }}
                                        className="w-1.5 h-1.5 bg-[#B86B25] rounded-full"
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B86B25] italic">
                                Thinking...
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Section - Adjusted for NavBar and UX requests */}
            <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
                {/* Glass Background */}
                <div className="absolute inset-0 bg-[#FFF8EF]/80 backdrop-blur-xl" style={{ maskImage: 'linear-gradient(to top, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent 100%)' }}></div>

                <div className="relative p-6 pb-32 pointer-events-auto">
                    <div className="max-w-4xl mx-auto">
                        {/* Helper Chips - Now set input instead of sending */}
                        <div
                            className="-mx-6 mb-2"
                            style={{
                                maskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)'
                            }}
                        >
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 px-6">
                                {[
                                    { label: 'ใกล้ฉัน', text: 'แนะนำร้านอาหารยอดนิยมใกล้ฉัน', icon: <MapPin size={14} /> },
                                    { label: 'สายชาบู', text: 'ช่วยแนะนำร้านชาบูที่คนรีวิวเยอะๆ หน่อย', icon: <Flame size={14} className="text-[#B86B25]" /> },
                                    { label: 'คาเฟ่ & ขนม', text: 'คาเฟ่ที่ถ่ายรูปสวยและมีขนมอร่อย', icon: <Coffee size={14} className="text-[#B86B25]" /> },
                                    { label: 'พิซซ่า', text: 'ร้านพิซซ่าเตาถ่านที่อร่อยที่สุด', icon: <Pizza size={14} className="text-[#B86B25]" /> }
                                ].map((chip) => (
                                    <motion.button
                                        key={chip.label}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setInput(chip.text)}
                                        className="whitespace-nowrap px-4 py-2 bg-white text-[#182806] rounded-full text-xs font-bold flex items-center gap-2 border border-[#F2E8D9] shadow-sm hover:border-[#B86B25]/30 transition-all"
                                    >
                                        {chip.icon} {chip.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="พิมพ์สิ่งที่อยากทาน..."
                                className="w-full bg-white border border-[#F2E8D9] rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-[#B86B25] focus:ring-4 focus:ring-[#B86B25]/5 text-[#182806] shadow-sm transition-all text-[15px]"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isLoading}
                                className={`absolute right-2 p-3 rounded-full transition-all flex items-center justify-center ${input.trim() && !isLoading
                                    ? 'bg-[#182806] text-white shadow-lg'
                                    : 'bg-[#F2E8D9] text-[#182806]/20'
                                    }`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Authentication Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                message="กรุณาล็อกอินเพื่อใช้งานผู้ช่วย AI แนะนำร้านอาหาร"
            />
        </div>
    );
};

export default AiRecommend;

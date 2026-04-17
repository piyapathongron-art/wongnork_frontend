import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, MapPin, Utensils, Info } from 'lucide-react';
import { apiAiRecommend } from '../api/features.js';
import { toast } from 'react-toastify';
import useUserStore from '../stores/userStore.js';

const AiRecommend = () => {
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            type: 'ai',
            aiMessage: 'สวัสดีครับ! ผมคือผู้ช่วย AI ของ Wongnork วันนี้อยากทานอะไรเป็นพิเศษไหมครับ? หรือให้ผมช่วยหาร้านอาหารใกล้คุณดี?',
            recommendations: []
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const scrollRef = useRef(null);
    const user = useUserStore((state) => state.user);

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

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            text: input
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await apiAiRecommend({
                prompt: currentInput,
                lat: location?.lat,
                lng: location?.lng
            });

            const aiResponse = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                ...response.data
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('AI Error:', error);
            toast.error('ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว');
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                aiMessage: 'ขออภัยครับ ดูเหมือนผมจะเชื่อมต่อระบบขัดข้อง รบกวนลองใหม่อีกครั้งนะครับ',
                recommendations: []
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    console.log(location)
    console.log(user)
    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#FFF8EF]  text-[#232415]  ">
            {/* Header - Editorial Style */}
            <header className="px-6 py-8 bg-[#FFF8EF]">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold  text-[#182806]"
                >
                    <span className='text-2xl'>Wongnork </span>  <br />
                    <span className="text-[#B86B25]">Bon Appétit, <span className='font-light'>{user.name.split(' ')[0]} </span> </span>
                </motion.h1>
                <p className="mt-2 text-[#2D3E1A] opacity-70">ผู้ช่วยส่วนตัวในการค้นหารสชาติที่ใช่สำหรับคุณ</p>
            </header>

            {/* Chat History Container */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-scroll px-4 mb-40 pb-5 space-y-4 scroll-smooth animate-fade-up"
                style={{ backgroundColor: '#FFF8EF' }}
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            {/* Message Bubble */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={`max-w-[85%] px-5 py-4 shadow-sm ${msg.type === 'user'
                                    ? 'bg-[#EBDDC9] text-[#232415] rounded-[1.5rem] rounded-br-[0.25rem]'
                                    : 'bg-[#F2E8D9] text-[#182806] rounded-[1.5rem] rounded-bl-[0.25rem]'
                                    }`}
                            >
                                {msg.type === 'ai' && (
                                    <div className="flex items-center gap-2 mb-2 text-[#B86B25]">
                                        <Sparkles size={16} fill="currentColor" />
                                        <span className="text-xs font-bold uppercase tracking-widest font-['Plus_Jakarta_Sans']">Wongnork Insights</span>
                                    </div>
                                )}

                                <p className="leading-relaxed">
                                    {msg.type === 'user' ? msg.text : msg.aiMessage}
                                </p>
                            </motion.div>

                            {/* AI Recommendations - Recipe/Restaurant Card Style */}
                            {msg.type === 'ai' && msg.recommendations && msg.recommendations.length > 0 && (
                                <div className="mt-4 w-full space-y-4">
                                    {msg.recommendations.map((rec, idx) => (
                                        <motion.div
                                            key={`${msg.id}-rec-${idx}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-[#FFFFFF] p-6 rounded-[1.5rem] border-none shadow-[0_12px_32px_rgba(45,62,26,0.06)]"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-[#182806]">
                                                    {rec.name}
                                                </h3>
                                                <div className="p-2 bg-[#F2E8D9] rounded-full text-[#B86B25]">
                                                    <Utensils size={18} />
                                                </div>
                                            </div>

                                            <p className="text-[#2D3E1A] text-sm leading-relaxed mb-6 italic">
                                                "{rec.reason}"
                                            </p>

                                            <div className="space-y-4">
                                                <p className="text-xs font-bold uppercase tracking-widest text-[#B86B25] flex items-center gap-2">
                                                    <Sparkles size={12} /> Recommended Menus
                                                </p>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {rec.recommendedMenus && rec.recommendedMenus.map((menu, mIdx) => (
                                                        <div 
                                                            key={mIdx}
                                                            className="flex items-center gap-3 p-2 rounded-xl bg-[#F2E8D9]/30 border border-[#F2E8D9]"
                                                        >
                                                            {menu.imageUrl && (
                                                                <img 
                                                                    src={menu.imageUrl} 
                                                                    alt={menu.name}
                                                                    className="w-16 h-16 rounded-lg object-cover shadow-sm"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-[#182806]">{menu.name}</p>
                                                                <p className="text-xs text-[#B86B25] font-semibold">
                                                                    ฿{menu.price.toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {rec.highlightMenu.map((menu, mIdx) => (
                                                        <span
                                                            key={mIdx}
                                                            className="px-3 py-1 bg-[#182806] text-[#FFF8EF] rounded-full text-[10px] font-medium"
                                                        >
                                                            {menu}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-[#B86B25]"
                        >
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                            <span className="text-xs italic ml-2">Curating your next meal...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Section - Glassmorphism */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-30 bg-[#FFF8EF]/80 backdrop-blur-[20px] z-10">
                <div className="max-w-4xl mx-auto relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="อยากทานอะไรดีครับ? เช่น 'หาร้านซูชิใกล้ฉัน'..."
                        className="w-full bg-[#F2E8D9] rounded-full py-4 pl-6 pr-16 focus:outline-none border-none text-[#182806] placeholder-[#2D3E1A]/40"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`absolute right-2 p-3 rounded-full transition-all ${input.trim() && !isLoading
                            ? 'bg-gradient-to-r from-[#914C02] to-[#B86B25] text-white shadow-lg scale-100'
                            : 'bg-[#2D3E1A]/10 text-[#2D3E1A]/30 scale-90'
                            }`}
                    >
                        <Send size={20} />
                    </button>
                </div>

                {/* Helper Chips */}
                <div className="max-w-4xl mx-auto mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    <button
                        onClick={() => setInput('แนะนำร้านอาหารยอดนิยมใกล้ฉัน')}
                        className="whitespace-nowrap px-4 py-1.5 bg-[#182806] text-[#FFF8EF] rounded-full text-xs font-medium flex items-center gap-1"
                    >
                        <MapPin size={12} /> ใกล้ฉัน
                    </button>
                    <button
                        onClick={() => setInput('ช่วยแนะนำร้านชาบูที่คนรีวิวเยอะๆ หน่อย')}
                        className="whitespace-nowrap px-4 py-1.5 bg-[#F2E8D9] text-[#182806] rounded-full text-xs font-medium"
                    >
                        🍲 สายชาบู
                    </button>
                    <button
                        onClick={() => setInput('คาเฟ่ที่ถ่ายรูปสวยและมีขนมอร่อย')}
                        className="whitespace-nowrap px-4 py-1.5 bg-[#F2E8D9] text-[#182806] rounded-full text-xs font-medium"
                    >
                        ☕ คาเฟ่
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiRecommend;

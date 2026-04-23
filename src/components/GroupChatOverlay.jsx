import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Smile, User as UserIcon } from 'lucide-react';
import useUserStore from '../stores/userStore';
import { getSocket } from '../services/socket';
import { apiGetMessage } from '../api/socketApi';
import { useSocket } from '../hooks/useSocket';

const GroupChatOverlay = ({ isOpen, onClose, party, user }) => {
    const [chatInput, setChatInput] = useState('');
    const [typingUser, setTypingUser] = useState(null);
    const chatEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const { token } = useUserStore();
    const { messages, setMessages } = useSocket(party?.id);
    const socket = getSocket(token);

    // 🌟 1. ดึงประวัติแชทและจัดการ Room
    useEffect(() => {
        if (!party?.id || !isOpen) return;

        socket.emit("join_room", party.id);

        const fetchMessages = async () => {
            try {
                const res = await apiGetMessage(party.id);
                setMessages(res.data.data || []);
            } catch (error) {
                console.error("Fetch messages failed:", error);
            }
        };
        fetchMessages();

        socket.on('display_typing', (data) => setTypingUser(data.userName));
        socket.on('hide_typing', () => setTypingUser(null));

        return () => {
            socket.off('display_typing');
            socket.off('hide_typing');
            socket.emit("leave_room", party.id);
        };
    }, [isOpen, party?.id, token]);

    // 🌟 2. Auto Scroll เมื่อมีข้อความใหม่
    useEffect(() => {
        if (isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, typingUser, isOpen]);

    // 🌟 3. จัดการการพิมพ์
    const handleInputChange = (e) => {
        setChatInput(e.target.value);
        if (!party?.id) return;
        socket.emit('typing', party.id);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', party.id);
        }, 2000);
    };

    // 🌟 4. ส่งข้อความ
    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!chatInput.trim() || !party?.id) return;

        socket.emit('send_message', {
            text: chatInput,
            partyId: party.id
        });

        socket.emit('stop_typing', party.id);
        setChatInput('');
    };

    if (!party) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[100] bg-[#FFF8F5] flex flex-col"
                >
                    {/* Header */}
                    <header className="px-6 py-4 flex items-center gap-4 border-b border-[#EEE2D1] bg-white/80 backdrop-blur-xl">
                        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-[#F7EAD7] transition-colors">
                            <ArrowLeft size={24} className="text-[#2B361B]" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-black text-[#2B361B] truncate">แชทกลุ่มปาร์ตี้</h2>
                            <p className="text-[10px] font-bold text-[#A65D2E] uppercase tracking-wider">{party.name}</p>
                        </div>
                    </header>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                        {messages.map((msg) => {
                            const isMe = msg.userId === user?.id;
                            const msgUser = msg.user || {};

                            return (
                                <div key={msg.id} className={`flex flex-col ${msg.type === 'SYSTEM' ? 'items-center' : (isMe ? 'items-end' : 'items-start')}`}>
                                    {msg.type === 'SYSTEM' ? (
                                        <span className="bg-[#EAD9CF]/50 text-[#8B837E] text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest">{msg.text}</span>
                                    ) : (
                                        <div className={`flex items-start gap-2 max-w-[90%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* 👤 Avatar - แสดงเฉพาะของคนอื่น */}
                                            {!isMe && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-100 shrink-0">
                                                    {msgUser.avatarUrl ? (
                                                        <img src={msgUser.avatarUrl} alt={msgUser.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#F7EAD7]">
                                                            <UserIcon size={14} className="text-[#BC6C25]" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* 💬 Message Bubble Area */}
                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                {!isMe && (
                                                    <span className="text-[10px] text-[#BC6C25] uppercase mb-1 ml-1">
                                                        {msgUser.name}
                                                    </span>
                                                )}
                                                <div className={`p-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${isMe ? 'bg-[#182806] text-white rounded-tr-none' : 'bg-white border border-[#EEE2D1] text-[#2B361B] rounded-tl-none'}`}>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[8px] font-bold text-gray-400 mt-1 px-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Typing Indicator */}
                        {typingUser && (
                            <div className="flex items-center gap-2 text-gray-400 px-1 animate-pulse">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                </div>
                                <span className="text-[9px] font-bold italic uppercase">{typingUser} is typing...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 bg-white border-t border-[#EEE2D1] pb-10">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-center gap-3 bg-[#FFF8F5] border border-[#EEE2D1] rounded-2xl p-2 focus-within:border-[#A65D2E] transition-all shadow-inner"
                        >
                            <button type="button" className="p-2 text-[#A8A29F] hover:text-[#A65D2E] transition-colors"><Smile size={20} /></button>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={handleInputChange}
                                placeholder="พิมพ์ข้อความคุยกับเพื่อนร่วมโต๊ะ..."
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[#2B361B]"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim()}
                                className="w-10 h-10 bg-[#182806] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GroupChatOverlay;

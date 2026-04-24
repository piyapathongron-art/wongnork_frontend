import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Smile, User as UserIcon, Image, Loader2, X as CloseIcon } from 'lucide-react';
import useUserStore from '../stores/userStore';
import useChatStore from '../stores/chatStore';
import { getSocket } from '../services/socket';
import { apiGetMessage } from '../api/socketApi';
import { useSocket } from '../hooks/useSocket';
import uploadCloudinary from '../utils/cloudinary';
import { toast } from 'react-toastify';

const GroupChatOverlay = ({ isOpen, onClose, party, user }) => {
    const [chatInput, setChatInput] = useState('');
    const [typingUser, setTypingUser] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // 🌟 New states for staged image
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const chatEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const imageInputRef = useRef(null);

    const { token } = useUserStore();
    const setChatOpen = useChatStore((state) => state.setChatOpen);
    const { messages, setMessages } = useSocket(party?.id);
    const socket = getSocket(token);

    // Sync chatStore open state
    useEffect(() => {
        if (isOpen && party?.id) {
            setChatOpen(party.id);
        } else {
            setChatOpen(false);
        }
        return () => setChatOpen(false);
    }, [isOpen, party?.id, setChatOpen]);

    // 🌟 1. ดึงประวัติแชท
    useEffect(() => {
        if (!party?.id || !isOpen) return;

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
        };
    }, [isOpen, party?.id, token]);

    // 🌟 2. Auto Scroll เมื่อมีข้อความใหม่
    useEffect(() => {
        if (isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, typingUser, isOpen]);

    const isPartyClosed = party?.status === 'COMPLETED' || party?.status === 'CANCELLED';

    // 🌟 3. จัดการการพิมพ์
    const handleInputChange = (e) => {
        if (isPartyClosed) return;
        setChatInput(e.target.value);
        if (!party?.id) return;
        socket.emit('typing', party.id);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', party.id);
        }, 2000);
    };

    // 🌟 4. ส่งข้อความ (Combined Image + Text)
    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();

        if ((!chatInput.trim() && !selectedImageFile) || isUploading || !party?.id || isPartyClosed) return;

        setIsUploading(true);
        try {
            let finalImageUrl = null;

            // 1. If there's a staged image, upload it first
            if (selectedImageFile) {
                finalImageUrl = await uploadCloudinary(selectedImageFile);
            }

            // 2. Emit the combined message
            socket.emit('send_message', {
                text: chatInput.trim() || null,
                imageUrl: finalImageUrl,
                partyId: party.id,
                type: "MESSAGE"
            });

            // 3. Clear all states
            socket.emit('stop_typing', party.id);
            setChatInput('');
            setSelectedImageFile(null);
            setImagePreview(null);
            if (imageInputRef.current) imageInputRef.current.value = "";

        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("เกิดข้อผิดพลาดในการส่งข้อความ");
        } finally {
            setIsUploading(false);
        }
    };

    // 🌟 5. เลือกรูป (Just preview, don't upload yet)
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file || !party?.id || isPartyClosed) return;

        if (file.size > 5 * 1024 * 1024) {
            return toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB");
        }

        setSelectedImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeSelectedImage = () => {
        setSelectedImageFile(null);
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
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
                    className="fixed inset-0 z-[100] bg-base-100 flex flex-col"
                >
                    {/* Header */}
                    <header className="px-6 py-4 flex items-center gap-4 border-b border-base-content/10 bg-base-100/80 backdrop-blur-xl shrink-0">
                        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-base-200 transition-colors">
                            <ArrowLeft size={24} className="text-base-content" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-black text-base-content truncate">แชทกลุ่มปาร์ตี้</h2>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{party.name}</p>
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
                                        <span className="bg-base-300/50 text-base-content/50 text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest text-center">{msg.text}</span>
                                    ) : (
                                        <div className={`flex items-start gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            {/* 👤 Avatar */}
                                            {!isMe && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-base-300 shrink-0">
                                                    {msgUser.avatarUrl ? (
                                                        <img src={msgUser.avatarUrl} alt={msgUser.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-base-200">
                                                            <UserIcon size={14} className="text-primary" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* 💬 Message Bubble Area */}
                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                {!isMe && (
                                                    <span className="text-[10px] text-primary uppercase mb-1 ml-1 font-bold">
                                                        {msgUser.name}
                                                    </span>
                                                )}

                                                {/* Image Rendering */}
                                                {msg.imageUrl && (
                                                    <div className={`mb-1 overflow-hidden rounded-2xl border-2 border-white shadow-sm bg-base-200 ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                                                        <img
                                                            src={msg.imageUrl}
                                                            alt="Chat attach"
                                                            className="max-w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(msg.imageUrl, '_blank')}
                                                        />
                                                    </div>
                                                )}

                                                {/* Text Rendering */}
                                                {msg.text && (
                                                    <div className={`p-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${isMe ? 'bg-primary text-primary-content rounded-tr-none' : 'bg-base-100 border border-base-content/10 text-base-content rounded-tl-none'}`}>
                                                        {msg.text}
                                                    </div>
                                                )}

                                                <span className="text-[8px] font-bold text-base-content/30 mt-1 px-1">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Typing Indicator */}
                        {typingUser && !isPartyClosed && (
                            <div className="flex items-center gap-2 text-base-content/30 px-1 animate-pulse">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-base-content/20 rounded-full"></div>
                                    <div className="w-1 h-1 bg-base-content/20 rounded-full"></div>
                                    <div className="w-1 h-1 bg-base-content/20 rounded-full"></div>
                                </div>
                                <span className="text-[9px] font-bold italic uppercase">{typingUser} is typing...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 bg-base-100 border-t border-base-content/5 pb-10 shrink-0">
                        {isPartyClosed ? (
                            <div className="w-full py-4 bg-base-200 rounded-2xl flex items-center justify-center border border-base-content/10">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-base-content/30 italic text-center px-4">
                                    — ปาร์ตี้นี้จบลงแล้ว (ปิดการสนทนา) —
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {/* 🖼️ Image Preview Area */}
                                <AnimatePresence>
                                    {imagePreview && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary shadow-lg group ml-2"
                                        >
                                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                            <button
                                                onClick={removeSelectedImage}
                                                className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full backdrop-blur-sm hover:bg-red-500 transition-colors"
                                            >
                                                <CloseIcon size={14} />
                                            </button>
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Loader2 size={20} className="animate-spin text-white" />
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-center gap-3 bg-base-200 border border-base-content/10 rounded-2xl p-2 focus-within:border-primary transition-all shadow-inner"
                                >
                                    <input
                                        type="file"
                                        ref={imageInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                    />
                                    <button
                                        type="button"
                                        disabled={isUploading}
                                        onClick={() => imageInputRef.current?.click()}
                                        className={`p-2 transition-colors ${imagePreview ? 'text-primary' : 'text-base-content/40 hover:text-primary'} disabled:opacity-50`}
                                    >
                                        <Image size={20} />
                                    </button>

                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={handleInputChange}
                                        placeholder={imagePreview ? "พิมพ์ข้อความกำกับรูป..." : "พิมพ์ข้อความคุยกับเพื่อน..."}
                                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-base-content"
                                    />
                                    <button
                                        type="submit"
                                        disabled={(!chatInput.trim() && !selectedImageFile) || isUploading}
                                        className="w-10 h-10 bg-primary text-primary-content rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GroupChatOverlay;

import React from 'react'
import { motion } from 'framer-motion';
import { Clock, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PartyDetailModal({ isJoinConfirmOpen, setIsJoinConfirmOpen, partyToJoin, isJoining, executeJoin }) {
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-base-200 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-base-300">

                <div className="relative h-40 bg-zinc-800">
                    <img src={partyToJoin.restaurant?.images?.find(img => img.isCover)?.url || partyToJoin.restaurant?.images?.[0]?.url || "https://picsum.photos/seed/restaurant/800/400"} alt={partyToJoin.restaurant?.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <button onClick={() => setIsJoinConfirmOpen(false)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors">
                        <CloseIcon size={20} />
                    </button>

                    <div className="absolute bottom-5 left-6 right-6">
                        <span className="bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest mb-2 inline-block shadow-sm">
                            {partyToJoin.restaurant?.category || "Restaurant"}
                        </span>
                        <h3 className="text-white font-black text-2xl truncate leading-tight drop-shadow-md">
                            {partyToJoin.restaurant?.name || "ร้านอาหาร"}
                        </h3>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                            {partyToJoin.name}
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
                                <Clock size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-base-content/60 uppercase">เวลานัดหมาย</p>
                                <p className="text-sm font-bold text-base-content">{new Date(partyToJoin.meetupTime).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-base-content/60 uppercase">สมาชิกปัจจุบัน</p>
                                    <p className="text-sm font-bold text-base-content">{partyToJoin.members?.length || 0} / {partyToJoin.maxParticipants} คน</p>
                                </div>

                                <div className="flex -space-x-2 overflow-hidden">
                                    {partyToJoin.members?.slice(0, 5).map((member) => (
                                        <div key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200">
                                            <img className="h-full w-full object-cover" src={member.user?.avatarUrl || `https://i.pravatar.cc/150?u=${member.userId}`} alt={member.user?.name} />
                                        </div>))}
                                    {(partyToJoin.members?.length || 0) > 5 && (
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-base-300 text-primary text-[10px] font-bold">
                                            +{(partyToJoin.members?.length || 0) - 5}</div>)}
                                </div>
                            </div>

                            {partyToJoin.details &&
                                (<div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-secondary/5 rounded-lg flex items-center justify-center text-secondary shrink-0">
                                        <AlertCircle size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-base-content/60 uppercase">หมายเหตุจากหัวหน้า</p>
                                        <p className="text-xs text-base-content/70 leading-relaxed italic">"{partyToJoin.details}"</p>
                                    </div>
                                </div>)}

                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={executeJoin}
                                disabled={isJoining}
                                className="w-full py-4 rounded-2xl font-black text-sm bg-secondary text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                {isJoining ? (<span className="loading loading-spinner loading-xs"></span>) : (<CheckCircle2 size={18} />)}ยืนยันเข้าร่วมปาร์ตี้
                            </button>

                            <button
                                onClick={() => setIsJoinConfirmOpen(false)}
                                disabled={isJoining}
                                className="w-full py-3 text-xs font-bold text-base-content/60 hover:bg-base-200 rounded-xl transition-colors">
                                เปลี่ยนใจแล้ว
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Clock, LucideChefHat, ChevronRight } from 'lucide-react';

const HistoryModal = ({ isHistoryOpen, setIsHistoryOpen, pastParties, onPartyClick, navigate, formatDate }) => {
    return (
        <AnimatePresence>
            {isHistoryOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsHistoryOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-base-100 rounded-t-[3rem] z-[101] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
                    >
                        <div className="w-12 h-1.5 bg-base-300 rounded-full mx-auto mt-4 mb-2 shrink-0" />

                        <header className="px-8 py-4 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-base-content tracking-tight">Past Parties</h2>
                                <p className="text-xs font-bold text-accent uppercase tracking-widest mt-0.5">Your History</p>
                            </div>
                            <button
                                onClick={() => setIsHistoryOpen(false)}
                                className="p-2 bg-base-200 rounded-full text-accent hover:bg-base-300 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto px-8 pb-12 pt-4 no-scrollbar">
                            {pastParties.length === 0 ? (
                                <div className="text-center py-20 opacity-40">
                                    <History size={48} className="mx-auto mb-4" />
                                    <p className="font-bold italic">ยังไม่มีประวัติปาร์ตี้</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pastParties.map((party, idx) => (
                                        <motion.div
                                            key={party.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => {
                                                onPartyClick(party);
                                            }}
                                            className="flex items-center gap-4 p-4 bg-base-100 rounded-[2rem] border border-base-content/10 shadow-sm cursor-pointer hover:border-accent/30 transition-all active:scale-[0.98]"
                                        >
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#2D3E25] shrink-0">
                                                <img
                                                    src={party.restaurant?.images?.[0]?.url || 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'}
                                                    alt={party.name}
                                                    className="w-full h-full object-cover opacity-80 grayscale-[30%]"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="font-bold text-base-content truncate text-sm">{party.name}</h4>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${party.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                                        {party.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-base-content/50">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {formatDate(party.meetupTime)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <LucideChefHat size={10} />
                                                        {party.restaurant?.name || 'Unknown'}
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-[#EEE2D1]" />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default HistoryModal;
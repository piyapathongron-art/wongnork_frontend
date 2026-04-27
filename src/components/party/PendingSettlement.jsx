import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Clock } from 'lucide-react'



export default function PendingSettlement({ user, pendingSettlementParties }) {
    const navigate = useNavigate();

    return (
        pendingSettlementParties.length > 0 && (
            <div className="flex flex-col gap-3 pt-2 mb-2">
                <h2 className="px-2 text-[10px] font-black tracking-[0.2em] text-primary uppercase">Action Required ⚠️</h2>
                <div className="flex flex-col gap-2">
                    {pendingSettlementParties.map(p => (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            key={`pending-${p.id}`}
                            onClick={() => navigate(`/party/${p.id}/split-bill`)}
                            className="bg-primary/10 border border-primary/20 p-4 rounded-3xl flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20"><Clock size={24} /></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1"><span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Settlement Required</span></div>
                                <h4 className="text-sm font-black text-base-content truncate">{p.name || "มื้ออาหารที่ผ่านมา"}</h4>
                                <p className="text-[10px] font-bold text-base-content/60 uppercase">กดเพื่อสรุปยอดและรีวิวร้านอาหาร</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        )
    )
}

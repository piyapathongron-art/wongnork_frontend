import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle2, Landmark, Download, Info } from 'lucide-react';
import { generatePromptPayPayload } from '../../utils/promptpay.util';
import { toast } from 'sonner';

const PaymentModal = ({ isOpen, onClose, leader, amount }) => {
    const canvasRef = useRef(null);
    if (!leader?.promptPayNumber) return null;

    const payload = generatePromptPayPayload(leader.promptPayNumber, amount);

    const handleCopyNumber = () => {
        navigator.clipboard.writeText(leader.promptPayNumber);
        toast.success("คัดลอกเบอร์โทรแล้ว");
    };

    const handleDownloadQR = () => {
        const canvas = document.getElementById('pp-qr-canvas');
        if (!canvas) return;

        const url = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `Wongnork-Pay-${leader.name}.png`;
        link.href = url;
        link.click();
        toast.info("บันทึกรูป QR Code เรียบร้อย");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 pb-10 shadow-2xl overflow-hidden"
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-[#182806]" />

                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Landmark size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#2B361B] tracking-tight">ชำระเงินให้หัวหน้า</h3>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Thai QR Payment</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tip Box */}
                        <div className="mb-6 p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                                หากใช้มือถือเครื่องนี้อยู่ ให้กด <span className="font-bold">"บันทึกรูปภาพ"</span> แล้วนำไปสแกนในแอปธนาคารของคุณได้เลยครับ
                            </p>
                        </div>

                        {/* QR Code Section */}
                        <div className="bg-white border-2 border-gray-50 rounded-[2.5rem] p-6 mb-6 flex flex-col items-center shadow-inner relative">
                            <div className="bg-white p-4 rounded-3xl shadow-sm mb-4 border border-gray-100">
                                <QRCodeCanvas id="pp-qr-canvas" value={payload} size={180} level="H" includeMargin={true} />
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-3xl font-black text-[#2B361B] mb-0.5">฿{Math.ceil(amount).toLocaleString()}</div>
                                <p className="text-[10px] font-bold text-[#8B837E] uppercase tracking-wider">ยอดที่ต้องโอน</p>
                            </div>

                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={handleDownloadQR}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#182806] text-white rounded-2xl text-xs font-bold shadow-md active:scale-95 transition-all"
                                >
                                    <Download size={14} /> บันทึกรูปภาพ
                                </button>
                                <button
                                    onClick={handleCopyNumber}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-[#2B361B] rounded-2xl text-xs font-bold shadow-sm active:scale-95 transition-all"
                                >
                                    <Copy size={14} /> คัดลอกเบอร์
                                </button>
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-[#F7FCF0] rounded-2xl border border-[#182806]/10">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shrink-0 shadow-sm">
                                    <img src={leader.avatarUrl || `https://i.pravatar.cc/150?u=${leader.id}`} className="w-full h-full object-cover" alt="leader" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-[#182806]/60 uppercase tracking-widest mb-0.5">ชื่อบัญชีหัวหน้า</p>
                                    <h4 className="font-black text-[#2B361B] truncate text-sm">{leader.promptPayName || leader.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-[11px] font-black text-[#182806]">{leader.promptPayNumber}</span>
                                    </div>
                                </div>
                                <CheckCircle2 size={24} className="text-green-500" />
                            </div>

                            <p className="text-[9px] text-[#8B837E] text-center px-4 leading-relaxed italic">
                                * ระบบจะทำการปัดเศษขึ้นเป็นจำนวนเต็มเพื่อความสะดวกในการโอนเงิน
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Receipt, Check, MessageSquare } from "lucide-react";
import { apiCreateParty } from "../../api/party";
import { z } from "zod";

const quickBillSchema = z.object({
  name: z.string().min(1, "กรุณาระบุชื่อบิลหรือสิ่งที่ต้องการหาร").max(100),
  details: z.string().max(500).optional(),
});

const CreateQuickBillModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(quickBillSchema),
    defaultValues: {
      name: "",
      details: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // 🌟 Quick Bill default values:
      // restaurantId = null, isPrivate = true, meetupTime = now
      const payload = {
        ...data,
        isPrivate: true,
        meetupTime: new Date().toISOString(),
        maxParticipants: 99, // default large for quick bills
        contactInfo: "-",
      };

      await apiCreateParty(null, payload);

      toast.success("สร้างบิลด่วนเรียบร้อย!");
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "สร้างบิลไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === "undefined") return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-base-100 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-base-content/10 relative z-10 overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Receipt size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-base-content tracking-tight leading-none">ตั้งบิลหารด่วน</h2>
                    <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-1">Quick Split Bill</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-base-200 rounded-full text-base-content/40 hover:text-base-content transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-primary ml-2 tracking-widest">
                  หัวข้อบิล / สิ่งที่ต้องการหาร
                </label>
                <input
                  {...register("name")}
                  className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                  placeholder="เช่น ค่าของจาก 7-11, ค่าพิซซ่า"
                />
                {errors.name && (
                  <p className="text-error text-[10px] mt-1 ml-2 font-bold uppercase tracking-tight">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-base-content/30 ml-2 tracking-widest">
                  รายละเอียดเพิ่มเติม (Optional)
                </label>
                <textarea
                  {...register("details")}
                  rows="2"
                  className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/20 transition-all outline-none resize-none"
                  placeholder="เช่น ฝากซื้อน้ำกับขนมนะ"
                />
              </div>

              <div className="bg-primary/5 p-4 rounded-2xl flex items-start gap-3 border border-primary/10">
                <MessageSquare size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-primary/70 leading-relaxed font-bold">
                    บิลนี้จะไม่ปรากฏในหน้าค้นหา <br/> คุณต้องก๊อปปี้ลิงก์ในหน้าบิลส่งให้เพื่อนเองครับ
                </p>
              </div>

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-primary text-primary-content font-black uppercase py-5 rounded-[2rem] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    <span>เริ่มการหารบิล</span>
                    <Check size={20} strokeWidth={3} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default CreateQuickBillModal;

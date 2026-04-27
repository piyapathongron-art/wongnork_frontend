
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"

function AccessDeniedModal({ setIsAccessDeniedModalOpen }) {
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsAccessDeniedModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-base-100 w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border border-base-content/10"
            >
                <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6 text-error">
                    <AlertCircle size={40} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-base-content mb-2 tracking-tight">Access Denied</h3>
                <p className="text-sm text-base-content/50 mb-8 leading-relaxed">
                    This party is private. <br /> Only table members can access the bill.
                </p>
                <button
                    onClick={() => setIsAccessDeniedModalOpen(false)}
                    className="w-full py-4 rounded-2xl font-black text-sm bg-base-content text-base-100 shadow-lg active:scale-[0.98] transition-all"
                >
                    Got it
                </button>
            </motion.div>
        </div>
    )
}

export default AccessDeniedModal
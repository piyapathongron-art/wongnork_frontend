import React from 'react'

export default function ErrorModal({ errorModal, setErrorModal }) {
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-base-200 w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl border border-base-300">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                    <AlertCircle size={40} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-black text-base-content mb-2 tracking-tight">{errorModal.title}</h3>
                <p className="text-sm text-base-content/60 mb-8 leading-relaxed px-2">{errorModal.message}</p>
                <button onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                    className="w-full py-4 rounded-2xl font-black text-sm bg-secondary text-white shadow-lg active:scale-[0.98] transition-all">เข้าใจแล้ว</button>
            </motion.div>
        </div>
    )
}

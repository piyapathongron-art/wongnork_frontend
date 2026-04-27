import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop({ showBackToTop, scrollToTop }) {
    return (
        <AnimatePresence>
            {showBackToTop && (
                <motion.button
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    onClick={scrollToTop}
                    className="absolute bottom-68 right-10 w-12 h-12 bg-base-200 border border-base-300 text-secondary rounded-full shadow-xl z-50 flex items-center justify-center active:scale-90 transition-transform pointer-events-auto">
                    <ArrowUp size={20} strokeWidth={3} />
                </motion.button>
            )}
        </AnimatePresence>
    )
}
import { motion } from "framer-motion"
import { X, Camera, Landmark } from "lucide-react"
import { useRef } from "react"

function EditProfileModal({ editForm, setEditForm, previewUrl, handleFileChange, handleSaveProfile, isSaving, handleCancelEdit }) {
    const fileInputRef = useRef(null);
    return (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCancelEdit}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative bg-base-100 w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl border-t sm:border border-base-content/10 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-primary tracking-tight">Edit Profile</h2>
                    <button onClick={handleCancelEdit} className="p-2 bg-base-200 rounded-full hover:bg-base-300 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-base-100 shadow-xl bg-base-300 ring-4 ring-primary/10 transition-all group-hover:ring-primary/20">
                                <img
                                    src={previewUrl || editForm.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'}
                                    alt="Avatar Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-lg border-2 border-base-100 group-hover:scale-110 transition-transform">
                                <Camera size={20} />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <p className="text-[10px] font-black text-base-content/30 uppercase mt-4 tracking-widest">Tap to change photo</p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase ml-2 tracking-widest">Display Name</label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                                placeholder="Your Display Name"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-primary uppercase ml-2 tracking-widest flex items-center gap-2">
                                    <Landmark size={12} /> PromptPay Number
                                </label>
                                <input
                                    type="text"
                                    value={editForm.promptPayNumber}
                                    onChange={(e) => setEditForm({ ...editForm, promptPayNumber: e.target.value })}
                                    className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                                    placeholder="08x-xxx-xxxx"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-base-content/30 uppercase ml-2 tracking-widest">Account Holder Name</label>
                                <input
                                    type="text"
                                    value={editForm.promptPayName}
                                    onChange={(e) => setEditForm({ ...editForm, promptPayName: e.target.value })}
                                    className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                                    placeholder="Firstname Lastname"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleCancelEdit}
                            className="flex-1 py-4 rounded-2xl font-black text-sm bg-base-200 text-base-content hover:bg-base-300 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex-[2] py-4 rounded-2xl font-black text-sm bg-primary text-white shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default EditProfileModal
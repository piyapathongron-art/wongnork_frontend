import React from 'react';
import { X, Loader2, Plus, Image as ImageIcon, Camera } from 'lucide-react';
import InputField from '../Form/InputField';
import { useMenuForm } from '../../hooks/useMenuForm';

const AddMenuModal = ({ isOpen, onClose, restaurantId, onSuccess }) => {
    const { form, handleUpload, onSubmit, isUploading, isSubmitting } = 
        useMenuForm(restaurantId, onSuccess, onClose);

    const previewUrl = form.watch("imageUrl");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-[#F7EAD7] dark:bg-zinc-900 w-full max-w-lg rounded-[40px] shadow-2xl flex flex-col max-h-[92vh] border border-[#BC6C25]/20 overflow-hidden">
                
                <ModalHeader onClose={onClose} />

                <div className="p-8 overflow-y-auto no-scrollbar">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        
                        <ImageUploadField 
                            previewUrl={previewUrl} 
                            isUploading={isUploading} 
                            onFileChange={(e) => handleUpload(e.target.files[0])} 
                        />
                        {form.formState.errors.imageUrl && (
                            <p className="text-red-500 text-[10px] font-bold ml-2 uppercase">
                                {form.formState.errors.imageUrl.message}
                            </p>
                        )}

                        <InputField label="Name" register={form.register("name")} error={form.formState.errors.name} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Price" type="number" register={form.register("price", {valueAsNumber: true})} error={form.formState.errors.price} />
                            <InputField label="Category" register={form.register("category")} error={form.formState.errors.category} />
                        </div>

                        <InputField label="Description" register={form.register("description")} error={form.formState.errors.description} isTextArea />

                        <SubmitButton isLoading={isSubmitting || isUploading} />
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components for better readability ---

const ModalHeader = ({ onClose }) => (
    <div className="p-6 border-b border-[#BC6C25]/10 flex items-center justify-between">
        <h2 className="text-xl font-black uppercase text-[#2B361B] dark:text-white leading-none">Add Menu Item</h2>
        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X /></button>
    </div>
);

const ImageUploadField = ({ previewUrl, isUploading, onFileChange }) => (
    <div className="relative w-full h-48 bg-zinc-100 dark:bg-black/40 rounded-3xl border-2 border-dashed border-[#D9C5B2] dark:border-zinc-800 overflow-hidden group">
        {previewUrl ? (
            <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white w-8 h-8" />
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                {isUploading ? <Loader2 className="animate-spin mb-2" /> : <ImageIcon className="mb-2 opacity-20 w-10 h-10" />}
                <p className="text-[10px] font-black uppercase tracking-widest">
                    {isUploading ? "Uploading..." : "Click to upload image"}
                </p>
            </div>
        )}
        <input type="file" accept="image/*" onChange={onFileChange} disabled={isUploading} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" />
    </div>
);

const SubmitButton = ({ isLoading }) => (
    <button
        disabled={isLoading}
        type="submit"
        className="w-full bg-[#BC6C25] text-[#F7EAD7] font-black uppercase py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all hover:brightness-110 disabled:opacity-50 mt-4"
    >
        {isLoading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Add to Menu</>}
    </button>
);

export default AddMenuModal;
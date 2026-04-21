import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { X, Loader2 } from 'lucide-react';
import { createPartySchema } from '../../validations/schema'


const CreatePartyModal = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: zodResolver(createPartySchema),
        defaultValues: {
            maxParticipants: 2,
            serviceCharge: 0,
            vat: 0
        }
    });

    const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
        const restaurantId = data.restaurantId; 
        
        await apiCreateParty(restaurantId, data); 
        toast.success("Party Created!");
        reset();
        onSuccess(); 
        onClose();
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to create party");
    } finally {
        setIsSubmitting(false);
    }
};

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#F7EAD7] dark:bg-zinc-900 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-[#BC6C25]/20">
                <div className="p-6 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black uppercase tracking-widest text-[#2B361B] dark:text-white">Create Party</h2>
                        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                            <X className="w-6 h-6 text-[#BC6C25]" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2">Party Name</label>
                            <input
                                {...register("name")}
                                className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#BC6C25] transition-all"
                                placeholder="Friday Dinner..."
                            />
                            {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-2 font-bold uppercase">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Max Participants */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2">Max People</label>
                                <input
                                    type="number"
                                    {...register("maxParticipants", { valueAsNumber: true })}
                                    className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm"
                                />
                                {errors.maxParticipants && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.maxParticipants.message}</p>}
                            </div>

                            {/* Meetup Time */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2">Time</label>
                                <input
                                    type="datetime-local"
                                    {...register("meetupTime")}
                                    className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm"
                                />
                                {errors.meetupTime && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.meetupTime.message}</p>}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2">Contact (Line/Tel)</label>
                            <input
                                {...register("contactInfo")}
                                className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm"
                            />
                            {errors.contactInfo && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.contactInfo.message}</p>}
                        </div>

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-[#BC6C25] text-[#F7EAD7] font-black uppercase py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm & Create"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePartyModal;
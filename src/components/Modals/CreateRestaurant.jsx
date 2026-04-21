import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { X, Loader2, MapPin, Store, Utensils } from 'lucide-react';
import { apiCreateRestaurant } from '../../api/restaurant';
import MapBox from '../MapBox';
import InputField from '../Form/InputField';

const CreateRestaurant = ({ isOpen, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        defaultValues: { 
            name: "",
            category: "", // Initialized as empty string for text input
            lat: 13.7563, 
            lng: 100.5018 
        }
    });

    // Watch coordinates for the UI display
    const [lat, lng] = [watch("lat"), watch("lng")];

    const handleMapClick = (e) => {
        setValue("lat", e.lngLat.lat);
        setValue("lng", e.lngLat.lng);
    };

    const processSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await apiCreateRestaurant(data);
            toast.success("Business Registered!");
            reset();
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Error creating restaurant");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="bg-[#F7EAD7] dark:bg-zinc-900 w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-[#BC6C25]/20">

                {/* INTERACTIVE MAP HEADER */}
                <div className="h-52 w-full relative flex-shrink-0">
                    <MapBox isDark={true} onClick={handleMapClick} />
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-[#BC6C25] text-[#F7EAD7] text-[9px] font-black uppercase rounded-full flex items-center gap-1 shadow-lg">
                        <MapPin className="w-3 h-3" /> Tap Map to Pin Location
                    </div>
                </div>

                {/* FORM CONTENT */}
                <div className="p-8 overflow-y-auto no-scrollbar pb-32">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-[#BC6C25] rounded-2xl shadow-xl">
                            <Store className="w-6 h-6 text-[#F7EAD7]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-[#2B361B] dark:text-white leading-none">Register Shop</h2>
                            <span className="text-[9px] font-bold text-[#BC6C25] uppercase tracking-widest">Business Portal</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(processSubmit)} className="space-y-5">
                        {/* RESTAURANT NAME */}
                        <InputField
                            label="Restaurant Name"
                            register={register("name", { required: "Name is required" })}
                            error={errors.name}
                            placeholder="e.g. The Velvet Hideaway"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* CATEGORY - TEXT INPUT ONLY */}
                            <InputField
                                label="Category"
                                register={register("category", { required: "Category is required" })}
                                error={errors.category}
                                placeholder="e.g. Jazz Bar, Cafe, Bistro"
                            />

                            {/* COORDINATES DISPLAY */}
                            <div className="text-left">
                                <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2 tracking-widest">
                                    Pin Coordinates
                                </label>
                                <div className="w-full bg-zinc-100 dark:bg-black/40 border-2 border-dashed border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-[10px] font-mono flex items-center justify-center text-zinc-500">
                                    {lat.toFixed(4)}, {lng.toFixed(4)}
                                </div>
                            </div>
                        </div>

                        {/* ADDRESS */}
                        <InputField
                            label="Full Address"
                            register={register("address")}
                            placeholder="Building, Street, District..."
                            isTextArea
                        />

                        {/* SUBMIT BUTTON */}
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-[#BC6C25] text-[#F7EAD7] font-black uppercase py-5 rounded-2xl shadow-xl active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-50 transition-all"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <>
                                    <Utensils className="w-5 h-5" />
                                    Launch Business
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRestaurant;
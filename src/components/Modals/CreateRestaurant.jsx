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
            category: "", 
            address: "",
            lat: 13.7563, 
            lng: 100.5018 
        }
    });

    // Watch values to display coordinates in the UI
    const [lat, lng] = [watch("lat"), watch("lng")];

    const handleMapClick = (e) => {
        // Update the form state with coordinates from the MapBox click
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
            <div className="bg-base-200  w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-primary/20">

                {/* INTERACTIVE MAP HEADER */}
                <div className="h-52 w-full relative flex-shrink-0">
                    <MapBox onClick={handleMapClick} />
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-primary text-base-200 text-[9px] font-black uppercase rounded-full flex items-center gap-1 shadow-lg pointer-events-none">
                        <MapPin className="w-3 h-3" /> Click map to place marker
                    </div>
                </div>

                <div className="p-8 overflow-y-auto no-scrollbar pb-32">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-primary rounded-2xl shadow-xl">
                            <Store className="w-6 h-6 text-base-200" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-base-content leading-none">Register Shop</h2>
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Business Portal</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(processSubmit)} className="space-y-5">
                        <InputField
                            label="Restaurant Name"
                            register={register("name", { required: "Name is required" })}
                            error={errors.name}
                            placeholder="e.g. The Velvet Hideaway"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* CATEGORY (STRING INPUT) */}
                            <InputField
                                label="Category"
                                register={register("category", { required: "Category is required" })}
                                error={errors.category}
                                placeholder="e.g. Jazz Bar"
                            />

                            {/* COORDINATES DISPLAY */}
                            <div className="text-left">
                                <label className="block text-[10px] font-black uppercase text-primary mb-1 ml-2 tracking-widest">Pin Coordinates</label>
                                <div className="w-full bg-zinc-100  border-2 border-dashed border-base-300  rounded-2xl px-4 py-3 text-[10px] font-mono flex items-center justify-center text-zinc-500">
                                    {lat.toFixed(4)}, {lng.toFixed(4)}
                                </div>
                            </div>
                        </div>

                        <InputField
                            label="Full Address"
                            register={register("address", { required: "Address is required" })}
                            error={errors.address}
                            placeholder="Building, Street, District..."
                            isTextArea
                        />

                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full bg-primary text-base-200 font-black uppercase py-5 rounded-2xl shadow-xl active:scale-95 flex items-center justify-center gap-3 mt-4 disabled:opacity-50 transition-all"
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
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, MapPin, Users, Clock, MessageSquare, Phone } from "lucide-react";
import { apiCreateParty } from "../../api/party";
import MapBox from "../MapBox";
import useRestaurantStore from "../../stores/restaurantStore";
import { createPartySchema } from "../../validations/schema";
import { useThemeStore } from "../../stores/themeStore";

const CreatePartyModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialRestaurant,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef(null);

  const now = new Date();
  const nowISO = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

  const filteredRestaurants = useRestaurantStore(
    (state) => state.filteredRestaurants,
  );

  const isDark =useThemeStore((state) => state.isDark)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createPartySchema),
    defaultValues: {
      maxParticipants: 2,
      serviceCharge: 0,
      vat: 0,
      meetupTime: nowISO,
      contactInfo: "",
      details: "",
    },
  });

  const selectedRestaurantId = watch("restaurantId");

  const handleMarkerSelect = (restaurant) => {
    setValue("restaurantId", String(restaurant.id));
  };

  useEffect(() => {
    if (selectedRestaurantId && mapRef.current) {
      const target = filteredRestaurants.find(
        (r) => String(r.id) === String(selectedRestaurantId),
      );
      if (target) {
        mapRef.current.flyToRestaurant(target);
      }
    }
  }, [selectedRestaurantId, filteredRestaurants]);

  useEffect(() => {
    if (isOpen && initialRestaurant?.id) {
      setValue("restaurantId", String(initialRestaurant.id));
      if (mapRef.current) {
        mapRef.current.flyToRestaurant(initialRestaurant);
      }
      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.flyToRestaurant(initialRestaurant);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, initialRestaurant, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {

      const { restaurantId, ...body } = data;

      if (!body.contactInfo) body.contactInfo = "-";

      await apiCreateParty(restaurantId, body);

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

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-base-100 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-base-content/10 flex flex-col max-h-[85vh] relative z-10"
          >
            {/* MAP SECTION */}
            <div className="h-28 w-full bg-base-300 relative flex-shrink-0">
              <MapBox
                ref={mapRef}
                isDark={isDark}
                onMarkerClick={handleMarkerSelect}
                disableAutoCenter={!!initialRestaurant}
                initialRestaurant={initialRestaurant}
              />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 p-1.5 bg-base-100/80 hover:bg-base-100 backdrop-blur-md rounded-full text-base-content shadow-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 z-10 px-3 py-1 bg-primary text-primary-content text-[9px] font-black uppercase rounded-full flex items-center gap-1.5 shadow-xl ring-2 ring-base-100/50">
                <MapPin className="w-3 h-3" />
                Select Place
              </div>
            </div>

            {/* FORM SECTION */}
            <div className="p-6 overflow-y-auto no-scrollbar pb-10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-base-content tracking-tight">Create Party</h2>
                  <p className="text-[9px] font-bold text-base-content/40 uppercase tracking-widest">Start a new meeting</p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 text-left"
              >
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[9px] font-black uppercase text-primary ml-1 tracking-widest">
                    <MapPin size={10} /> Meeting Point
                  </label>
                  <select
                    {...register("restaurantId")}
                    className="w-full bg-base-200 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select place or tap marker...</option>
                    {filteredRestaurants.map((res) => (
                      <option key={res.id} value={res.id}>
                        {res.name}
                      </option>
                    ))}
                  </select>
                  {errors.restaurantId && (
                    <p className="text-error text-[9px] mt-1 ml-2 font-bold uppercase">
                      {errors.restaurantId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[9px] font-black uppercase text-primary ml-1 tracking-widest">
                    <MessageSquare size={10} /> Party Name
                  </label>
                  <input
                    {...register("name")}
                    className="w-full bg-base-200 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                    placeholder="Ex: Chill Friday Night"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[9px] font-black uppercase text-primary ml-1 tracking-widest">
                    Description
                  </label>
                  <textarea
                    {...register("details")}
                    rows="2"
                    className="w-full bg-base-200 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 ring-primary/20 transition-all outline-none resize-none"
                    placeholder="Notes for members..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[9px] font-black uppercase text-primary ml-1 tracking-widest">
                      <Users size={10} /> Max Slots
                    </label>
                    <input
                      type="number"
                      {...register("maxParticipants", { valueAsNumber: true })}
                      className="w-full bg-base-200 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-[9px] font-black uppercase text-primary ml-1 tracking-widest">
                      <Clock size={10} /> Time
                    </label>
                    <input
                      type="datetime-local"
                      min={nowISO}
                      {...register("meetupTime")}
                      className="w-full bg-base-200 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-[9px] font-black uppercase text-primary ml-1 tracking-widest">
                    <Phone size={10} /> Contact <span className="text-base-content/20 font-normal normal-case">(Optional)</span>
                  </label>
                  <input
                    {...register("contactInfo")}
                    className="w-full bg-base-200 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 ring-primary/20 transition-all outline-none"
                    placeholder="Line ID, Tel, etc."
                  />
                </div>

                <div className="pt-2">
                  <button
                    disabled={isSubmitting || !selectedRestaurantId}
                    type="submit"
                    className="w-full bg-primary text-primary-content font-black uppercase py-4 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <>
                        <span>Start the Party</span>
                        <Users size={16} strokeWidth={3} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default CreatePartyModal;

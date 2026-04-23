import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { X, Loader2, MapPin } from "lucide-react";
import { apiCreateParty } from "../../api/party"; //
import MapBox from "../MapBox"; //
import useRestaurantStore from "../../stores/restaurantStore"; //

const CreatePartyModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialRestaurant,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mapRef = useRef(null);

  // Get restaurants from the shared store
  const filteredRestaurants = useRestaurantStore(
    (state) => state.filteredRestaurants,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    // resolver: zodResolver(yourSchemaHere),
    defaultValues: {
      maxParticipants: 2,
      serviceCharge: 0,
      vat: 0,
    },
  });

  const selectedRestaurantId = watch("restaurantId");

  // 1. Silent Marker Selection: Updates form state without a toast
  const handleMarkerSelect = (restaurant) => {
    setValue("restaurantId", String(restaurant.id));
  };

  // 2. Fly To Sync: Map follows the dropdown selection
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
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, initialRestaurant, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Match the API signature: apiCreateParty(restaurantId, body)
      const { restaurantId, ...body } = data;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#F7EAD7] dark:bg-zinc-900 w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl border border-[#BC6C25]/20 flex flex-col max-h-[92vh]">
        {/* MAP SECTION */}
        <div className="h-48 w-full bg-zinc-800 relative flex-shrink-0">
          <MapBox
            ref={mapRef}
            isDark={true}
            onMarkerClick={handleMarkerSelect}
            disableAutoCenter={true}
            initialRestaurant={initialRestaurant}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-4 z-10 px-3 py-1 bg-[#BC6C25] text-white text-[9px] font-black uppercase rounded-full flex items-center gap-1 shadow-lg">
            <MapPin className="w-3 h-3" />
            Interactive Map Selection
          </div>
        </div>

        {/* FORM SECTION - pb-32 prevents overlap with Nav Bar */}
        <div className="p-8 overflow-y-auto no-scrollbar pb-32">
          <h2 className="text-xl font-black uppercase tracking-widest text-[#2B361B] dark:text-white mb-6">
            Create Party
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 text-left"
          >
            {/* Location Dropdown */}
            <div>
              <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2">
                Meeting Point
              </label>
              <select
                {...register("restaurantId", {
                  required: "กรุณาเลือกสถานที่นัดหมาย",
                })}
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#BC6C25] appearance-none cursor-pointer"
              >
                <option value="">Select place or tap marker...</option>
                {filteredRestaurants.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.name}
                  </option>
                ))}
              </select>
              {errors.restaurantId && (
                <p className="text-red-500 text-[10px] mt-1 ml-2 font-bold uppercase">
                  {errors.restaurantId.message}
                </p>
              )}
            </div>

            {/* Party Name */}
            <div>
              <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2">
                Party Name
              </label>
              <input
                {...register("name")}
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#BC6C25]"
                placeholder="Chill at the Hideaway"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Max Participants */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2">
                  Max Slots
                </label>
                <input
                  type="number"
                  {...register("maxParticipants", { valueAsNumber: true })}
                  className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm"
                />
              </div>

              {/* Meetup Time */}
              <div>
                <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2">
                  Time
                </label>
                <input
                  type="datetime-local"
                  {...register("meetupTime")}
                  className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2">
                Contact Info
              </label>
              <input
                {...register("contactInfo")}
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#BC6C25]"
                placeholder="Line ID or Tel"
              />
            </div>

            {/* Submit Button */}
            <button
              disabled={isSubmitting || !selectedRestaurantId}
              type="submit"
              className="w-full bg-[#BC6C25] text-[#F7EAD7] font-black uppercase py-4 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "Start the Party"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePartyModal;

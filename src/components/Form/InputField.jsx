import React from 'react';

const InputField = ({ label, register, error, placeholder, isTextArea = false, type = "text" }) => (
    <div className="w-full text-left">
        <label className="block text-[10px] font-black uppercase text-[#BC6C25] mb-1 ml-2 tracking-widest">
            {label}
        </label>
        {isTextArea ? (
            <textarea
                {...register}
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#BC6C25] transition-colors resize-none placeholder:opacity-30"
                placeholder={placeholder}
                rows="3"
            />
        ) : (
            <input
                type={type}
                {...register}
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-[#D9C5B2] dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#BC6C25] transition-colors placeholder:opacity-30"
                placeholder={placeholder}
            />
        )}
        {error && (
            <p className="text-red-500 text-[9px] mt-1 ml-2 font-bold uppercase">
                {error.message}
            </p>
        )}
    </div>
);

export default InputField;
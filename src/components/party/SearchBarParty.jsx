import { Search } from 'lucide-react'
import React from 'react'

export default function SearchBarParty({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories }) {
    return (
        <>
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary">
                    <Search size={18} strokeWidth={2.5} />
                </div>
                <input type="text" placeholder="ค้นหาชื่อกลุ่ม หรือชื่อร้าน..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-base-200 border border-primary/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-base-content placeholder:text-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
            </div>


            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={`flex-none px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border 
                    ${selectedCategory === cat ? "bg-primary text-white border-secondary shadow-md" : "bg-base-200/50 text-primary border-primary/10 hover:bg-base-200"}`}>
                    {cat}
                </button>))}
            </div>
        </>
    )
}

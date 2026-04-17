import { create } from "zustand";

const getTheme = () => {
    if(typeof window === 'undefined'){
        return false
    }
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return savedTheme === 'dark' || (!savedTheme && prefersDark)
}

export const useThemeStore = create((set, get) => ({
    isDark: getTheme(),

    initTheme: () => {
        const dark = get().isDark
        document.documentElement.classList.toggle('dark', dark)
    },
    toggleTheme: () => {
        const current = get().isDark
        const nextDark = !current
        localStorage.setItem('theme', nextDark ? 'dark' : 'light')
        document.documentElement.classList.toggle('dark', nextDark)
        set({isDark: nextDark})
    }
}))
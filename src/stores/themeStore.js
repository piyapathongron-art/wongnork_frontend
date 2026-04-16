import { create } from "zustand";

const getTheme = () => {
    if(typeof window === 'undefined'){
        return false
    }
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
}

export const useThemeStore = create((set, get) => ({
    isDark: getTheme(),

    initThem: () => {
        const dark = get().isDark
        document.documentElement,classList.toggle('dark', dark)
    },
    toggleTheme: () => {
        const nextDark = !get().isDark
        document.documentElement.classList.toggle('dark', nextDark)
        localStorage.setItem('theme', nextDark ? 'dark' : 'light')
        set({isDark: nextDark})
    }
}))
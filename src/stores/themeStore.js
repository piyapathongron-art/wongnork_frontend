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
        const theme = dark ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', theme)
        document.documentElement.classList.toggle('dark', dark)
    },
    toggleTheme: () => {
        const nextDark = !get().isDark
        const nextTheme = nextDark ? 'dark' : 'light'
        
        localStorage.setItem('theme', nextTheme)
        document.documentElement.setAttribute('data-theme', nextTheme)
        document.documentElement.classList.toggle('dark', nextDark)
        set({isDark: nextDark})
    }
}))
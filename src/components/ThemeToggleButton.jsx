// Switch theme Button
import React from 'react'
import { useThemeStore } from '../stores/themeStore'
import { SunIcon, MoonIcon } from 'lucide-react'

function ThemeToggleButton() {
    const { isDark, toggleTheme } = useThemeStore()

    return (
        <button
            onClick={toggleTheme}
            // Removed absolute positioning so it follows the flex layout of the parent
            className="p-3 rounded-full shadow-lg transition-all duration-300 
                 bg-base-100 text-base-content
                 hover:scale-110 active:scale-95 border border-base-content/10 "
            aria-label="Toggle Theme"
        >
            {isDark ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6 text-gray-600" />}
        </button>
    );
}

export default ThemeToggleButton
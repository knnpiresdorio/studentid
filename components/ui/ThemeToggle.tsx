import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={className || "fixed bottom-4 right-4 z-[100] p-3 rounded-full bg-slate-900/10 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 shadow-lg text-slate-800 dark:text-white hover:bg-slate-900/20 dark:hover:bg-white/20 transition-all duration-300 active:scale-95"}
            title="Alternar Tema"
            aria-label="Alternar Tema"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};

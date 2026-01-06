import React from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-scrimba-slate transition-colors duration-300 font-inter">
            {/* ThemeToggle removed from here to be placed in specific headers */}
            {children}
        </div>
    );
};

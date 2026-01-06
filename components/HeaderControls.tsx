import React from 'react';
import { ThemeToggle } from './ui/ThemeToggle';
import { StudentNotificationToggle } from './StudentNotificationToggle';

interface HeaderControlsProps {
    className?: string;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({ className = "flex items-center gap-2" }) => {
    return (
        <div className={className}>
            <ThemeToggle className="relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100/80 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors backdrop-blur-sm border border-black/5 dark:border-white/5 shadow-sm" />
            <StudentNotificationToggle />
        </div>
    );
};

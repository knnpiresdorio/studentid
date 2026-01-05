import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'indigo';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
    const variants: Record<BadgeVariant, string> = {
        success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        danger: 'bg-red-500/10 text-red-500 border-red-500/20',
        info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        neutral: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

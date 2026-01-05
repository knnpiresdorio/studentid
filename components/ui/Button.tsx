import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'indigo';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed rounded-xl';

    const variants: Record<ButtonVariant, string> = {
        primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20',
        indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20',
        secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
        outline: 'bg-transparent text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50',
    };

    const sizes: Record<ButtonSize, string> = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3.5 text-base gap-2.5',
        icon: 'p-2',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    {leftIcon && <span className="flex items-center">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="flex items-center">{rightIcon}</span>}
                </>
            )}
        </button>
    );
};

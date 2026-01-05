import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, leftIcon, className = '', ...props }) => {
    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )
            }
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    className={`
                        w-full rounded-xl border transition-all outline-none
                        ${leftIcon ? 'pl-10' : 'px-4'} py-2.5 text-sm
                        ${error
                            ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-100'
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/10'
                        }
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            <textarea
                className={`
                    w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none min-h-[100px] resize-none
                    ${error
                        ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-100'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/10'
                    }
                    ${className}
                `}
                {...props}
            />
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
};

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    maxVisible?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    isLoading,
    maxVisible = 5
}) => {
    if (totalPages <= 1) return null;

    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
        pages.push(
            <button
                key={1}
                onClick={() => onPageChange(1)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}
            >
                1
            </button>
        );
        if (start > 2) pages.push(<span key="dots-start" className="text-slate-600 px-1">...</span>);
    }

    for (let i = start; i <= end; i++) {
        pages.push(
            <button
                key={i}
                onClick={() => onPageChange(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
            >
                {i}
            </button>
        );
    }

    if (end < totalPages) {
        if (end < totalPages - 1) pages.push(<span key="dots-end" className="text-slate-600 px-1">...</span>);
        pages.push(
            <button
                key={totalPages}
                onClick={() => onPageChange(totalPages)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}
            >
                {totalPages}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
            >
                <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1">
                {pages}
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

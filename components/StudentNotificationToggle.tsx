import React from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Bell, BellOff, Loader2 } from 'lucide-react';

export const StudentNotificationToggle: React.FC = () => {
    const { isSubscribed, subscribe, unsubscribe, loading, permission } = usePushNotifications();

    const handleToggle = () => {
        if (isSubscribed) {
            if (confirm('Disable notifications?')) {
                unsubscribe();
            }
        } else {
            subscribe();
        }
    };

    if (permission === 'denied') {
        return (
            <div className="flex items-center gap-2 text-sm text-red-500">
                <BellOff className="w-4 h-4" />
                <span>Notifications blocked</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            title={isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isSubscribed
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
        >
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSubscribed ? (
                <>
                    <Bell className="w-5 h-5 fill-indigo-500 text-indigo-500 dark:fill-indigo-400 dark:text-indigo-400" />
                    <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-scrimba-navy rounded-full shadow-sm animate-pulse z-10" />
                </>
            ) : (
                <Bell className="w-5 h-5" />
            )}
        </button>
    );
};

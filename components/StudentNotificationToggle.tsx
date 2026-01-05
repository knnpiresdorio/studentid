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
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSubscribed
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSubscribed ? (
                <Bell className="w-4 h-4 fill-current" />
            ) : (
                <Bell className="w-4 h-4" />
            )}
            {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
        </button>
    );
};

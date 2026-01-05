import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function usePushNotifications() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        }
    };

    const subscribe = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!VAPID_PUBLIC_KEY) {
                throw new Error('VAPID Public Key is missing.');
            }

            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult !== 'granted') {
                throw new Error('Permission denied');
            }

            const registration = await navigator.serviceWorker.ready;

            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });
            }

            // Save to Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error: dbError } = await supabase
                .from('push_subscriptions')
                .upsert({
                    user_id: user.id,
                    endpoint: subscription.endpoint,
                    keys: subscription.toJSON().keys,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'endpoint' });

            if (dbError) throw dbError;

            setIsSubscribed(true);
        } catch (err: any) {
            console.error('Failed to subscribe:', err);
            setError(err.message || 'Failed to subscribe');
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();

                // Remove from Supabase
                await supabase
                    .from('push_subscriptions')
                    .delete()
                    .eq('endpoint', subscription.endpoint);

                setIsSubscribed(false);
            }
        } catch (err: any) {
            console.error('Failed to unsubscribe:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { isSubscribed, subscribe, unsubscribe, loading, error, permission };
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

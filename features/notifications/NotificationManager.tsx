import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { Send, Bell, Info } from 'lucide-react';

export const NotificationManager: React.FC = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [url, setUrl] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; sent?: number; failed?: number; error?: string } | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('send-push', {
                body: {
                    title,
                    body,
                    url,
                    target_criteria: {} // Default to all subscribed users for now
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setResult({ success: true, sent: data.sent, failed: data.failed });
            setTitle('');
            setBody('');
        } catch (err: any) {
            console.error('Error sending push:', err);
            setResult({ success: false, error: err.message || 'Failed to send notification' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Push Notifications</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Send updates directly to students' devices.</p>
                </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Promoção Relâmpago!"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Message</label>
                    <textarea
                        required
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Ganhe 20% de desconto hoje..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Action URL (Optional)</label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="https://myschool.com/promo"
                    />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        Notifications will be sent to all users who have enabled push notifications on their device.
                        Partners are limited to 3 notifications per day.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sending ? 'Sending...' : (
                        <>
                            <Send className="w-4 h-4" />
                            Send Notification
                        </>
                    )}
                </button>

                {result && (
                    <div className={`p-4 rounded-lg text-sm ${result.success ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                        {result.success ? (
                            <p>Successfully queued notification! (Targeted: {result.sent})</p>
                        ) : (
                            <p>Error: {result.error}</p>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

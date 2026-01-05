/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV)
    allowlist = [/^\/$/];

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { allowlist }));

self.skipWaiting();
clientsClaim();

self.addEventListener('push', (event) => {
    const data = event.data?.json();
    if (!data) return;

    const { title, body, icon, url } = data;

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: icon || '/pwa-icon.svg',
            data: { url: url || '/' }
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window/tab
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});

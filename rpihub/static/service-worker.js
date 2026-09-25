/*
 * rpihub - simple RaspberryPi hub for other programs
 * Copyright (C) 2026 Jiri Skoda <developer@skodaj.cz>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; version 2 of the License.
 */

/** Name of the cache containing the application shell. */
const SHELL_CACHE = "rpihub-shell-v1";

/** Files required to start the application while offline. */
const SHELL_FILES = [
    "/",
    "/static/manifest.webmanifest",
    "/static/css/index.css",
    "/static/css/index.dark.css",
    "/static/css/index.mobile.css",
    "/static/css/index.tablet.css",
    "/static/fonts/selawik.css",
    "/static/fonts/ubuntumono.css",
    "/static/fonts/line-awesome.min.css",
    "/static/js/apiresponse.js",
    "/static/js/ui.js",
    "/static/js/languagebase.js",
    "/static/js/application.js",
    "/static/js/debug.js",
    "/static/js/api.js",
    "/static/js/index.js",
    "/static/rpihub.png",
    "/static/favicon.ico"
];

/**
 * Install the service worker and cache the application shell.
 * @returns {Promise<void>} Promise completed after installation.
 */
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            .then((cache) => cache.addAll(SHELL_FILES))
            .then(() => self.skipWaiting())
    );
});

/**
 * Remove old application-shell caches and activate immediately.
 * @returns {Promise<void>} Promise completed after activation.
 */
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key !== SHELL_CACHE)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

/**
 * Handle GET requests using network-first for dynamic content and
 * cache-first for static application resources.
 * @param {FetchEvent} event Browser fetch event.
 * @returns {void} Nothing is returned directly; the event is handled asynchronously.
 */
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) {
        return;
    }

    if (url.pathname.startsWith("/api/")) {
        event.respondWith(networkFirst(event.request));
    }
    else {
        event.respondWith(cacheFirst(event.request));
    }
});

/**
 * Try the network first and use a cached response when offline.
 * @param {Request} request Request to retrieve.
 * @returns {Promise<Response>} Network or cached response.
 */
async function networkFirst(request) {
    let reti;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(SHELL_CACHE);
            await cache.put(request, response.clone());
        }
        reti = response;
    }
    catch (error) {
        const cached = await caches.match(request);
        reti = cached || Response.error();
    }
    return reti;
}

/**
 * Use the cached application shell first and request the resource from the
 * network when it is not cached yet.
 * @param {Request} request Request to retrieve.
 * @returns {Promise<Response>} Cached or network response.
 */
async function cacheFirst(request) {
    let reti = await caches.match(request);
    if (!reti) {
        try {
            reti = await fetch(request);
            if (reti.ok) {
                const cache = await caches.open(SHELL_CACHE);
                await cache.put(request, reti.clone());
            }
        }
        catch (error) {
            reti = Response.error();
        }
    }
    return reti;
}

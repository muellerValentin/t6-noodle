/**
 * This file is the custom service worker for the PWA.
 * @author daniel.vollmer, valentin.müller
 */

import { clientsClaim } from "workbox-core";
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";

// Skip waiting and claim clients
self.skipWaiting();
clientsClaim();
// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
if (process.env.MODE !== "ssr" || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [/sw\.js$/, /workbox-(.)*\.js$/] }
    )
  );
}

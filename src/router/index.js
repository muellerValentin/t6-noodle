import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import Cookies from "js-cookie";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Navigation Guard

  Router.beforeEach(async (to, from, next) => {
    const user = readCookie();
    const userRole = user ? +user.role : 0;

    // Definiert, welche Rollen Zugriff auf welche Routen haben
    const routeRoles = {
      Studierende: [0, 1],
      Dozierende: [0, 2],
      Sekretariat: [0, 3],
      Alle: [0, 1, 2, 3],
    };

    // Vermeidung eines unendlichen Redirects zur Login-Seite
    if (to.name !== "Login" && from.name !== to.name) {
      // Prüft, ob der Benutzer Zugriff auf die angeforderte Seite hat, basierend auf seiner Rolle
      const allowedRoles = routeRoles[to.meta.role] || [];
      if (!allowedRoles.includes(userRole)) {
        // Wenn die Rolle des Benutzers keinen Zugriff gewährt, umleiten oder Fehler anzeigen
        // Umleitung zur Startseite oder zur Zugriff verweigert-Seite
        return next({ name: "asdf" }); // Ersetzen Sie "AccessDenied" durch den tatsächlichen Routennamen
      }
    }
    // Wenn alles in Ordnung ist, fortfahren zur angeforderten Seite
    next();
  });

  function readCookie() {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      console.log("Cookie gefunden");
      const user = parseCookie(userCookie);
      return user;
    } else {
      //router.push("/login"); // Leiten Sie den Benutzer zur Login-Seite um, wenn kein Cookie gefunden wird
    }
  }

  function parseCookie(cookie) {
    const decodedCookie = decodeURIComponent(cookie);
    const parsedCookie = JSON.parse(decodedCookie);
    console.log(parsedCookie);
    return parsedCookie;
  }

  return Router;
});

//{%22id%22:%22a7fe4bf919a5c471f083e2dc9db6ec8bc57ff2d818c49492204ecb704fb5ad5eb4ace500ad60f6d1de48e05c4f50570befd1493b74b21f2a5eca0e1b9a860409%22%2C%22role%22:%222%22}

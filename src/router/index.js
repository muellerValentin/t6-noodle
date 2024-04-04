import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { readCookie } from "src/helpers/util.js";

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

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

    if (to.name !== "Login" && from.name !== to.name) {
      const allowedRoles = routeRoles[to.meta.role] || [];
      if (!allowedRoles.includes(userRole)) {
        return next({ name: "AccessDenied" });
      }
    }

    next();
  });
  return Router;
});

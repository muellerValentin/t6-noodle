/**
 * This file contains all routes for the application.
 * @see https://router.vuejs.org/
 */
const routes = [
  {
    path: "/login",
    name: "Login",
    meta: { role: "Alle" },
    component: () => import("components/login/LoginView.vue"),
  },
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/main",
    name: "Main",
    meta: { role: "Alle" },

    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/overview",
        name: "Overview",
        meta: { role: "Alle" },
        component: () => import("components/overview/OverviewView.vue"),
      },
      {
        path: "/qr-test",
        name: "QrTest",
        meta: { role: "Sekretariat" },
        component: () => import("components/qr/QrReader.vue"),
      },
      {
        path: "/attendance-list",
        name: "AttendanceList",
        meta: { role: "Sekretariat" },
        component: () =>
          import("components/attendanceList/AttendanceListView.vue"),
      },
      {
        path: "/nfc-scan",
        name: "NfcScan",
        meta: { role: "Dozierende" },
        component: () => import("components/nfc/NfcReader.vue"),
      },
    ],
  },
  {
    path: "/register",
    name: "Register",
    meta: { role: "Alle" },
    component: () => import("components/register/RegisterView.vue"),
  },
  {
    path: "/access-denied",
    name: "AccessDenied",
    meta: { role: "Alle" },
    component: () => import("components/accessDenied/AccessDeniedView.vue"),
  },
  {
    path: "/:catchAll(.*)*",
    name: "ErrorNotFound",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;

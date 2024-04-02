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
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      {
        path: "/qr-test",
        name: "QrTest",
        meta: { role: "Sekretariat" },
        component: () => import("components/qr/QrReader.vue"),
      },
      {
        path: "attendance-list",
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
      {
        path: "/overview",
        name: "Overview",
        meta: { role: "Alle" },
        component: () => import("components/overview/OverviewView.vue"),
      },
    ],
  },
  {
    path: "/register",
    name: "Register",
    meta: { role: "Alle" },
    component: () => import("components/register/RegisterView.vue"),

    // Diese Route verwendet nicht das MainLayout, wodurch die Registrierungsseite ein eigenständiges Layout hat.
  },
  {
    path: "/asdf",
    name: "asdf",
    meta: { role: "Alle" },
    component: () => import("components/register/SharedRegisterView.vue"),

    // Diese Route verwendet nicht das MainLayout, wodurch die Registrierungsseite ein eigenständiges Layout hat.
  },

  // Always leave this as last one,firebase deploy
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    name: "ErrorNotFound",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;

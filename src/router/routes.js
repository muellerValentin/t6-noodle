const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      // Entfernen Sie die Registrierung von den Kinderrouten des MainLayout
    ],
  },
  {
    path: "/register",
    component: () => import("components/register/SharedRegisterView.vue"),

    // Diese Route verwendet nicht das MainLayout, wodurch die Registrierungsseite ein eigenständiges Layout hat.
  },
  {
    path: "/register2",
    component: () => import("components/register/RegisterView.vue"),

    // Diese Route verwendet nicht das MainLayout, wodurch die Registrierungsseite ein eigenständiges Layout hat.
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;

import {createRouter, createWebHistory} from "vue-router";
import i18n from "./i18n.js";
import productionManagementRoutes from "./production-management/presentation/production-management.routes.js";
import qualityYieldControlRoutes from "./quality-yield-control/presentation/quality-yield-control.routes.js";
import assetMaintenanceManagementRoutes from "./asset-maintenance-management/presentation/asset-maintenance-management.routes.js";

const pageNotFound = () => import("./shared/presentation/views/page-not-found.vue");

const routes = [
  {path: "/", redirect: "/production"},
  {path: "/production", children: productionManagementRoutes},
  {path: "/quality", children: qualityYieldControlRoutes},
  {path: "/assets", children: assetMaintenanceManagementRoutes},
  {path: "/:pathMatch(.*)*", name: "not-found", component: pageNotFound, meta: {titleKey: "page-not-found.title"}}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({top: 0})
});

/**
 * Sets the browser tab title of a route in the active language.
 * @param {import("vue-router").RouteLocationNormalized} route
 */
export function updateDocumentTitle(route) {
  const pageTitle = route.meta["titleKey"] ? i18n.global.t(route.meta["titleKey"]) : null;
  document.title = pageTitle ? `${pageTitle} | Molinex` : "Molinex | Operational Management Platform";
}

router.afterEach(to => updateDocumentTitle(to));

export default router;

import {createRouter, createWebHistory} from "vue-router";
import i18n from "./i18n.js";
import productionManagementRoutes from "./production-management/presentation/production-management.routes.js";
import qualityYieldControlRoutes from "./quality-yield-control/presentation/quality-yield-control.routes.js";
import assetMaintenanceManagementRoutes from "./asset-maintenance-management/presentation/asset-maintenance-management.routes.js";
import iamRoutes from "./iam/presentation/iam.routes.js";
import commercialEngagementRoutes from "./commercial-engagement/presentation/commercial-engagement.routes.js";
import {authenticationGuard} from "./iam/infrastructure/authentication.guard.js";
import {protectModuleRoutes as withAccess} from "./iam/infrastructure/access-rules.js";
import {Permission} from "./iam/domain/model/permission.js";

const pageNotFound = () => import("./shared/presentation/views/page-not-found.vue");
/** The home route never renders: the authentication guard always redirects it. */
const emptyView = {render: () => null};

const routes = [
  {path: "/", name: "home", component: emptyView, meta: {public: true}},
  ...commercialEngagementRoutes,
  ...iamRoutes,
  {path: "/production", children: withAccess(productionManagementRoutes, Permission.MANAGE_PRODUCTION)},
  {path: "/quality", children: withAccess(qualityYieldControlRoutes, Permission.MANAGE_PRODUCTION)},
  {path: "/assets", children: withAccess(assetMaintenanceManagementRoutes, Permission.MANAGE_MAINTENANCE)},
  {path: "/:pathMatch(.*)*", name: "not-found", component: pageNotFound, meta: {titleKey: "page-not-found.title", public: true}}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({top: 0})
});

router.beforeEach(authenticationGuard);

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

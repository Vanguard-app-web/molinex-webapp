import {createRouter, createWebHistory} from "vue-router";
import productionManagementRoutes from "./production-management/presentation/production-management.routes.js";
import qualityYieldControlRoutes from "./quality-yield-control/presentation/quality-yield-control.routes.js";
import assetMaintenanceManagementRoutes from "./asset-maintenance-management/presentation/asset-maintenance-management.routes.js";

const routes = [
  {path: "/production", children: productionManagementRoutes},
  {path: "/quality", children: qualityYieldControlRoutes},
  {path: "/assets", children: assetMaintenanceManagementRoutes}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;

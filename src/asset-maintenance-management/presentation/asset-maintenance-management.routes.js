import {MaintenanceType} from "../domain/model/maintenance-type.js";

const machineList = () => import('./views/machine-list.vue');
const machineForm = () => import('./views/machine-form.vue');
const maintenanceHistory = () => import('./views/maintenance-history.vue');
const maintenanceRecordForm = () => import('./views/maintenance-record-form.vue');

const assetMaintenanceManagementRoutes = [
    {path: '',                           redirect: {name: 'maintenance-machines'}},
    {path: 'machinery',                  name: 'maintenance-machines',       component: machineList,           meta: {titleKey: 'machines.title'}},
    {path: 'machinery/new',              name: 'maintenance-machine-new',    component: machineForm,           meta: {titleKey: 'machine-form.title'}},
    {path: 'maintenance',                name: 'maintenance-history',        component: maintenanceHistory,    meta: {titleKey: 'maintenance-history.title'}},
    {path: 'maintenance/preventive/new', name: 'maintenance-preventive-new', component: maintenanceRecordForm, meta: {titleKey: 'maintenance-form.preventive-title'},
        props: {type: MaintenanceType.PREVENTIVE}},
    {path: 'maintenance/corrective/new', name: 'maintenance-corrective-new', component: maintenanceRecordForm, meta: {titleKey: 'maintenance-form.corrective-title'},
        props: {type: MaintenanceType.CORRECTIVE}}
];

export default assetMaintenanceManagementRoutes;

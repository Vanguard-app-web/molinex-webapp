const productionOverview = () => import('./views/production-overview.vue');
const rawMaterialReceptionList = () => import('./views/raw-material-reception-list.vue');
const rawMaterialReceptionForm = () => import('./views/raw-material-reception-form.vue');
const productionBatchList = () => import('./views/production-batch-list.vue');
const productionBatchForm = () => import('./views/production-batch-form.vue');
const productionRecordList = () => import('./views/production-record-list.vue');
const productionRecordForm = () => import('./views/production-record-form.vue');
const productionHistory = () => import('./views/production-history.vue');

const productionManagementRoutes = [
    {path: '',                 name: 'production-overview',      component: productionOverview,       meta: {titleKey: 'production-overview.title'}},
    {path: 'receptions',       name: 'production-receptions',    component: rawMaterialReceptionList, meta: {titleKey: 'receptions.title'}},
    {path: 'receptions/new',   name: 'production-reception-new', component: rawMaterialReceptionForm, meta: {titleKey: 'reception-form.title'}},
    {path: 'batches',          name: 'production-batches',       component: productionBatchList,      meta: {titleKey: 'batches.title'}},
    {path: 'batches/new',      name: 'production-batch-new',     component: productionBatchForm,      meta: {titleKey: 'batch-form.title'}},
    {path: 'records',          name: 'production-records',       component: productionRecordList,     meta: {titleKey: 'production-records.title'}},
    {path: 'records/new',      name: 'production-record-new',    component: productionRecordForm,     meta: {titleKey: 'production-record-form.new-title'}},
    {path: 'records/:id/edit', name: 'production-record-edit',   component: productionRecordForm,     meta: {titleKey: 'production-record-form.edit-title'}},
    {path: 'history',          name: 'production-history',       component: productionHistory,        meta: {titleKey: 'production-history.title'}}
];

export default productionManagementRoutes;

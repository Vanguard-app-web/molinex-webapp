const qualityAssessmentList = () => import('./views/quality-assessment-list.vue');
const qualityAssessmentForm = () => import('./views/quality-assessment-form.vue');
const wasteRecordList = () => import('./views/waste-record-list.vue');
const wasteRecordForm = () => import('./views/waste-record-form.vue');

const qualityYieldControlRoutes = [
    {path: '',                name: 'quality-assessments',    component: qualityAssessmentList, meta: {titleKey: 'quality-assessments.title'}},
    {path: 'assessments/new', name: 'quality-assessment-new', component: qualityAssessmentForm, meta: {titleKey: 'quality-assessment-form.title'}},
    {path: 'waste',           name: 'quality-waste',          component: wasteRecordList,       meta: {titleKey: 'waste-records.title'}},
    {path: 'waste/new',       name: 'quality-waste-new',      component: wasteRecordForm,       meta: {titleKey: 'waste-record-form.title'}}
];

export default qualityYieldControlRoutes;

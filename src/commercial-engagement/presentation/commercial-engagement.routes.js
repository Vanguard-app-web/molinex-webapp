const valueProposition = () => import('./views/value-proposition.vue');
const planCatalog = () => import('./views/plan-catalog.vue');
const commercialInquiryForm = () => import('./views/commercial-inquiry-form.vue');

/**
 * Commercial Engagement routes, with absolute paths. All of them are public: visitors can browse
 * the offer and ask for contact without signing in.
 */
const commercialEngagementRoutes = [
    {path: '/value-proposition', name: 'commercial-value-proposition', component: valueProposition,
        meta: {titleKey: 'value-proposition.title', public: true}},
    {path: '/plans', name: 'commercial-plans', component: planCatalog,
        meta: {titleKey: 'plan-catalog.title', public: true}},
    {path: '/contact', name: 'commercial-inquiry', component: commercialInquiryForm,
        meta: {titleKey: 'commercial-inquiry-form.title', public: true}}
];

export default commercialEngagementRoutes;

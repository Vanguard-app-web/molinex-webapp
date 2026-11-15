import {Permission} from "../domain/model/permission.js";

const signInForm = () => import('./views/sign-in-form.vue');
const userForm = () => import('./views/user-form.vue');
const userList = () => import('./views/user-list.vue');
const roleAssignmentForm = () => import('./views/role-assignment-form.vue');
const profileView = () => import('./views/profile-view.vue');
const accessDenied = () => import('./views/access-denied.vue');

/**
 * Identity and Access Management routes, with absolute paths. The `meta` of each route is read by
 * the authentication guard: `guestOnly` for visitors, `permission` for administrators, and
 * nothing for any signed-in user.
 */
const iamRoutes = [
    {path: '/sign-in',  name: 'iam-sign-in',  component: signInForm, meta: {titleKey: 'sign-in-form.title', guestOnly: true}},
    {path: '/sign-up',  name: 'iam-sign-up',  component: userForm,   props: {mode: 'sign-up'}, meta: {titleKey: 'user-form.title-sign-up', guestOnly: true}},
    {path: '/profile',  name: 'iam-profile',  component: profileView, meta: {titleKey: 'profile-view.title'}},
    {path: '/users',    name: 'iam-users',    component: userList, meta: {titleKey: 'user-list.title', permission: Permission.MANAGE_USERS}},
    {path: '/users/new', name: 'iam-user-new', component: userForm, props: {mode: 'create'},
        meta: {titleKey: 'user-form.title-create', permission: Permission.MANAGE_USERS}},
    {path: '/users/:id/edit', name: 'iam-user-edit', component: userForm, props: {mode: 'edit'},
        meta: {titleKey: 'user-form.title-edit', permission: Permission.MANAGE_USERS}},
    {path: '/users/:id/role', name: 'iam-user-role', component: roleAssignmentForm,
        meta: {titleKey: 'role-assignment-form.title', permission: Permission.MANAGE_USERS}},
    {path: '/access-denied', name: 'access-denied', component: accessDenied, meta: {titleKey: 'access-denied.title'}}
];

export default iamRoutes;

import {Permission} from "../domain/model/permission.js";
import {RoleType} from "../domain/model/role-type.js";

/**
 * Pure access rules shared by the router guard and the interface. They depend on neither the
 * store nor the router, so they can be reasoned about and tested on their own.
 *
 * Router meta understood by the rules:
 * - `public`: anyone may open the route.
 * - `guestOnly`: only visitors without a session (sign-in and sign-up).
 * - `permission`: a Permission the signed-in user must hold. Without it, any signed-in user passes.
 * Routes with none of these require a signed-in user.
 */

/**
 * @param {Record<string, unknown>} meta the meta of the target route.
 * @param {import('../domain/model/authenticated-session.js').AuthenticatedSession|null} session
 * @returns {boolean} true when the route may be activated.
 */
export function canActivate(meta, session) {
    if (meta.guestOnly) return !session;
    if (meta.public) return true;
    if (!session?.isAuthenticated()) return false;
    return !meta.permission || session.allows(meta.permission);
}

/**
 * Protects the routes of an operational module. Reading needs VIEW_OPERATIONAL_INFORMATION; the
 * routes that register or edit data (a `new` or `edit` segment) need the module's manage permission.
 * The modules keep their own route files untouched.
 * @param {import('vue-router').RouteRecordRaw[]} moduleRoutes
 * @param {string} managePermission a Permission.
 */
export function protectModuleRoutes(moduleRoutes, managePermission) {
    const changesData = path => /(^|\/)(new|edit)(\/|$)/.test(path);
    return moduleRoutes.map(route => ({
        ...route,
        meta: {...route.meta, permission: changesData(route.path) ? managePermission : Permission.VIEW_OPERATIONAL_INFORMATION},
    }));
}

/**
 * First screen of a session: the module the role works in, or the profile when the session
 * cannot read operational information.
 * @param {import('../domain/model/authenticated-session.js').AuthenticatedSession|null} session
 * @returns {import('vue-router').RouteLocationRaw}
 */
export function landingRoute(session) {
    if (!session) return {name: 'commercial-value-proposition'};
    if (!session.allows(Permission.VIEW_OPERATIONAL_INFORMATION)) return {name: 'iam-profile'};
    return session.role.type === RoleType.MAINTENANCE_TECHNICIAN ? {name: 'maintenance-machines'} : {name: 'production-overview'};
}

/**
 * Accepts only an in-application path as a post-sign-in destination, so a crafted link cannot
 * send the user to another site.
 * @param {unknown} value the `redirect` query parameter.
 * @returns {string|null}
 */
export function safeRedirectPath(value) {
    if (typeof value !== 'string') return null;
    return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : null;
}

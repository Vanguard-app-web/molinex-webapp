import useIamStore from "../application/iam.store.js";
import {canActivate, landingRoute, safeRedirectPath} from "./access-rules.js";

export {canActivate, landingRoute, safeRedirectPath};

/**
 * Router guard (`router.beforeEach`). It waits for the stored session to be recovered, then lets
 * the user through, sends visitors to sign-in (remembering where they were going) or shows the
 * access-denied page to signed-in users who lack the permission. The rules live in access-rules.js.
 * @param {import('vue-router').RouteLocationNormalized} to
 */
export async function authenticationGuard(to) {
    const iam = useIamStore();
    await iam.restoreSession();
    const session = iam.currentSession;

    if (to.name === 'home') return landingRoute(session);
    if (canActivate(to.meta, session)) return true;
    if (to.meta.guestOnly) return safeRedirectPath(to.query.redirect) ?? landingRoute(session);
    if (!session) return {name: 'iam-sign-in', query: {redirect: to.fullPath}};
    return {name: 'access-denied', query: {from: to.fullPath}};
}

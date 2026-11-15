import {watch} from "vue";
import {useRouter} from "vue-router";
import useIamStore from "../../application/iam.store.js";

/**
 * When a session that was open ends (sign-out, or the API rejecting the token) the application
 * reloads at the sign-in page. The reload discards every private piece of data the other
 * modules still hold in memory, and the page explains why the session ended.
 */
export function useSessionEndRedirect() {
    const iam = useIamStore();
    const router = useRouter();

    watch(() => iam.isAuthenticated, (isAuthenticated, wasAuthenticated) => {
        if (!wasAuthenticated || isAuthenticated) return;
        const reason = iam.sessionEndReason ?? 'session-expired';
        window.location.assign(router.resolve({name: 'iam-sign-in', query: {reason}}).href);
    });
}

import {computed} from "vue";
import {useRouter} from "vue-router";
import useIamStore from "../../application/iam.store.js";
import {canActivate} from "../../infrastructure/access-rules.js";

/**
 * Access checks for the interface. They only decide what to show; the router guard and the API
 * enforce access independently.
 */
export function useAccessControl() {
    const iam = useIamStore();
    const router = useRouter();

    const session = computed(() => iam.currentSession);

    /** @param {string} permission a Permission. */
    const can = permission => iam.hasPermission(permission);

    /**
     * Whether a link should be offered. Visitors still see links to protected routes (following
     * one leads to sign-in); signed-in users never see a link they cannot use.
     * @param {import('vue-router').RouteLocationRaw} location
     */
    const canOffer = location => {
        if (!session.value) return true;
        try {
            return canActivate(router.resolve(location).meta, session.value);
        } catch {
            return true;
        }
    };

    return {session, can, canOffer};
}

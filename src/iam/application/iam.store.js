import {defineStore} from "pinia";
import {computed, ref, shallowRef} from "vue";
import {IamApi} from "../infrastructure/iam-api.js";
import {SignInAssembler} from "../infrastructure/assemblers/sign-in.assembler.js";
import {SignUpAssembler} from "../infrastructure/assemblers/sign-up.assembler.js";
import {UserAssembler} from "../infrastructure/assemblers/user.assembler.js";
import {iamInterceptor} from "../infrastructure/iam-interceptor.js";
import {tokenStorage} from "../infrastructure/token-storage.js";
import {AuthenticatedSession} from "../domain/model/authenticated-session.js";
import {User} from "../domain/model/user.entity.js";
import {Role} from "../domain/model/role.js";
import {roleTypes} from "../domain/model/role-type.js";
import {permissions as allPermissions} from "../domain/model/permission.js";
import {ApiErrorHandler} from "../../shared/infrastructure/api-error-handler.js";

const iamApi = new IamApi();

/** @param {{value: string}|string|null|undefined} id an identifier Value Object or its raw value. */
const idValueOf = id => (id === null || id === undefined ? null : String(id.value ?? id));

/**
 * Application state of Identity and Access Management: the active session and its user, the user
 * directory used by administrators, and the roles and permissions the application knows.
 */
const useIamStore = defineStore('iam', () => {
    const currentSession = shallowRef(null);
    const currentUser = shallowRef(null);
    const users = shallowRef([]);
    const usersLoaded = ref(false);
    /** @type {import('vue').Ref<{operation: string, message: string}[]>} */
    const errors = ref([]);
    /** Why the last session ended: 'signed-out' or 'session-expired'; null while none ended. */
    const sessionEndReason = ref(null);

    const roles = computed(() => roleTypes.map(type => Role.of(type)));
    const permissions = computed(() => [...allPermissions]);
    const isAuthenticated = computed(() => currentSession.value?.isAuthenticated() ?? false);
    const usersById = computed(() => new Map(users.value.map(user => [user.id.value, user])));

    let restoration = null;

    function addErrors(operation, messages) {
        errors.value = [...errors.value, ...messages.map(message => ({operation, message}))];
    }

    function clearErrors(operation) {
        errors.value = operation ? errors.value.filter(error => error.operation !== operation) : [];
    }

    function hasErrors(operation) {
        return errors.value.some(error => error.operation === operation);
    }

    /** @param {string} permission a Permission. */
    function hasPermission(permission) {
        return currentSession.value?.allows(permission) ?? false;
    }

    function userById(id) {
        const key = idValueOf(id);
        if (key !== null && idValueOf(currentUser.value?.id) === key) return currentUser.value;
        return usersById.value.get(key) ?? null;
    }

    /** Drops the session and every piece of private data the store holds. */
    function clearSession(reason = null) {
        tokenStorage.clear();
        currentSession.value = null;
        currentUser.value = null;
        users.value = [];
        usersLoaded.value = false;
        errors.value = [];
        sessionEndReason.value = reason;
    }

    // The API rejected the token that was sent (expired, revoked or unknown): the session is over.
    iamInterceptor.setUnauthorizedListener(() => {
        if (currentSession.value || tokenStorage.get()) clearSession('session-expired');
    });

    function replaceUser(user) {
        users.value = users.value.map(candidate => (candidate.id.equals(user.id) ? user : candidate));
    }

    /**
     * Recovers the session after a page reload from the stored token. Safe to call many times: the
     * check runs once, and again only after a failure that was not an authentication rejection.
     */
    function restoreSession() {
        restoration ??= (async () => {
            const token = tokenStorage.get();
            if (!token || currentSession.value) return;
            try {
                const response = await iamApi.getProfile();
                const user = UserAssembler.toEntity(response.data);
                currentUser.value = user;
                currentSession.value = new AuthenticatedSession({userId: user.id, token, role: user.role});
            } catch (error) {
                if (error?.response?.status === 401) {
                    clearSession();
                } else {
                    addErrors('restore-session', ApiErrorHandler.toMessages(error));
                    restoration = null;
                }
            }
        })();
        return restoration;
    }

    /**
     * Authenticates with email and password. Nothing but the access token is kept; the password
     * is only part of the request.
     * @param {import('./sign-in.command.js').SignInCommand} command
     * @returns {Promise<AuthenticatedSession|null>} the session, or null when it failed.
     */
    async function signIn(command) {
        clearErrors('sign-in');
        clearErrors('restore-session');
        try {
            const response = await iamApi.signIn(SignInAssembler.toRequest(command));
            const session = SignInAssembler.toSession(response.data);
            tokenStorage.save(session.token);
            try {
                const profile = await iamApi.getProfile();
                currentUser.value = UserAssembler.toEntity(profile.data);
            } catch (error) {
                tokenStorage.clear();
                throw error;
            }
            currentSession.value = session;
            sessionEndReason.value = null;
            restoration = Promise.resolve();
            return session;
        } catch (error) {
            addErrors('sign-in', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    /**
     * Registers an account through the public sign-up. The visitor is not signed in afterwards.
     * @param {import('./sign-up.command.js').SignUpCommand} command
     * @returns {Promise<User|null>}
     */
    async function signUp(command) {
        clearErrors('sign-up');
        try {
            const response = await iamApi.signUp(SignUpAssembler.toRequest(command));
            return SignUpAssembler.toEntity(response.data);
        } catch (error) {
            addErrors('sign-up', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    /**
     * Ends the session: the API invalidates the token and the store drops everything private.
     * The local session ends even when the API cannot be reached.
     */
    async function signOut() {
        clearErrors('sign-out');
        try {
            await iamApi.signOut();
        } catch (error) {
            if (error?.response?.status !== 401) addErrors('sign-out', ApiErrorHandler.toMessages(error));
        } finally {
            clearSession('signed-out');
        }
    }

    async function fetchUsers() {
        clearErrors('fetch-users');
        try {
            const response = await iamApi.getUsers();
            users.value = UserAssembler.toEntities(response);
            usersLoaded.value = true;
        } catch (error) {
            addErrors('fetch-users', ApiErrorHandler.toMessages(error));
        }
    }

    /**
     * Registers a user with a chosen role (administrators only).
     * @param {import('./register-user.command.js').RegisterUserCommand} command
     * @returns {Promise<User|null>}
     */
    async function registerUser(command) {
        clearErrors('register-user');
        try {
            const response = await iamApi.createUser(UserAssembler.toRegisterRequest(command));
            const user = UserAssembler.toEntity(response.data);
            users.value = [...users.value, user];
            return user;
        } catch (error) {
            addErrors('register-user', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    /**
     * Assigns a role to a user (administrators only).
     * @param {import('../domain/model/user-id.js').UserId} userId
     * @param {Role} role
     * @returns {Promise<User|null>}
     */
    async function assignRole(userId, role) {
        clearErrors('assign-role');
        try {
            const response = await iamApi.assignRole(userId.value, role.type);
            const user = UserAssembler.toEntity(response.data);
            replaceUser(user);
            if (userId.equals(currentSession.value?.userId)) {
                currentUser.value = user;
                currentSession.value = currentSession.value.withRole(user.role);
            }
            return user;
        } catch (error) {
            addErrors('assign-role', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    /**
     * Updates the profile of a user: the own profile through the profile endpoint, anyone else's
     * through user administration. The stored user only changes once the API confirms.
     * @param {import('../domain/model/user-id.js').UserId} userId
     * @param {import('../domain/model/user-profile.js').UserProfile} profile
     * @returns {Promise<User|null>}
     */
    async function updateProfile(userId, profile) {
        clearErrors('update-profile');
        const user = userById(userId);
        if (!user) {
            addErrors('update-profile', ['api-errors.not-found']);
            return null;
        }
        const candidate = new User({id: user.id, email: user.email, profile, role: user.role, status: user.status});
        const resource = UserAssembler.toResource(candidate);
        const own = userId.equals(currentSession.value?.userId);
        try {
            const response = own ? await iamApi.updateProfile(resource) : await iamApi.updateUser(userId.value, resource);
            const updated = UserAssembler.toEntity(response.data);
            if (own) currentUser.value = updated;
            replaceUser(updated);
            return updated;
        } catch (error) {
            addErrors('update-profile', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    return {
        currentSession,
        currentUser,
        users,
        roles,
        permissions,
        usersLoaded,
        errors,
        sessionEndReason,
        isAuthenticated,
        clearErrors,
        hasErrors,
        hasPermission,
        userById,
        restoreSession,
        signIn,
        signUp,
        signOut,
        fetchUsers,
        registerUser,
        assignRole,
        updateProfile,
    };
});

export default useIamStore;

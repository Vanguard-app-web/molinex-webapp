import {UserId} from "./user-id.js";
import {AccessToken} from "./access-token.js";
import {Role} from "./role.js";

/**
 * Value Object for the active session: who is signed in, with which token and which role. It
 * never holds a password.
 */
export class AuthenticatedSession {
    #userId;
    #token;
    #role;

    /**
     * @param {{userId: UserId, token: AccessToken, role: Role}} props
     */
    constructor({userId, token, role}) {
        if (!(userId instanceof UserId)) throw new Error('A session requires the user id.');
        if (!(token instanceof AccessToken)) throw new Error('A session requires the access token.');
        if (!(role instanceof Role)) throw new Error('A session requires the role.');
        this.#userId = userId;
        this.#token = token;
        this.#role = role;
    }

    get userId() {
        return this.#userId;
    }

    get token() {
        return this.#token;
    }

    get role() {
        return this.#role;
    }

    isAuthenticated() {
        return Boolean(this.#token.value);
    }

    /** @param {string} permission a Permission. */
    allows(permission) {
        return this.#role.allows(permission);
    }

    /**
     * Same session with the role refreshed from the API (e.g. after an administrator changed it).
     * @param {Role} role
     */
    withRole(role) {
        return new AuthenticatedSession({userId: this.#userId, token: this.#token, role});
    }
}

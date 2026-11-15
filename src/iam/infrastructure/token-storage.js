import {AccessToken} from "../domain/model/access-token.js";

const STORAGE_KEY = 'molinex.iam.access-token';

/**
 * Storage Adapter that keeps the access token between page loads, so a reload recovers the session.
 * Only the token is stored, never a password. When the browser denies storage (private mode,
 * blocked site data) the token lives in memory and the session ends with the page.
 */
export class TokenStorage {
    #memoryToken = null;

    /** @param {AccessToken} token */
    save(token) {
        this.#memoryToken = token.value;
        try {
            globalThis.localStorage?.setItem(STORAGE_KEY, token.value);
        } catch {
            // Storage unavailable: the in-memory copy still serves this visit.
        }
    }

    /** @returns {AccessToken|null} */
    get() {
        let value = this.#memoryToken;
        try {
            value = globalThis.localStorage?.getItem(STORAGE_KEY) ?? value;
        } catch {
            // Storage unavailable: fall back to the in-memory copy.
        }
        return value ? new AccessToken(value) : null;
    }

    clear() {
        this.#memoryToken = null;
        try {
            globalThis.localStorage?.removeItem(STORAGE_KEY);
        } catch {
            // Storage unavailable: nothing persisted to remove.
        }
    }
}

/** The single storage adapter shared by the store and the interceptor. */
export const tokenStorage = new TokenStorage();

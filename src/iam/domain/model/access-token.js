/**
 * Value Object for the opaque bearer token issued on sign-in. It is a local demonstration token,
 * not a JWT: the application never reads its content.
 */
export class AccessToken {
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue) throw new Error('AccessToken requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** Never prints the token by accident, e.g. in logs or string interpolation. */
    toString() {
        return '[access token]';
    }

    toJSON() {
        return '[access token]';
    }
}

/**
 * Value Object that identifies a user. The API assigns it; the frontend never generates it.
 */
export class UserId {
    #value;

    /** @param {string|number} value */
    constructor(value) {
        const normalizedValue = String(value ?? '').trim();
        if (!normalizedValue) throw new Error('UserId requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {UserId} other */
    equals(other) {
        return other instanceof UserId && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

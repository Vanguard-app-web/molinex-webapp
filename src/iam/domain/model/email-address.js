/**
 * Value Object for an email address. Addresses are compared case-insensitively, so the value is
 * stored in lower case.
 */
export class EmailAddress {
    static MAX_LENGTH = 254;
    static #PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim().toLowerCase() : '';
        if (!EmailAddress.isValid(normalizedValue)) throw new Error('EmailAddress requires a valid email address.');
        this.#value = normalizedValue;
    }

    /**
     * @param {unknown} value a raw string, e.g. what a form holds.
     * @returns {boolean} true when it looks like an email address.
     */
    static isValid(value) {
        return typeof value === 'string'
            && value.trim().length <= EmailAddress.MAX_LENGTH
            && EmailAddress.#PATTERN.test(value.trim());
    }

    get value() {
        return this.#value;
    }

    isValid() {
        return EmailAddress.isValid(this.#value);
    }

    /** @param {EmailAddress} other */
    equals(other) {
        return other instanceof EmailAddress && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

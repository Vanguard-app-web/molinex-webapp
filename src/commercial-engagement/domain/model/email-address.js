/**
 * Value Object for the email address of a visitor. Addresses are compared case-insensitively, so
 * the value is stored in lower case. It has no length limit beyond the address format.
 */
export class EmailAddress {
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
        return typeof value === 'string' && EmailAddress.#PATTERN.test(value.trim());
    }

    get value() {
        return this.#value;
    }

    isValid() {
        return EmailAddress.isValid(this.#value);
    }

    toString() {
        return this.#value;
    }
}

/**
 * Value Object for the phone number of a user. It is optional: an empty value means "not provided".
 * A provided number may use digits, spaces and the usual punctuation, and holds between 7 and 15
 * digits (the E.164 maximum). The API applies the same check.
 */
export class PhoneNumber {
    static #CHARACTERS = /^\+?[0-9\s().-]+$/;
    #value;

    /** @param {string} [value] */
    constructor(value = '') {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (normalizedValue !== '' && !PhoneNumber.isValid(normalizedValue)) {
            throw new Error('PhoneNumber must contain between 7 and 15 digits.');
        }
        this.#value = normalizedValue;
    }

    /**
     * @param {unknown} value a raw string, e.g. what a form holds.
     * @returns {boolean} true when a provided number is well formed. Callers decide whether blank is allowed.
     */
    static isValid(value) {
        if (typeof value !== 'string' || !PhoneNumber.#CHARACTERS.test(value.trim())) return false;
        const digits = value.replace(/\D/g, '').length;
        return digits >= 7 && digits <= 15;
    }

    get value() {
        return this.#value;
    }

    isEmpty() {
        return this.#value === '';
    }

    toString() {
        return this.#value;
    }
}

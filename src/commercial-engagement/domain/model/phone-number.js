/**
 * Value Object for the optional phone number of a visitor. A number may use digits, spaces and the
 * usual punctuation, and holds between 7 and 15 digits (the E.164 maximum). The API applies the
 * same check. Absence is represented by not creating the Value Object (see ContactInformation).
 */
export class PhoneNumber {
    static #CHARACTERS = /^\+?[0-9\s().-]+$/;
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!PhoneNumber.isValid(normalizedValue)) throw new Error('PhoneNumber must contain between 7 and 15 digits.');
        this.#value = normalizedValue;
    }

    /**
     * @param {unknown} value a raw string, e.g. what a form holds.
     * @returns {boolean} true when a provided number is well formed. Callers treat a blank phone as "not provided".
     */
    static isValid(value) {
        if (typeof value !== 'string' || !PhoneNumber.#CHARACTERS.test(value.trim())) return false;
        const digits = value.replace(/\D/g, '').length;
        return digits >= 7 && digits <= 15;
    }

    get value() {
        return this.#value;
    }

    isValid() {
        return PhoneNumber.isValid(this.#value);
    }

    toString() {
        return this.#value;
    }
}

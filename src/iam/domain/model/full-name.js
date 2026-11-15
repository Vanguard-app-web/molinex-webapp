/**
 * Value Object for the full name of a user.
 */
export class FullName {
    static MAX_LENGTH = 100;
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue || normalizedValue.length > FullName.MAX_LENGTH) {
            throw new Error(`FullName must contain between 1 and ${FullName.MAX_LENGTH} characters.`);
        }
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    toString() {
        return this.#value;
    }
}

/**
 * Value Object for the company the visitor represents. It has no length limit.
 */
export class CompanyName {
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue) throw new Error('CompanyName requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {CompanyName} other */
    equals(other) {
        return other instanceof CompanyName && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

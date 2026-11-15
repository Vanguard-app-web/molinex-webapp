/**
 * Value Object for the full name of the person who asks for commercial contact. It has no length limit.
 */
export class FullName {
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue) throw new Error('FullName requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {FullName} other */
    equals(other) {
        return other instanceof FullName && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

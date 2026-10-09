/**
 * Value Object for the code that identifies a production batch on the mill floor, e.g. "LOT-2026-001".
 * Two codes are the same code regardless of letter case.
 */
export class BatchCode {
    static MAX_LENGTH = 50;
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue || normalizedValue.length > BatchCode.MAX_LENGTH) {
            throw new Error(`Batch code must contain between 1 and ${BatchCode.MAX_LENGTH} characters.`);
        }
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {BatchCode} other */
    equals(other) {
        return other instanceof BatchCode && other.value.toLowerCase() === this.#value.toLowerCase();
    }

    toString() {
        return this.#value;
    }
}

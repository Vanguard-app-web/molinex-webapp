/**
 * Value Object that identifies a production batch. The API assigns it; the frontend never generates it.
 */
export class ProductionBatchId {
    #value;

    /** @param {string|number} value */
    constructor(value) {
        const normalizedValue = String(value ?? '').trim();
        if (!normalizedValue) throw new Error('ProductionBatchId requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {ProductionBatchId} other */
    equals(other) {
        return other instanceof ProductionBatchId && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

/**
 * Value Object that identifies the production record (Production Management) a quality result or waste refers to. The API assigns it; the frontend never generates it.
 */
export class ProductionRecordId {
    #value;

    /** @param {string|number} value */
    constructor(value) {
        const normalizedValue = String(value ?? '').trim();
        if (!normalizedValue) throw new Error('ProductionRecordId requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {ProductionRecordId} other */
    equals(other) {
        return other instanceof ProductionRecordId && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

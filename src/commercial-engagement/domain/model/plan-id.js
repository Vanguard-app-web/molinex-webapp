/**
 * Value Object that identifies a plan. The API assigns it.
 */
export class PlanId {
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue) throw new Error('PlanId requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {PlanId} other */
    equals(other) {
        return other instanceof PlanId && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

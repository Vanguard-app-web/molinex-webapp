/**
 * Value Object for the name of a plan, exactly as the API publishes it.
 */
export class PlanName {
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue) throw new Error('PlanName requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {PlanName} other */
    equals(other) {
        return other instanceof PlanName && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

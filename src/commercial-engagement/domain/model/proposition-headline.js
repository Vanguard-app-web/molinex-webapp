/**
 * Value Object for the headline of the value proposition, exactly as the API publishes it.
 */
export class PropositionHeadline {
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue) throw new Error('PropositionHeadline requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {PropositionHeadline} other */
    equals(other) {
        return other instanceof PropositionHeadline && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

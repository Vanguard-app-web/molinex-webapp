/**
 * Value Object for the price text of a plan (e.g. a figure or a phrase). It is shown verbatim: the application never computes or reformats prices.
 */
export class PriceLabel {
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue) throw new Error('PriceLabel requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {PriceLabel} other */
    equals(other) {
        return other instanceof PriceLabel && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

/**
 * Value Object that identifies a commercial inquiry. The API assigns it when the inquiry is stored; the frontend never generates it.
 */
export class CommercialInquiryId {
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue) throw new Error('CommercialInquiryId requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {CommercialInquiryId} other */
    equals(other) {
        return other instanceof CommercialInquiryId && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

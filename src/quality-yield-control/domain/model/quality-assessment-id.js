/**
 * Value Object that identifies a quality assessment. The API assigns it; the frontend never generates it.
 */
export class QualityAssessmentId {
    #value;

    /** @param {string|number} value */
    constructor(value) {
        const normalizedValue = String(value ?? '').trim();
        if (!normalizedValue) throw new Error('QualityAssessmentId requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {QualityAssessmentId} other */
    equals(other) {
        return other instanceof QualityAssessmentId && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}

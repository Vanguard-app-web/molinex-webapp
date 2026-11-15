/**
 * Value Object for the moment the API stored a commercial inquiry. The API assigns it; the
 * frontend never invents it.
 */
export class SubmissionDateTime {
    #value;

    /** @param {Date|string} value a Date or an ISO 8601 string. */
    constructor(value) {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) throw new Error('SubmissionDateTime requires a valid date and time.');
        this.#value = date;
    }

    /** @returns {Date} a copy, so the Value Object stays immutable. */
    get value() {
        return new Date(this.#value.getTime());
    }
}
